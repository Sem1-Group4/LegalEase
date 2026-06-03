<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bảng trung tâm: lịch hẹn nối khách hàng ↔ luật sư ↔ khung giờ.
// Khóa ngoại trỏ thẳng về bảng hồ sơ (không qua users) cho nhất quán.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customer_profiles')->cascadeOnDelete();    // Khách đặt lịch
            $table->foreignId('lawyer_profile_id')->constrained('lawyer_profiles')->cascadeOnDelete(); // Luật sư được đặt
            $table->foreignId('availability_id')->nullable()->constrained('lawyer_availabilities')->nullOnDelete(); // Khung giờ đã chọn
            $table->date('appointment_date'); // Ngày hẹn
            $table->time('start_time');       // Giờ bắt đầu
            $table->time('end_time');         // Giờ kết thúc
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'rescheduled', 'completed'])->default('pending'); // Vòng đời lịch hẹn
            $table->text('customer_note')->nullable();        // Nội dung yêu cầu của khách
            $table->string('cancel_reason', 255)->nullable(); // Lý do hủy (nếu có)
            $table->timestamps();

            // Index lọc lịch hẹn theo khách, luật sư, ngày và trạng thái (mục 5.6)
            $table->index(['customer_id', 'lawyer_profile_id', 'appointment_date', 'status'], 'idx_appointment_filter');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
