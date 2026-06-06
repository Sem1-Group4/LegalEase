<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\LawyerProfile;
use App\Models\Specialization;
use Illuminate\Http\Request;

/**
 * Các API công khai (không cần đăng nhập) phục vụ trang chủ & tìm kiếm.
 */
class PublicController extends Controller
{
    /** Danh sách tỉnh/thành phố cho dropdown tìm kiếm. */
    public function cities()
    {
        return City::orderBy('name')->get(['id', 'name', 'region']);
    }

    /** Danh sách lĩnh vực chuyên môn cho dropdown tìm kiếm. */
    public function specializations()
    {
        return Specialization::orderBy('name')->get(['id', 'name', 'slug']);
    }

    /**
     * Danh sách luật sư (đã duyệt). Hỗ trợ:
     * - ?featured=1  -> chỉ luật sư nổi bật (trang chủ)
     * - ?city_id=    -> lọc theo thành phố
     * - ?specialization_id= -> lọc theo chuyên môn
     */
    public function lawyers(Request $request)
    {
        $query = LawyerProfile::query()
            ->where('approval_status', 'approved')
            ->with(['user:id,name,phone', 'city:id,name', 'specializations:id,name'])
            ->withCount('reviews');

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->filled('specialization_id')) {
            $specId = $request->specialization_id;
            $query->whereHas('specializations', fn ($q) => $q->where('specializations.id', $specId));
        }

        $lawyers = $query->orderByDesc('rating_avg')->limit(12)->get();

        // Định dạng lại dữ liệu trả về cho gọn, đúng nhu cầu hiển thị card
        return $lawyers->map(fn ($l) => [
            'id' => $l->id,
            'name' => $l->user->name,
            'phone' => $l->user->phone,
            'city' => $l->city?->name,
            'office_address' => $l->office_address,
            'experience_years' => $l->experience_years,
            'consultation_fee' => $l->consultation_fee,
            'avatar' => $l->avatar,
            'is_verified' => $l->is_verified,
            'rating_avg' => (float) $l->rating_avg,
            'reviews_count' => $l->reviews_count,
            'bio' => $l->bio,
            'specializations' => $l->specializations->pluck('name'),
        ]);
    }
}
