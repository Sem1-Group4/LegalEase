<?php

namespace App\Http\Controllers\Api\Lawyer;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

/**
 * Dashboard tổng quan cho luật sư đang đăng nhập.
 */
class DashboardController extends Controller
{
    /**
     * GET /api/lawyer/dashboard
     * Các con số tổng quan của riêng luật sư này.
     */
    public function index(Request $request)
    {
        $profile = $request->user()->lawyerProfile;

        if (! $profile) {
            return response()->json(['message' => 'Chưa có hồ sơ luật sư.'], 404);
        }

        $base = Appointment::where('lawyer_profile_id', $profile->id);

        return [
            'ho_so' => [
                'id'              => $profile->id,
                'approval_status' => $profile->approval_status,
                'is_verified'     => $profile->is_verified,
                'rating_avg'      => $profile->rating_avg,
            ],
            'tong_cuoc_hen' => (clone $base)->count(),
            'cho_xac_nhan'  => (clone $base)->where('status', 'pending')->count(),
            'da_xac_nhan'   => (clone $base)->where('status', 'confirmed')->count(),
            'da_hoan_thanh' => (clone $base)->where('status', 'completed')->count(),
            'cuoc_hen_sap_toi' => (clone $base)
                ->whereIn('status', ['pending', 'confirmed'])
                ->whereDate('appointment_date', '>=', now()->toDateString())
                ->orderBy('appointment_date')
                ->limit(5)
                ->get(['id', 'appointment_date', 'start_time', 'end_time', 'status', 'customer_id']),
        ];
    }
}