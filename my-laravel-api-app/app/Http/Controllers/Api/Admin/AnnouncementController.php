<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

/**
 * Admin quản lý tin tức / thông báo (CRUD).
 */
class AnnouncementController extends Controller
{
    /** GET /api/admin/announcements */
    public function index()
    {
        return Announcement::with('author:id,name')
            ->orderByDesc('id')
            ->get()
            ->map(fn ($a) => [
                'id'           => $a->id,
                'title'        => $a->title,
                'is_published' => $a->is_published,
                'published_at' => $a->published_at?->toDateTimeString(),
                'author'       => $a->author?->name,
            ]);
    }

    /** GET /api/admin/announcements/{announcement} */
    public function show(Announcement $announcement)
    {
        return $announcement->load('author:id,name');
    }

    /** POST /api/admin/announcements */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'is_published' => 'boolean',
        ]);

        $data['created_by']   = $request->user()->id;
        $data['published_at'] = ($data['is_published'] ?? false) ? now() : null;

        $announcement = Announcement::create($data);

        return response()->json([
            'message' => 'Đã tạo tin tức.',
            'data'    => $announcement,
        ], 201);
    }

    /** PUT /api/admin/announcements/{announcement} */
    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'content'      => 'sometimes|string',
            'is_published' => 'boolean',
        ]);

        // Nếu vừa chuyển sang published mà chưa có ngày đăng thì set ngày
        if (($data['is_published'] ?? $announcement->is_published) && ! $announcement->published_at) {
            $data['published_at'] = now();
        }

        $announcement->update($data);

        return response()->json([
            'message' => 'Đã cập nhật tin tức.',
            'data'    => $announcement,
        ]);
    }

    /** DELETE /api/admin/announcements/{announcement} */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json(['message' => 'Đã xóa tin tức.']);
    }
}