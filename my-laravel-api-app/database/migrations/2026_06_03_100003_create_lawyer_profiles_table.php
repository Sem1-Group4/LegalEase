<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Hồ sơ chuyên môn luật sư (1-1 với users). Admin duyệt trước khi hiển thị.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lawyer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete(); // 1-1 với tài khoản
            $table->foreignId('city_id')->constrained('cities')->restrictOnDelete();          // Vị trí làm việc
            $table->string('license_number', 50)->nullable();   // Số thẻ hành nghề luật sư
            $table->unsignedSmallInteger('experience_years')->default(0); // Số năm kinh nghiệm
            $table->text('bio')->nullable();                    // Giới thiệu bản thân
            $table->string('office_address', 255)->nullable();  // Địa chỉ văn phòng
            $table->decimal('consultation_fee', 10, 2)->nullable(); // Phí tư vấn (tuỳ chọn)
            $table->string('avatar', 255)->nullable();          // Ảnh đại diện
            $table->boolean('is_verified')->default(false);     // Huy hiệu đã xác minh
            $table->boolean('is_featured')->default(false);     // Luật sư nổi bật trang chủ
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending'); // Admin duyệt
            $table->decimal('rating_avg', 2, 1)->default(0);    // Điểm TB (cache để sort nhanh)
            $table->timestamps();

            // Index phục vụ sort & filter trang tìm kiếm (mục 5.6)
            $table->index(['city_id', 'approval_status', 'is_verified', 'rating_avg'], 'idx_lawyer_search');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lawyer_profiles');
    }
};
