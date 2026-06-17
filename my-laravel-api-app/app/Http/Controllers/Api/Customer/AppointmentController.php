<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\CustomerProfile;
use App\Models\LawyerProfile;
use App\Models\Notification;
use App\Models\Review;
use App\Services\AvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Khách hàng quản lý lịch hẹn của mình: đặt lịch, xem danh sách, hủy, đánh giá.
 * Mọi hành động đều sinh thông báo (notifications) cho luật sư và/hoặc khách.
 */
class AppointmentController extends Controller
{
    /** GET /api/customer/appointments?status= — danh sách lịch hẹn của tôi */
    public function index(Request $request)
    {
        $customer = $this->customerProfile($request);

        $query = $customer->appointments()
            ->with([
                'lawyerProfile.user:id,name,phone',
                'lawyerProfile.city:id,name',
                'review',
            ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query
            ->orderByDesc('appointment_date')
            ->orderByDesc('start_time')
            ->get()
            ->map(fn ($a) => [
                'id'               => $a->id,
                'lawyer_id'        => $a->lawyer_profile_id,
                'lawyer_name'      => $a->lawyerProfile?->user?->name,
                'lawyer_phone'     => $a->lawyerProfile?->user?->phone,
                'lawyer_city'      => $a->lawyerProfile?->city?->name,
                'appointment_date' => $a->appointment_date?->toDateString(),
                'start_time'       => substr($a->start_time, 0, 5),
                'end_time'         => substr($a->end_time, 0, 5),
                'status'           => $a->status,
                'customer_note'    => $a->customer_note,
                'cancel_reason'    => $a->cancel_reason,
                'has_review'       => $a->review !== null,
                'can_review'       => $a->status === 'completed' && $a->review === null,
            ]);
    }

    /** POST /api/customer/appointments — đặt lịch hẹn mới */
    public function store(Request $request, AvailabilityService $availability)
    {
        $customer = $this->customerProfile($request);

        $data = $request->validate([
            'lawyer_profile_id' => 'required|exists:lawyer_profiles,id',
            'appointment_date'  => 'required|date|after_or_equal:today',
            'start_time'        => 'required|date_format:H:i',
            'end_time'          => 'nullable|date_format:H:i|after:start_time',
            'customer_note'     => 'nullable|string|max:1000',
        ]);

        $lawyer = LawyerProfile::where('approval_status', 'approved')->find($data['lawyer_profile_id']);
        if (! $lawyer) {
            return response()->json(['message' => 'Luật sư không khả dụng.'], 422);
        }

        $date  = Carbon::parse($data['appointment_date'])->startOfDay();
        $start = substr($data['start_time'], 0, 5);

        // Khoảng đặt: 1 block (mặc định) hoặc nhiều block 60' liên tiếp (gửi kèm end_time).
        $slot     = AvailabilityService::SLOT_MINUTES;
        $maxBlocks = 3;                                  // tối đa 3 tiếng liên tiếp
        $startMin = $availability->toMinutes($start);
        $endMin   = isset($data['end_time'])
            ? $availability->toMinutes(substr($data['end_time'], 0, 5))
            : $startMin + $slot;
        $end      = $availability->fromMinutes($endMin);
        $duration = $endMin - $startMin;

        // Khoảng phải là bội số của slot và không vượt giới hạn
        if ($duration <= 0 || $duration % $slot !== 0) {
            return response()->json(['message' => 'Khoảng giờ đã chọn không hợp lệ.'], 422);
        }
        if ($duration > $slot * $maxBlocks) {
            return response()->json(['message' => "Chỉ được đặt tối đa {$maxBlocks} tiếng liên tiếp."], 422);
        }

        return DB::transaction(function () use ($availability, $customer, $lawyer, $date, $start, $end, $startMin, $endMin, $slot, $duration, $data) {
            // Mọi block 60' trong khoảng đều phải hợp lệ & còn trống
            for ($m = $startMin; $m < $endMin; $m += $slot) {
                if (! $availability->isSlotBookable($lawyer, $date, $availability->fromMinutes($m))) {
                    return response()->json(['message' => 'Một trong các khung giờ đã chọn không còn trống hoặc không hợp lệ.'], 422);
                }
            }

            // Chặn chồng lấn với lịch đang chờ/đã xác nhận (phòng race nhẹ)
            $overlap = Appointment::where('lawyer_profile_id', $lawyer->id)
                ->whereDate('appointment_date', $date->toDateString())
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('start_time', '<', $end . ':00')
                ->where('end_time', '>', $start . ':00')
                ->exists();
            if ($overlap) {
                return response()->json(['message' => 'Khung giờ này vừa có người đặt.'], 422);
            }

            // Bản ghi availability bao trùm cả khoảng đã chọn (để truy vết)
            $cover = $availability->findCoveringAvailability($lawyer, $date, $start, $duration);

            $appointment = Appointment::create([
                'customer_id'       => $customer->id,
                'lawyer_profile_id' => $lawyer->id,
                'availability_id'   => $cover?->id,
                'appointment_date'  => $date->toDateString(),
                'start_time'        => $start,
                'end_time'          => $end,
                'status'            => 'pending',
                'customer_note'     => $data['customer_note'] ?? null,
            ]);

            $when = $date->format('d/m/Y') . ' lúc ' . $start . '–' . $end;

            // Thông báo cho luật sư
            $this->notify(
                $lawyer->user_id,
                'appointment_booked',
                'Có lịch hẹn mới',
                "Khách hàng {$customer->user->name} đã đặt lịch hẹn ngày {$when}."
            );

            // Thông báo xác nhận cho khách
            $this->notify(
                $customer->user_id,
                'appointment_created',
                'Đã gửi yêu cầu đặt lịch',
                "Bạn đã đặt lịch hẹn ngày {$when}, đang chờ luật sư xác nhận."
            );

            return response()->json([
                'message' => 'Đã đặt lịch hẹn, đang chờ luật sư xác nhận.',
                'data'    => [
                    'id'               => $appointment->id,
                    'appointment_date' => $date->toDateString(),
                    'start_time'       => $start,
                    'end_time'         => $end,
                    'status'           => $appointment->status,
                ],
            ], 201);
        });
    }

    /** PATCH /api/customer/appointments/{appointment}/cancel — khách hủy lịch của mình */
    public function cancel(Request $request, Appointment $appointment)
    {
        $customer = $this->customerProfile($request);

        if ($appointment->customer_id !== $customer->id) {
            return response()->json(['message' => 'Không có quyền.'], 403);
        }

        if (! in_array($appointment->status, ['pending', 'confirmed'], true)) {
            return response()->json(['message' => 'Chỉ hủy được lịch đang chờ hoặc đã xác nhận.'], 422);
        }

        $data = $request->validate([
            'cancel_reason' => 'nullable|string|max:255',
        ]);

        $appointment->update([
            'status'        => 'cancelled',
            'cancel_reason' => $data['cancel_reason'] ?? 'Khách hàng hủy lịch.',
        ]);

        $when = $appointment->appointment_date->format('d/m/Y') . ' lúc ' . substr($appointment->start_time, 0, 5);

        // Báo cho luật sư biết khách đã hủy
        $this->notify(
            $appointment->lawyerProfile->user_id,
            'appointment_cancelled',
            'Lịch hẹn bị hủy',
            "Khách hàng {$customer->user->name} đã hủy lịch hẹn ngày {$when}."
        );

        return response()->json(['message' => 'Đã hủy lịch hẹn.']);
    }

    /** POST /api/customer/appointments/{appointment}/review — đánh giá sau buổi tư vấn */
    public function review(Request $request, Appointment $appointment)
    {
        $customer = $this->customerProfile($request);

        if ($appointment->customer_id !== $customer->id) {
            return response()->json(['message' => 'Không có quyền.'], 403);
        }

        if ($appointment->status !== 'completed') {
            return response()->json(['message' => 'Chỉ đánh giá được lịch hẹn đã hoàn thành.'], 422);
        }

        if ($appointment->review()->exists()) {
            return response()->json(['message' => 'Lịch hẹn này đã được đánh giá.'], 422);
        }

        $data = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = DB::transaction(function () use ($appointment, $customer, $data) {
            $review = Review::create([
                'appointment_id'    => $appointment->id,
                'customer_id'       => $customer->id,
                'lawyer_profile_id' => $appointment->lawyer_profile_id,
                'rating'            => $data['rating'],
                'comment'           => $data['comment'] ?? null,
            ]);

            // Tính lại điểm trung bình của luật sư
            $avg = Review::where('lawyer_profile_id', $appointment->lawyer_profile_id)->avg('rating');
            LawyerProfile::whereKey($appointment->lawyer_profile_id)
                ->update(['rating_avg' => round((float) $avg, 1)]);

            // Báo cho luật sư có đánh giá mới
            $this->notify(
                $appointment->lawyerProfile->user_id,
                'review_received',
                'Bạn nhận được đánh giá mới',
                "Khách hàng {$customer->user->name} đã đánh giá {$data['rating']} sao."
            );

            return $review;
        });

        return response()->json([
            'message' => 'Cảm ơn bạn đã đánh giá.',
            'data'    => [
                'id'      => $review->id,
                'rating'  => $review->rating,
                'comment' => $review->comment,
            ],
        ], 201);
    }

    /** Lấy (hoặc tạo) hồ sơ khách hàng của user hiện tại. */
    private function customerProfile(Request $request): CustomerProfile
    {
        return $request->user()->customerProfile
            ?? CustomerProfile::create(['user_id' => $request->user()->id]);
    }

    /** Tạo nhanh 1 thông báo cá nhân. */
    private function notify(int $userId, string $type, string $title, string $message): void
    {
        Notification::create([
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'is_read' => false,
        ]);
    }
}
