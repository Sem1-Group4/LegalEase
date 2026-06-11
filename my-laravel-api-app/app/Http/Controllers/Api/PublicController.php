<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\City;
use App\Models\LawyerProfile;
use App\Models\Specialization;
use App\Services\AvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Các API công khai (không cần đăng nhập) phục vụ trang chủ, tìm kiếm & xem hồ sơ luật sư.
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
     * - ?featured=1          -> chỉ luật sư nổi bật (trang chủ, lấy 12 cái đầu)
     * - ?q=                  -> tìm theo tên luật sư
     * - ?city_id=            -> lọc theo thành phố
     * - ?specialization_id=  -> lọc theo chuyên môn
     * - ?per_page=           -> số bản ghi mỗi trang (mặc định 9)
     *
     * Trả về paginator chuẩn Laravel (data + links + meta). Với featured, FE chỉ lấy `data`.
     */
    public function lawyers(Request $request)
    {
        $query = LawyerProfile::query()
            ->where('approval_status', 'approved')
            ->with(['user:id,name,phone', 'city:id,name', 'specializations:id,name'])
            ->withCount('reviews');

        $featured = $request->boolean('featured');

        if ($featured) {
            $query->where('is_featured', true);
        }

        if ($request->filled('q')) {
            $keyword = $request->q;
            $query->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$keyword}%"));
        }

        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->filled('specialization_id')) {
            $specId = $request->specialization_id;
            $query->whereHas('specializations', fn ($q) => $q->where('specializations.id', $specId));
        }

        $perPage = $featured ? 12 : (int) ($request->per_page ?: 9);

        return $query->orderByDesc('rating_avg')
            ->paginate($perPage)
            ->through(fn ($l) => $this->cardData($l));
    }

    /**
     * GET /api/lawyers/{lawyer} — chi tiết 1 luật sư (đã duyệt) kèm vài review gần nhất.
     */
    public function show(LawyerProfile $lawyer)
    {
        if ($lawyer->approval_status !== 'approved') {
            abort(404, 'Không tìm thấy luật sư.');
        }

        $lawyer->load([
            'user:id,name,phone,email',
            'city:id,name',
            'specializations:id,name',
        ])->loadCount('reviews');

        $recentReviews = $lawyer->reviews()
            ->with('customer.user:id,name')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($r) => $this->reviewData($r));

        return [
            'id'                => $lawyer->id,
            'name'              => $lawyer->user->name,
            'phone'             => $lawyer->user->phone,
            'email'             => $lawyer->user->email,
            'city'              => $lawyer->city?->name,
            'office_address'    => $lawyer->office_address,
            'experience_years'  => $lawyer->experience_years,
            'consultation_fee'  => $lawyer->consultation_fee,
            'avatar'            => $lawyer->avatar,
            'is_verified'       => $lawyer->is_verified,
            'rating_avg'        => (float) $lawyer->rating_avg,
            'reviews_count'     => $lawyer->reviews_count,
            'bio'               => $lawyer->bio,
            'license_number'    => $lawyer->license_number,
            'specializations'   => $lawyer->specializations->pluck('name'),
            'recent_reviews'    => $recentReviews,
        ];
    }

    /**
     * GET /api/lawyers/{lawyer}/slots?date=YYYY-MM-DD
     * Danh sách slot 60' còn có thể đặt của luật sư trong ngày.
     */
    public function slots(Request $request, LawyerProfile $lawyer, AvailabilityService $availability)
    {
        if ($lawyer->approval_status !== 'approved') {
            abort(404, 'Không tìm thấy luật sư.');
        }

        $data = $request->validate([
            'date' => 'required|date|after_or_equal:today',
        ]);

        $date = Carbon::parse($data['date'])->startOfDay();

        return [
            'date'  => $date->toDateString(),
            'slots' => $availability->bookableSlots($lawyer, $date),
        ];
    }

    /**
     * GET /api/lawyers/{lawyer}/reviews — danh sách đánh giá (phân trang).
     */
    public function reviews(Request $request, LawyerProfile $lawyer)
    {
        if ($lawyer->approval_status !== 'approved') {
            abort(404, 'Không tìm thấy luật sư.');
        }

        return $lawyer->reviews()
            ->with('customer.user:id,name')
            ->latest()
            ->paginate((int) ($request->per_page ?: 10))
            ->through(fn ($r) => $this->reviewData($r));
    }

    /**
     * GET /api/announcements — danh sách tin tức đã đăng (published).
     */
    public function news()
    {
        return Announcement::where('is_published', true)
            ->orderByDesc('published_at')
            ->get()
            ->map(fn ($a) => [
                'id'           => $a->id,
                'title'        => $a->title,
                'excerpt'      => Str::limit(strip_tags($a->content), 140),
                'published_at' => $a->published_at?->toDateString(),
            ]);
    }

    /**
     * GET /api/announcements/{announcement} — chi tiết 1 tin tức (chỉ khi đã đăng).
     */
    public function newsDetail(Announcement $announcement)
    {
        if (! $announcement->is_published) {
            abort(404, 'Không tìm thấy bài viết.');
        }

        $announcement->load('author:id,name');

        return [
            'id'           => $announcement->id,
            'title'        => $announcement->title,
            'content'      => $announcement->content,
            'author'       => $announcement->author?->name,
            'published_at' => $announcement->published_at?->toDateString(),
        ];
    }

    /** Định dạng card luật sư cho danh sách. */
    private function cardData(LawyerProfile $l): array
    {
        return [
            'id'                => $l->id,
            'name'              => $l->user->name,
            'phone'             => $l->user->phone,
            'city'              => $l->city?->name,
            'office_address'    => $l->office_address,
            'experience_years'  => $l->experience_years,
            'consultation_fee'  => $l->consultation_fee,
            'avatar'            => $l->avatar,
            'is_verified'       => $l->is_verified,
            'rating_avg'        => (float) $l->rating_avg,
            'reviews_count'     => $l->reviews_count,
            'bio'               => $l->bio,
            'specializations'   => $l->specializations->pluck('name'),
        ];
    }

    /** Định dạng 1 đánh giá. */
    private function reviewData($r): array
    {
        return [
            'id'         => $r->id,
            'rating'     => $r->rating,
            'comment'    => $r->comment,
            'customer'   => $r->customer?->user?->name,
            'created_at' => $r->created_at?->toDateTimeString(),
        ];
    }
}
