<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\LawyerAvailability;
use App\Models\LawyerProfile;
use Carbon\Carbon;

/**
 * Tính khung giờ rảnh của luật sư trong 1 ngày.
 *
 * Dùng chung cho:
 *  - Luật sư xem lịch rảnh của mình (Lawyer\AvailabilityController).
 *  - Khách hàng xem slot có thể đặt (Public/Customer).
 *
 * Quy ước slot đặt lịch: chia cố định theo SLOT_MINUTES (mặc định 60 phút).
 */
class AvailabilityService
{
    /** Độ dài 1 slot đặt lịch (phút). */
    public const SLOT_MINUTES = 60;

    /**
     * Các KHOẢNG còn trống của luật sư trong 1 ngày (đơn vị: phút từ 0h),
     * đã khoét bỏ các đoạn đã có cuộc hẹn và gộp khoảng chồng nhau.
     *
     * @return array<int, array{start:int, end:int}>
     */
    public function freeRanges(LawyerProfile $profile, Carbon $date): array
    {
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
            return [];
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
        $free = [];
        foreach ($ranges as $range) {
            $rStart = $this->toMinutes($range->start_time);
            $rEnd   = $this->toMinutes($range->end_time);

            $cursor = $rStart;
            foreach ($busy as $b) {
                if ($b['end'] <= $rStart || $b['start'] >= $rEnd) {
                    continue;
                }
                if ($b['start'] > $cursor) {
                    $free[] = ['start' => $cursor, 'end' => min($b['start'], $rEnd)];
                }
                $cursor = max($cursor, $b['end']);
            }
            if ($cursor < $rEnd) {
                $free[] = ['start' => $cursor, 'end' => $rEnd];
            }
        }

        // 4) Nếu là hôm nay: cắt bỏ phần đã qua giờ hiện tại
        if ($date->isToday()) {
            $nowMin = (int) (now()->hour * 60 + now()->minute);
            $free = array_filter($free, fn ($r) => $r['end'] > $nowMin);
            $free = array_map(function ($r) use ($nowMin) {
                $r['start'] = max($r['start'], $nowMin);
                return $r;
            }, $free);
        }

        // 5) Gộp khoảng chồng/liền nhau
        $free = array_values(array_filter($free, fn ($r) => $r['end'] > $r['start']));

        return $this->mergeRanges($free);
    }

    /**
     * Như freeRanges() nhưng trả về dạng "HH:MM" cho client.
     *
     * @return array<int, array{start:string, end:string}>
     */
    public function freeRangesFormatted(LawyerProfile $profile, Carbon $date): array
    {
        return array_map(fn ($r) => [
            'start' => $this->fromMinutes($r['start']),
            'end'   => $this->fromMinutes($r['end']),
        ], $this->freeRanges($profile, $date));
    }

    /**
     * Danh sách slot CỐ ĐỊNH (mặc định 60') có thể đặt trong ngày.
     * Mỗi khoảng rảnh được cắt thành các slot liên tiếp; phần dư < 1 slot bị bỏ.
     *
     * @return array<int, array{start:string, end:string}>
     */
    public function bookableSlots(LawyerProfile $profile, Carbon $date, int $slotMinutes = self::SLOT_MINUTES): array
    {
        $slots = [];
        foreach ($this->freeRanges($profile, $date) as $r) {
            // Căn điểm bắt đầu về lưới cố định (bội số slotMinutes từ 0h) để giờ
            // luôn tròn (08:00, 09:00…). Với hôm nay, freeRanges đã cắt theo giờ
            // hiện tại nên start có thể lẻ (vd 10:47) -> làm tròn LÊN slot kế tiếp.
            $start = (int) ceil($r['start'] / $slotMinutes) * $slotMinutes;
            for ($s = $start; $s + $slotMinutes <= $r['end']; $s += $slotMinutes) {
                $slots[] = [
                    'start' => $this->fromMinutes($s),
                    'end'   => $this->fromMinutes($s + $slotMinutes),
                ];
            }
        }

        return $slots;
    }

    /**
     * Slot bắt đầu lúc $startTime (HH:MM) có hợp lệ & còn trống không?
     * Hợp lệ = nằm đúng trong danh sách slot cố định đặt được.
     */
    public function isSlotBookable(LawyerProfile $profile, Carbon $date, string $startTime, int $slotMinutes = self::SLOT_MINUTES): bool
    {
        $start = substr($startTime, 0, 5);

        foreach ($this->bookableSlots($profile, $date, $slotMinutes) as $slot) {
            if ($slot['start'] === $start) {
                return true;
            }
        }

        return false;
    }

    /**
     * Tìm bản ghi availability bao trùm slot [$startTime, +slot] trong ngày
     * (để gắn availability_id cho cuộc hẹn — phục vụ truy vết). Null nếu không có.
     */
    public function findCoveringAvailability(LawyerProfile $profile, Carbon $date, string $startTime, int $slotMinutes = self::SLOT_MINUTES): ?LawyerAvailability
    {
        $dateStr   = $date->toDateString();
        $slotStart = $this->toMinutes($startTime);
        $slotEnd   = $slotStart + $slotMinutes;

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
            ->get();

        foreach ($ranges as $range) {
            if ($this->toMinutes($range->start_time) <= $slotStart
                && $this->toMinutes($range->end_time) >= $slotEnd) {
                return $range;
            }
        }

        return null;
    }

    /** Gộp các khoảng [start,end] (phút) bị chồng/liền nhau thành khoảng lớn. */
    private function mergeRanges(array $ranges): array
    {
        if (empty($ranges)) {
            return [];
        }

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
    public function toMinutes(string $time): int
    {
        [$h, $m] = array_pad(explode(':', $time), 2, 0);
        return (int) $h * 60 + (int) $m;
    }

    /** Đổi số phút -> "HH:MM". */
    public function fromMinutes(int $minutes): string
    {
        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }
}
