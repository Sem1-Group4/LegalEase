<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bảng tra cứu Lĩnh vực chuyên môn luật (Hình sự, Gia đình, Doanh nghiệp...).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specializations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);                  // Tên lĩnh vực
            $table->string('slug', 120)->unique();        // Dùng cho URL/tìm kiếm (đã index nhờ unique)
            $table->string('description', 255)->nullable(); // Mô tả ngắn
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('specializations');
    }
};
