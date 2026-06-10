<?php

namespace App\Http\Controllers\Api\Lawyer;

use App\Http\Controllers\Controller;
use App\Models\LawyerAvailability;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

/**
 * Luật sư quản lý khung giờ rảnh của mình.
 * 2 kiểu slot:
 *  - Lịch lặp: available_date = NULL, có repeat_from/repeat_to (áp dụng mỗi ngày trong khoảng).
 *  - Slot cụ thể: available_date có giá trị (chỉ ngày đó).
 */
class AvailabilityController extends Controller
{
    /** GET /api/lawyer/availabilities  — danh sách slot của luật sư hiện tại */
    public function index(Request $request)
    {
        $profile = $request->user()->lawyerProfile;
        if (! $profile) {
            return response()->json(['message' => 'Chưa có hồ sơ luật sư.'], 404);
        }

        return $profile->availabilities()
            ->orderByRaw('available_date IS NULL')   // slot có ngày cụ thể lên trước
            ->orderBy('available_date')
            ->orderBy('start_time')
            ->get();
    }

    /** POST /api/lawyer/availabilities  — tạo slot mới */
    public function store(Request $request)
    {
        $profile = $request->user()->lawyerProfile;
        if (! $profile) {
            return response()->json(['message' => 'Chưa có hồ sơ luật sư.'], 404);
        }

        $data = $request->validate([
            'type'           => 'required|in:specific,recurring',
            'start_time'     => 'required|date_format:H:i',
            'end_time'       => 'required|date_format:H:i|after:start_time',
            // Slot cụ thể
            'available_date' => 'required_if:type,specific|nullable|date|after_or_equal:today',
            // Lịch lặp
            'repeat_from'    => 'required_if:type,recurring|nullable|date',
            'repeat_to'      => 'required_if:type,recurring|nullable|date|after_or_equal:repeat_from',
        ]);

        // Chuẩn hóa dữ liệu theo từng kiểu
        if ($data['type'] === 'specific') {
            $payload = [
                'available_date' => $data['available_date'],
                'repeat_from'    => null,
                'repeat_to'      => null,
            ];
        } else {
            $payload = [
                'available_date' => null,
                'repeat_from'    => $data['repeat_from'],
                'repeat_to'      => $data['repeat_to'],
            ];
        }

        $payload['start_time'] = $data['start_time'];
        $payload['end_time']   = $data['end_time'];
        $payload['status']     = 'available';

        $slot = $profile->availabilities()->create($payload);

        return response()->json([
            'message' => 'Đã tạo khung giờ rảnh.',
            'data'    => $slot,
        ], 201);
    }

    /**
     * PUT /api/lawyer/availabilities/{availability}
     * Sửa giờ / ngày của một slot. Chỉ sửa được slot của chính mình
     * và slot chưa có người đặt (status != booked).
     */
    public function update(Request $request, LawyerAvailability $availability)
    {
        $profile = $request->user()->lawyerProfile;

        if (! $profile || $availability->lawyer_profile_id !== $profile->id) {
            return response()->json(['message' => 'Không có quyền.'], 403);
        }

        if ($availability->status === 'booked') {
            return response()->json(['message' => 'Không thể sửa khung giờ đã có người đặt.'], 422);
        }

        $data = $request->validate([
            'start_time'     => 'sometimes|date_format:H:i',
            'end_time'       => 'sometimes|date_format:H:i',
            'available_date' => 'sometimes|nullable|date',
            'repeat_from'    => 'sometimes|nullable|date',
            'repeat_to'      => 'sometimes|nullable|date',
        ]);

        // Gộp dữ liệu mới với cũ để kiểm tra logic giờ
        $start = $data['start_time'] ?? substr($availability->start_time, 0, 5);
        $end   = $data['end_time']   ?? substr($availability->end_time, 0, 5);

        if ($end <= $start) {
            return response()->json(['message' => 'Giờ kết thúc phải sau giờ bắt đầu.'], 422);
        }

        $availability->update($data);

        return response()->json([
            'message' => 'Đã cập nhật khung giờ.',
            'data'    => $availability->fresh(),
        ]);
    }

    /** DELETE /api/lawyer/availabilities/{availability} */
    public function destroy(Request $request, LawyerAvailability $availability)
    {
        $profile = $request->user()->lawyerProfile;

        if (! $profile || $availability->lawyer_profile_id !== $profile->id) {
            return response()->json(['message' => 'Không có quyền.'], 403);
        }

        if ($availability->status === 'booked') {
            return response()->json(['message' => 'Không thể xóa khung giờ đã có người đặt.'], 422);
        }

        $availability->delete();

        return response()->json(['message' => 'Đã xóa khung giờ.']);
    }

