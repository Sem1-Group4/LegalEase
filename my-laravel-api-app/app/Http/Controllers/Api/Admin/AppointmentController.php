<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

/**
 * Admin giám sát toàn bộ lịch hẹn của hệ thống.
 * Admin có quyền xem tất cả và hủy bất kỳ lịch hẹn nào.
 */
class AppointmentController extends Controller
{
    /** GET /api/admin/appointments?status=&date= — danh sách tất cả lịch hẹn */
    public function index(Request $request)
    {
        $query = Appointment::query()
            ->with([
                'customer.user:id,name,email',
                'lawyerProfile.user:id,name,email',
            ]);

        // Lọc theo trạng thái (pending/confirmed/cancelled/completed...)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Lọc theo ngày hẹn
        if ($request->filled('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        $appointments = $query
            ->orderBy('appointment_date', 'desc')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($a) => [
                'id'               => $a->id,
                'khach_hang'       => $a->customer?->user?->name,
                'luat_su'          => $a->lawyerProfile?->user?->name,
                'appointment_date' => $a->appointment_date?->toDateString(),
                'start_time'       => substr($a->start_time, 0, 5),
                'end_time'         => substr($a->end_time, 0, 5),
                'status'           => $a->status,
                'customer_note'    => $a->customer_note,
                'cancel_reason'    => $a->cancel_reason,
            ]);

        return $appointments;
    }

    /** GET /api/admin/appointments/{appointment} — chi tiết một lịch hẹn */
    public function show(Appointment $appointment)
    {
        $appointment->load([
            'customer.user:id,name,email,phone',
            'lawyerProfile.user:id,name,email,phone',
        ]);

        return [
            'id'               => $appointment->id,
            'khach_hang'       => $appointment->customer?->user?->name,
            'khach_hang_email' => $appointment->customer?->user?->email,
            'luat_su'          => $appointment->lawyerProfile?->user?->name,
            'luat_su_email'    => $appointment->lawyerProfile?->user?->email,
            'appointment_date' => $appointment->appointment_date?->toDateString(),
            'start_time'       => substr($appointment->start_time, 0, 5),
            'end_time'         => substr($appointment->end_time, 0, 5),
            'status'           => $appointment->status,
            'customer_note'    => $appointment->customer_note,
            'cancel_reason'    => $appointment->cancel_reason,
        ];
    }

    /** PATCH /api/admin/appointments/{appointment}/cancel — admin hủy lịch hẹn */
    public function cancel(Request $request, Appointment $appointment)
    {
        // Không hủy lịch đã hoàn thành hoặc đã hủy trước đó
        if (in_array($appointment->status, ['completed', 'cancelled'])) {
            return response()->json([
                'message' => 'Không thể hủy lịch hẹn đã hoàn thành hoặc đã hủy.',
            ], 422);
        }

        $data = $request->validate([
            'cancel_reason' => 'nullable|string|max:255',
        ]);

        $appointment->update([
            'status'        => 'cancelled',
            'cancel_reason' => $data['cancel_reason'] ?? 'Hủy bởi quản trị viên.',
        ]);

        return response()->json(['message' => 'Đã hủy lịch hẹn.']);
    }
}