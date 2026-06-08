<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Admin quản lý tài khoản khách hàng.
 */
class CustomerController extends Controller
{
    /**
     * GET /api/admin/customers?search=&status=
     * Danh sách khách hàng (lọc theo tên/email + trạng thái tài khoản).
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->where('role', 'customer')
            ->with('customerProfile:id,user_id,city_id,address')
            ->withCount('customerProfile');

        if ($request->filled('search')) {
            $kw = $request->search;
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$kw}%")
                ->orWhere('email', 'like', "%{$kw}%"));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $customers = $query->orderByDesc('id')->get();

        return $customers->map(fn ($u) => [
            'id'      => $u->id,
            'name'    => $u->name,
            'email'   => $u->email,
            'phone'   => $u->phone,
            'status'  => $u->status,
            'address' => $u->customerProfile?->address,
            'joined'  => $u->created_at?->toDateString(),
        ]);
    }

    /**
     * GET /api/admin/customers/{customer}
     * Chi tiết một khách hàng.
     */
    public function show(User $customer)
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->load('customerProfile.city:id,name');

        return [
            'id'      => $customer->id,
            'name'    => $customer->name,
            'email'   => $customer->email,
            'phone'   => $customer->phone,
            'status'  => $customer->status,
            'city'    => $customer->customerProfile?->city?->name,
            'address' => $customer->customerProfile?->address,
            'joined'  => $customer->created_at?->toDateString(),
        ];
    }

    /**
     * PATCH /api/admin/customers/{customer}/toggle-active
     * Khóa / mở khóa tài khoản khách hàng.
     */
    public function toggleActive(User $customer)
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->update([
            'status' => $customer->status === 'active' ? 'inactive' : 'active',
        ]);

        return response()->json([
            'message' => 'Đã cập nhật trạng thái tài khoản.',
            'status'  => $customer->status,
        ]);
    }

    /**
     * DELETE /api/admin/customers/{customer}
     */
    public function destroy(User $customer)
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->delete();

        return response()->json(['message' => 'Đã xóa khách hàng.']);
    }
}