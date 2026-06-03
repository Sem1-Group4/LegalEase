<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Đánh giá sau buổi tư vấn. Mỗi appointment chỉ review 1 lần (appointment_id UNIQUE).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->unique()->constrained('appointments')->cascadeOnDelete(); // Gắn với cuộc hẹn có thật
            $table->foreignId('customer_id')->constrained('customer_profiles')->cascadeOnDelete();          // Khách đánh giá
            $table->foreignId('lawyer_profile_id')->constrained('lawyer_profiles')->cascadeOnDelete();      // Luật sư được đánh giá
            $table->unsignedTinyInteger('rating'); // Số sao 1..5 (ràng buộc CHECK bên dưới)
            $table->text('comment')->nullable();   // Nhận xét chi tiết
            $table->timestamp('created_at')->useCurrent(); // Chỉ created_at (theo thiết kế)
        });

        // CHECK (rating BETWEEN 1 AND 5) — MySQL 8 thực thi ràng buộc này
        DB::statement('ALTER TABLE reviews ADD CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)');
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
