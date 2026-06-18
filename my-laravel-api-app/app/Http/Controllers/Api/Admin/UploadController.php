<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Upload ảnh dùng cho trình soạn thảo nội dung (chèn ảnh vào bài).
 */
class UploadController extends Controller
{
    /** POST /api/admin/upload/image — nhận 1 ảnh, lưu, trả URL */
    public function image(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,webp,gif|max:2048',
        ]);

        $path = $request->file('image')->store('content', 'public');

        return response()->json([
            'url' => asset('storage/' . $path),
        ]);
    }
}