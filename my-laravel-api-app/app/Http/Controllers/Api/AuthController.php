<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Xác thực dùng chung: đăng ký, đăng nhập, đăng xuất.
 * Token cấp bằng Sanctum. Chỉ cho đăng ký role customer.
 * Tài khoản admin và luật sư được cấp sẵn qua seeder (admin bàn giao cho luật sư).
 */
class AuthController extends Controller
{
    /** POST /api/auth/register */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone'    => 'nullable|string|max:20',
        ]);

        // Đăng ký công khai chỉ dành cho khách hàng.
        // Tài khoản luật sư do quản trị viên cấp sẵn (qua seeder), không tự đăng ký.
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'phone'    => $data['phone'] ?? null,
            'role'     => 'customer',
            'status'   => 'active',
        ]);

        CustomerProfile::create(['user_id' => $user->id]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công.',
            'user'    => $this->userPayload($user),
            'token'   => $token,
        ], 201);
    }

    /** POST /api/auth/login */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Sai email hoặc mật khẩu.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản đã bị vô hiệu hóa.'],
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công.',
            'user'    => $this->userPayload($user),
            'token'   => $token,
        ]);
    }

    /** POST /api/auth/logout (cần token) */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đã đăng xuất.']);
    }

    /** GET /api/auth/me (cần token) — trả thông tin user hiện tại */
    public function me(Request $request)
    {
        return $this->userPayload($request->user());
    }

    /** Gom dữ liệu user trả về cho gọn. */
    private function userPayload(User $user): array
    {
        // Luật sư lấy avatar từ hồ sơ luật sư, còn lại lấy từ hồ sơ khách hàng.
        $avatarPath = $user->role === 'lawyer'
            ? $user->lawyerProfile?->avatar
            : $user->customerProfile?->avatar;

        return [
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'phone'  => $user->phone,
            'role'   => $user->role,
            'avatar' => $avatarPath ? asset('storage/' . $avatarPath) : null,
        ];
    }
}