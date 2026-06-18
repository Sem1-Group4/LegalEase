<?php

namespace App\Http\Controllers\Api\Lawyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

/**
 * Luật sư quản lý hồ sơ của chính mình.
 */
class ProfileController extends Controller
{
    /**
     * GET /api/lawyer/profile
     * Xem hồ sơ của luật sư đang đăng nhập.
     */
    public function show(Request $request)
    {
        $profile = $request->user()->lawyerProfile;

        if (! $profile) {
            return response()->json(['message' => 'Chưa có hồ sơ luật sư.'], 404);
        }

        $profile->load(['city:id,name', 'specializations:id,name']);

        return [
            'id'               => $profile->id,
            'license_number'   => $profile->license_number,
            'experience_years' => $profile->experience_years,
            'bio'              => $profile->bio,
            'office_address'   => $profile->office_address,
            'consultation_fee' => $profile->consultation_fee,
            'city_id'          => $profile->city_id,
            'city'             => $profile->city?->name,
            'approval_status'  => $profile->approval_status,
            'is_verified'      => $profile->is_verified,
            'rating_avg'       => $profile->rating_avg,
            'avatar'           => $profile->avatar ? asset('storage/' . $profile->avatar) : null,
            'specializations'  => $profile->specializations->map(fn ($s) => [
                'id'   => $s->id,
                'name' => $s->name,
            ]),
        ];
    }

    /**
     * PUT /api/lawyer/profile
     * Cập nhật hồ sơ + đồng bộ chuyên môn (N:N).
     */
    public function update(Request $request)
    {
        $profile = $request->user()->lawyerProfile;

        if (! $profile) {
            return response()->json(['message' => 'Chưa có hồ sơ luật sư.'], 404);
        }

        $data = $request->validate([
            'experience_years'  => 'sometimes|integer|min:0',
            'bio'               => 'sometimes|nullable|string',
            'office_address'    => 'sometimes|nullable|string|max:255',
            'consultation_fee'  => 'sometimes|numeric|min:0',
            'city_id'           => ['sometimes', Rule::exists('cities', 'id')],
            'specialization_ids' => 'sometimes|array',
            'specialization_ids.*' => Rule::exists('specializations', 'id'),
        ]);

        // Cập nhật các cột thường (bỏ specialization_ids ra vì nó là N:N riêng)
        $profile->update(collect($data)->except('specialization_ids')->toArray());

        // Đồng bộ chuyên môn nếu client gửi lên
        if ($request->has('specialization_ids')) {
            $profile->specializations()->sync($data['specialization_ids']);
        }

        return response()->json([
            'message' => 'Đã cập nhật hồ sơ.',
            'data'    => $this->show($request),
        ]);
    }

    /**
     * POST /api/lawyer/profile/avatar
     * Tải lên ảnh đại diện của luật sư.
     */
    public function uploadAvatar(Request $request)
    {
        $profile = $request->user()->lawyerProfile;

        if (! $profile) {
            return response()->json(['message' => 'Chưa có hồ sơ luật sư.'], 404);
        }

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048', // tối đa 2MB
        ]);

        // Xóa ảnh cũ nếu có
        if ($profile->avatar && Storage::disk('public')->exists($profile->avatar)) {
            Storage::disk('public')->delete($profile->avatar);
        }

        // Lưu ảnh mới vào storage/app/public/avatars
        $path = $request->file('avatar')->store('avatars', 'public');

        $profile->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Đã cập nhật ảnh đại diện.',
            'avatar'  => asset('storage/' . $path),
        ]);
    }
}