<?php

namespace App\Http\Controllers\Api\Lawyer;

use App\Http\Controllers\Controller;
use App\Models\LawyerAvailability;
use App\Services\AvailabilityService;
use Illuminate\Http\Request;
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
    public function availableSlots(Request $request, AvailabilityService $availability)
    {
        $profile = $request->user()->lawyerProfile;
        if (! $profile) {
            return response()->json(['message' => 'Chưa có hồ sơ luật sư.'], 404);
        }

        $data = $request->validate([
            'date' => 'required|date',
        ]);

        $date = Carbon::parse($data['date'])->startOfDay();

        return [
            'date'        => $date->toDateString(),
            'free_ranges' => $availability->freeRangesFormatted($profile, $date),
        ];
    }
}