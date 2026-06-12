<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

/**
 * Khách hàng xem & đánh dấu đã đọc thông báo cá nhân của mình.
 */
class NotificationController extends Controller
{
    /** GET /api/customer/notifications — danh sách mới nhất + số chưa đọc */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'type'       => $n->type,
                'title'      => $n->title,
                'message'    => $n->message,
                'is_read'    => $n->is_read,
                'created_at' => $n->created_at?->toDateTimeString(),
            ]);

        return [
            'unread_count' => $user->notifications()->where('is_read', false)->count(),
            'data'         => $notifications,
        ];
    }

    /** PATCH /api/customer/notifications/{notification}/read — đánh dấu 1 cái đã đọc */
    public function markRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Không có quyền.'], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Đã đánh dấu đã đọc.']);
    }

    /** PATCH /api/customer/notifications/read-all — đánh dấu tất cả đã đọc */
    public function markAllRead(Request $request)
    {
        $request->user()->notifications()
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Đã đánh dấu tất cả là đã đọc.']);
    }
}
