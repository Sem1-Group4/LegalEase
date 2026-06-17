<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Khách hàng xem & cập nhật hồ sơ cá nhân của mình.
 */
class ProfileController extends Controller
{
    /** GET /api/customer/profile */
    public function show(Request $request)
    {
        return $this->payload($request);
    }

    /** PUT /api/customer/profile */
    public function update(Request $request)
    {
        $data = $request->validate([
            'name'          => 'sometimes|string|max:100',
            'phone'         => 'nullable|string|max:20',
            'city_id'       => 'nullable|exists:cities,id',
            'address'       => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
        ]);

        $user = $request->user();

        // Thông tin trên bảng users
        if (array_key_exists('name', $data)) {
            $user->name = $data['name'];
        }
        if (array_key_exists('phone', $data)) {
            $user->phone = $data['phone'];
        }
        $user->save();

        // Thông tin trên bảng customer_profiles
        $profile = $user->customerProfile ?: CustomerProfile::create(['user_id' => $user->id]);
        foreach (['city_id', 'address', 'date_of_birth'] as $key) {
            if (array_key_exists($key, $data)) {
                $profile->{$key} = $data[$key];
            }
        }
        $profile->save();

        return response()->json([
            'message' => 'Đã cập nhật hồ sơ.',
            'data'    => $this->payload($request),
        ]);
    }

    /**
     * POST /api/customer/profile/avatar
     * Tải lên ảnh đại diện của khách hàng.
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048', // tối đa 2MB
        ]);

        $user = $request->user();
        $profile = $user->customerProfile ?: CustomerProfile::create(['user_id' => $user->id]);

        // Xóa ảnh cũ nếu có
        if ($profile->avatar && Storage::disk('public')->exists($profile->avatar)) {
            Storage::disk('public')->delete($profile->avatar);
        }

        // Lưu ảnh mới vào storage/app/public/avatars
        $path = $request->file('avatar')->store('avatars', 'public');

        $profile->avatar = $path;
        $profile->save();

        return response()->json([
            'message' => 'Đã cập nhật ảnh đại diện.',
            'avatar'  => asset('storage/' . $path),
        ]);
    }

    /** Gom dữ liệu hồ sơ trả về. */
    private function payload(Request $request): array
    {
        $user = $request->user();
        $profile = $user->customerProfile ?: CustomerProfile::create(['user_id' => $user->id]);
        $profile->loadMissing('city:id,name');

        return [
            'name'          => $user->name,
            'email'         => $user->email,
            'phone'         => $user->phone,
            'city_id'       => $profile->city_id,
            'city'          => $profile->city?->name,
            'address'       => $profile->address,
            'date_of_birth' => $profile->date_of_birth?->toDateString(),
            'avatar'        => $profile->avatar ? asset('storage/' . $profile->avatar) : null,
        ];
    }
}