    /**
     * GET /api/lawyer/availabilities/slots?date=2026-06-15
     * Trả về các KHOẢNG còn trống của luật sư trong 1 ngày (Kiểu 2).
     * = các khoảng rảnh, sau khi khoét đi những đoạn đã có cuộc hẹn,
     *   và gộp các khoảng chồng nhau.
     */
    public function availableSlots(Request $request)
    {
        $profile = $request->user()->lawyerProfile;
        if (! $profile) {
            return response()->json(['message' => 'Chưa có hồ sơ luật sư.'], 404);
        }

        $data = $request->validate([
            'date' => 'required|date',
        ]);

        $date = Carbon::parse($data['date'])->startOfDay();
        $dateStr = $date->toDateString();

        // 1) Các khoảng rảnh áp dụng cho ngày này (status = available)
        $ranges = $profile->availabilities()
            ->where('status', 'available')
            ->where(function ($q) use ($dateStr) {
                $q->whereDate('available_date', $dateStr)
                  ->orWhere(function ($q2) use ($dateStr) {
                      $q2->whereNull('available_date')
                         ->whereDate('repeat_from', '<=', $dateStr)
                         ->whereDate('repeat_to', '>=', $dateStr);
                  });
            })
            ->get(['start_time', 'end_time']);

        if ($ranges->isEmpty()) {
            return ['date' => $dateStr, 'free_ranges' => []];
        }

        // 2) Các đoạn đã bị đặt (cuộc hẹn chưa hủy)
        $busy = Appointment::where('lawyer_profile_id', $profile->id)
            ->whereDate('appointment_date', $dateStr)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get(['start_time', 'end_time'])
            ->map(fn ($a) => [
                'start' => $this->toMinutes($a->start_time),
                'end'   => $this->toMinutes($a->end_time),
            ])
            ->sortBy('start')
            ->values()
            ->all();

        // 3) Khoét các đoạn busy ra khỏi mỗi khoảng rảnh
        $freeRanges = [];
        foreach ($ranges as $range) {
            $rStart = $this->toMinutes($range->start_time);
            $rEnd   = $this->toMinutes($range->end_time);

            $cursor = $rStart;
            foreach ($busy as $b) {
                if ($b['end'] <= $rStart || $b['start'] >= $rEnd) {
                    continue;
                }
                if ($b['start'] > $cursor) {
                    $freeRanges[] = ['start' => $cursor, 'end' => min($b['start'], $rEnd)];
                }
                $cursor = max($cursor, $b['end']);
            }
            if ($cursor < $rEnd) {
                $freeRanges[] = ['start' => $cursor, 'end' => $rEnd];
            }
        }

        // 4) Nếu là hôm nay: cắt bỏ phần đã qua giờ hiện tại
        if ($date->isToday()) {
            $nowMin = (int) (now()->hour * 60 + now()->minute);
            $freeRanges = array_filter($freeRanges, fn ($r) => $r['end'] > $nowMin);
            $freeRanges = array_map(function ($r) use ($nowMin) {
                $r['start'] = max($r['start'], $nowMin);
                return $r;
            }, $freeRanges);
        }

        // 5) Gộp khoảng chồng nhau, rồi đổi về "HH:MM"
        $freeRanges = array_values(array_filter($freeRanges, fn ($r) => $r['end'] > $r['start']));
        $freeRanges = $this->mergeRanges($freeRanges);

        $result = collect($freeRanges)
            ->map(fn ($r) => [
                'start' => $this->fromMinutes($r['start']),
                'end'   => $this->fromMinutes($r['end']),
            ])
            ->values();

        return [
            'date'        => $dateStr,
            'free_ranges' => $result,
        ];
    }

    /** Gộp các khoảng [start,end] (phút) bị chồng/liền nhau thành khoảng lớn. */
    private function mergeRanges(array $ranges): array
    {
        if (empty($ranges)) return [];

        usort($ranges, fn ($a, $b) => $a['start'] <=> $b['start']);

        $merged = [array_shift($ranges)];
        foreach ($ranges as $r) {
            $last = &$merged[count($merged) - 1];
            if ($r['start'] <= $last['end']) {
                $last['end'] = max($last['end'], $r['end']);
            } else {
                $merged[] = $r;
            }
            unset($last);
        }
        return $merged;
    }

    /** Đổi "HH:MM:SS" hoặc "HH:MM" -> số phút từ 0h. */
    private function toMinutes(string $time): int
    {
        [$h, $m] = array_pad(explode(':', $time), 2, 0);
        return (int) $h * 60 + (int) $m;
    }

    /** Đổi số phút -> "HH:MM". */
    private function fromMinutes(int $minutes): string
    {
        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }
}