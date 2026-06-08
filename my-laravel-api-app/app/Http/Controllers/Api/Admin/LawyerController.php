<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LawyerProfile;
use Illuminate\Http\Request;

/**
 * Admin quản lý & duyệt hồ sơ luật sư.
 */
class LawyerController extends Controller
{
    /**
     * GET /api/admin/lawyers?status=pending
     * Danh sách luật sư, lọc theo trạng thái duyệt (pending/approved/rejected).
     */
    public function index(Request $request)
    {
        $query = LawyerProfile::query()
            ->with(['user:id,name,email,phone,status', 'city:id,name', 'specializations:id,name']);

        if ($request->filled('status')) {
            $query->where('approval_status', $request->status);
        }

        $lawyers = $query->orderByDesc('id')->get();

        return $lawyers->map(fn ($l) => [
            'id'               => $l->id,
            'name'             => $l->user->name,
            'email'            => $l->user->email,
            'phone'            => $l->user->phone,
            'city'             => $l->city?->name,
            'experience_years' => $l->experience_years,
            'license_number'   => $l->license_number,
            'approval_status'  => $l->approval_status,
            'is_verified'      => $l->is_verified,
            'account_status'   => $l->user->status,
            'specializations'  => $l->specializations->pluck('name'),
        ]);
    }

    /**
     * PATCH /api/admin/lawyers/{lawyer}/approve
     * Duyệt hồ sơ + đánh dấu đã xác minh.
     */
    public function approve(LawyerProfile $lawyer)
    {
        $lawyer->update([
            'approval_status' => 'approved',
            'is_verified'     => true,
        ]);

        // TODO: tạo notification báo luật sư đã được duyệt

        return response()->json(['message' => 'Đã duyệt hồ sơ luật sư.']);
    }

    /**
     * PATCH /api/admin/lawyers/{lawyer}/reject
     */
    public function reject(LawyerProfile $lawyer)
    {
        $lawyer->update(['approval_status' => 'rejected']);

        return response()->json(['message' => 'Đã từ chối hồ sơ luật sư.']);
    }

    /**
     * PATCH /api/admin/lawyers/{lawyer}/toggle-active
     * Vô hiệu hóa / kích hoạt lại tài khoản luật sư.
     */
    public function toggleActive(LawyerProfile $lawyer)
    {
        $user = $lawyer->user;
        $user->update([
            'status' => $user->status === 'active' ? 'inactive' : 'active',
        ]);

        return response()->json([
            'message' => 'Đã cập nhật trạng thái tài khoản.',
            'status'  => $user->status,
        ]);
    }
}