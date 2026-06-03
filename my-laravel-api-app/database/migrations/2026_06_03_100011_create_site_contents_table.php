<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Nội dung động trang chủ (banner, giới thiệu...) cho Admin sửa không cần đụng code.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('section_key', 100)->unique(); // VD: homepage_banner, about_us
            $table->string('title', 200)->nullable();     // Tiêu đề section
            $table->text('content')->nullable();          // Nội dung
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete(); // Admin cập nhật cuối
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate()->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_contents');
    }
};
