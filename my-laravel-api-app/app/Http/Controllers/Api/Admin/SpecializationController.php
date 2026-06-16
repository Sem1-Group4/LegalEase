<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialization;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Admin quản lý danh mục Lĩnh vực hành nghề (chuyên môn luật).
 */
class SpecializationController extends Controller
{
    /** GET /api/admin/specializations — danh sách + số luật sư mỗi lĩnh vực */
    public function index()
    {
        return Specialization::withCount('lawyerProfiles')
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => [
                'id'                   => $s->id,
                'name'                 => $s->name,
                'slug'                 => $s->slug,
                'description'          => $s->description,
                'lawyer_profiles_count' => $s->lawyer_profiles_count,
            ]);
    }

    /** POST /api/admin/specializations — thêm lĩnh vực mới */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|unique:specializations,name',
            'description' => 'nullable|string|max:255',
        ]);

        $spec = Specialization::create([
            'name'        => $data['name'],
            'slug'        => $this->uniqueSlug($data['name']),
            'description' => $data['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Đã thêm lĩnh vực.',
            'data'    => $spec,
        ], 201);
    }

    /** PUT /api/admin/specializations/{specialization} — sửa lĩnh vực */
    public function update(Request $request, Specialization $specialization)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', Rule::unique('specializations', 'name')->ignore($specialization->id)],
            'description' => 'nullable|string|max:255',
        ]);

        $specialization->update([
            'name'        => $data['name'],
            'slug'        => $this->uniqueSlug($data['name'], $specialization->id),
            'description' => $data['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Đã cập nhật lĩnh vực.',
            'data'    => $specialization->fresh(),
        ]);
    }

    /** DELETE /api/admin/specializations/{specialization} — xóa lĩnh vực */
    public function destroy(Specialization $specialization)
    {
        // Chặn xóa nếu đang có luật sư dùng lĩnh vực này
        if ($specialization->lawyerProfiles()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa: đang có luật sư thuộc lĩnh vực này.',
            ], 422);
        }

        $specialization->delete();

        return response()->json(['message' => 'Đã xóa lĩnh vực.']);
    }

    /** Sinh slug duy nhất từ tên (thêm hậu tố nếu trùng). */
    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        while (
            Specialization::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . $i;
            $i++;
        }

        return $slug;
    }
}