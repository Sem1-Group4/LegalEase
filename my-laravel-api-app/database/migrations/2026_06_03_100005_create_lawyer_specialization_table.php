<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bảng nối N:N giữa luật sư và chuyên môn. Khóa chính ghép = chống trùng lặp.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lawyer_specialization', function (Blueprint $table) {
            $table->foreignId('lawyer_profile_id')->constrained('lawyer_profiles')->cascadeOnDelete();
            $table->foreignId('specialization_id')->constrained('specializations')->cascadeOnDelete();

            // PK ghép vừa đảm bảo UNIQUE(lawyer_profile_id, specialization_id)
            $table->primary(['lawyer_profile_id', 'specialization_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lawyer_specialization');
    }
};
