<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Khung giờ rảnh của luật sư. Hỗ trợ 2 kiểu: lịch lặp (available_date=NULL +
// repeat_from/repeat_to) hoặc slot cụ thể (available_date có giá trị).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lawyer_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lawyer_profile_id')->constrained('lawyer_profiles')->cascadeOnDelete(); // Luật sư sở hữu slot
            $table->date('available_date')->nullable(); // Ngày cụ thể (NULL nếu là lịch lặp)
            $table->time('start_time');                 // Giờ bắt đầu
            $table->time('end_time');                   // Giờ kết thúc
            $table->enum('status', ['available', 'booked', 'blocked'])->default('available'); // trống/đã đặt/chặn
            $table->date('repeat_from')->nullable();    // Ngày bắt đầu áp dụng lịch lặp
            $table->date('repeat_to')->nullable();      // Ngày kết thúc áp dụng lịch lặp
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lawyer_availabilities');
    }
};
