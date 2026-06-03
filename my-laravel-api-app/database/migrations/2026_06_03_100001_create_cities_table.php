<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bảng tra cứu Tỉnh/Thành phố. Chuẩn hóa địa điểm thay vì lưu string tự do.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);              // VD: Hà Nội, TP.HCM, Đà Nẵng
            $table->string('region', 50)->nullable(); // Miền Bắc / Trung / Nam

            $table->index('name'); // Phục vụ tìm kiếm theo thành phố (mục 5.6)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
