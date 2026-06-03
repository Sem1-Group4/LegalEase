<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tin tức / cập nhật pháp lý do Admin đăng. Hỗ trợ draft (is_published=0).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete(); // Admin tạo bài
            $table->string('title', 200);         // Tiêu đề bài đăng
            $table->text('content');              // Nội dung chi tiết
            $table->boolean('is_published')->default(false); // Draft hay đã public
            $table->timestamp('published_at')->nullable();   // Thời điểm public
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
