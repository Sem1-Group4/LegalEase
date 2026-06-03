<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Thông báo cá nhân. Hệ thống tự tạo khi có sự kiện (đặt lịch, xác nhận, nhắc nhở).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Người nhận thông báo
            $table->string('type', 50);          // booking_confirmed, reminder, system...
            $table->string('title', 150);        // Tiêu đề thông báo
            $table->text('message');             // Nội dung thông báo
            $table->boolean('is_read')->default(false); // Đã đọc hay chưa
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
