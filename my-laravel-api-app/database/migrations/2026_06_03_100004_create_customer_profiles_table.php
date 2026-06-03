<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Hồ sơ cá nhân khách hàng (1-1 với users).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete(); // 1-1 với tài khoản
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete();  // Thành phố cư trú
            $table->string('address', 255)->nullable();   // Địa chỉ chi tiết
            $table->date('date_of_birth')->nullable();    // Ngày sinh
            $table->string('avatar', 255)->nullable();    // Ảnh đại diện
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_profiles');
    }
};
