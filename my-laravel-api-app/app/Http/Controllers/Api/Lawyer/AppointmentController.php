<?php

namespace App\Http\Controllers\Api\Lawyer;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Quản lý lịch hẹn dành cho luật sư đang đăng nhập.
 * Luật sư chỉ thao tác được trên lịch hẹn của chính mình.
 */
class AppointmentController extends Controller
{
    /** Lấy lawyer_profile của luật sư đang đăng nhập (hoặc báo lỗi nếu chưa có). */
    private function profileOrFail(Request $request)
    {
        $profile = $request->user()->lawyerProfile;
        if (! $profile) {
            abort(response()->json(['message' => 'Chưa có hồ sơ luật sư.'], 404));
        }
        return $profile;
    }

    /**
     * GET /api/lawyer/appointments?status=
     * Danh sách lịch hẹn của luật sư đang đăng nhập.
     */
    public function index(Request $request)
    {
        $profile = $this->profileOrFail($request);

        $query = Appointment::where('lawyer_profile_id', $profile->id)
            ->with(['customer.user:id,name,phone'])
            ->orderByDesc('appointment_date')
            ->orderByDesc('start_time');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->get();

        return $appointments->map(fn ($a) => [
            'id'               => $a->id,
            'khach_hang'       => $a->customer?->user?->name,
            'so_dien_thoai'    => $a->customer?->user?->phone,
            'appointment_date' => $a->appointment_date?->toDateString(),
            'start_time'       => substr($a->start_time, 0, 5),
            'end_time'         => substr($a->end_time, 0, 5),
            'status'           => $a->status,
            'customer_note'    => $a->customer_note,
            'cancel_reason'    => $a->cancel_reason,
        ]);
    }

    /**
     * PATCH /api/lawyer/appointments/{appointment}/confirm
     * Xác nhận lịch: pending -> confirmed.
     */
    public function confirm(Request $request, Appointment $appointment)
    {
        $this->authorizeOwner($request, $appointment);

        if ($appointment->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Chỉ xác nhận được lịch đang chờ xác nhận.'],
            ]);
        }

        $appointment->update(['status' => 'confirmed']);

        return response()->json(['message' => 'Đã xác nhận lịch hẹn.']);
    }

    /**
     * PATCH /api/lawyer/appointments/{appointment}/complete
     * Hoàn thành lịch: confirmed -> completed.
     */
    public function complete(Request $request, Appointment $appointment)
    {
        $this->authorizeOwner($request, $appointment);

        if ($appointment->status !== 'confirmed') {
            throw ValidationException::withMessages([
                'status' => ['Chỉ hoàn thành được lịch đã xác nhận.'],
            ]);
        }

        $appointment->update(['status' => 'completed']);

        return response()->json(['message' => 'Đã đánh dấu hoàn thành.']);
    }

    /**
     * PATCH /api/lawyer/appointments/{appointment}/cancel
     * Hủy lịch: chặn nếu đã hoàn thành hoặc đã hủy.
     */
    public function cancel(Request $request, Appointment $appointment)
    {
        $this->authorizeOwner($request, $appointment);

        if (in_array($appointment->status, ['completed', 'cancelled'])) {
            throw ValidationException::withMessages([
                'status' => ['Không thể hủy lịch đã hoàn thành hoặc đã hủy.'],
            ]);
        }

        $data = $request->validate([
            'cancel_reason' => 'nullable|string|max:255',
        ]);

        $appointment->update([
            'status'        => 'cancelled',
            'cancel_reason' => $data['cancel_reason'] ?? null,
        ]);

        return response()->json(['message' => 'Đã hủy lịch hẹn.']);
    }

    /** Đảm bảo lịch hẹn thuộc về luật sư đang đăng nhập (chặn thao tác lịch người khác). */
    private function authorizeOwner(Request $request, Appointment $appointment): void
    {
        $profile = $this->profileOrFail($request);
        if ($appointment->lawyer_profile_id !== $profile->id) {
            abort(403, 'Không có quyền thao tác lịch hẹn này.');
        }
    }
}