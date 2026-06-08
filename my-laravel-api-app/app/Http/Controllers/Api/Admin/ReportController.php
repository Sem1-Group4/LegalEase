<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\LawyerProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Admin báo cáo & thống kê tổng quan.
 */
class ReportController extends Controller
{
    /**
     * GET /api/admin/reports/overview
     * Các con số tổng quan cho dashboard admin.
     */
    public function overview()
    {
        return [
            'tong_luat_su'    => LawyerProfile::count(),
            'luat_su_cho_duyet' => LawyerProfile::where('approval_status', 'pending')->count(),
            'luat_su_da_duyet'  => LawyerProfile::where('approval_status', 'approved')->count(),
            'tong_khach_hang' => User::where('role', 'customer')->count(),
            'tong_cuoc_hen'   => Appointment::count(),
            'cuoc_hen_theo_trang_thai' => Appointment::select('status', DB::raw('count(*) as so_luong'))
                ->groupBy('status')
                ->pluck('so_luong', 'status'),
        ];
    }

    /**
     * GET /api/admin/reports/lawyers-by-city
     * Số luật sư theo từng thành phố.
     */
    public function lawyersByCity()
    {
        return LawyerProfile::select('cities.name as thanh_pho', DB::raw('count(*) as so_luat_su'))
            ->join('cities', 'lawyer_profiles.city_id', '=', 'cities.id')
            ->groupBy('cities.id', 'cities.name')
            ->orderByDesc('so_luat_su')
            ->get();
    }
}