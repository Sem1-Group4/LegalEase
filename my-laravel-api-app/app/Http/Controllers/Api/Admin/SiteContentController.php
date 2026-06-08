<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;

/**
 * Admin quản lý nội dung trang tĩnh (FAQ, Giới thiệu...).
 * Mỗi nội dung định danh bằng section_key.
 */
class SiteContentController extends Controller
{
    /** GET /api/admin/site-contents */
    public function index()
    {
        return SiteContent::orderBy('section_key')->get();
    }

    /** PUT /api/admin/site-contents/{key}  (tạo mới hoặc cập nhật theo section_key) */
    public function upsert(Request $request, string $key)
    {
        $data = $request->validate([
            'title'   => 'nullable|string|max:255',
            'content' => 'required|string',
        ]);

        $content = SiteContent::updateOrCreate(
            ['section_key' => $key],
            [
                'title'      => $data['title'] ?? null,
                'content'    => $data['content'],
                'updated_by' => $request->user()->id,
            ]
        );

        return response()->json([
            'message' => 'Đã lưu nội dung.',
            'data'    => $content,
        ]);
    }
}