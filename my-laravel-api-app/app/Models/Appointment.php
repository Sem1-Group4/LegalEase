<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    protected $fillable = [
        'customer_id',
        'lawyer_profile_id',
        'availability_id',
        'appointment_date',
        'start_time',
        'end_time',
        'status',
        'customer_note',
        'cancel_reason',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
        ];
    }

    // ----- Quan hệ -----

    /** Khách hàng đặt lịch (trỏ thẳng customer_profiles). */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class, 'customer_id');
    }

    public function lawyerProfile(): BelongsTo
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function availability(): BelongsTo
    {
        return $this->belongsTo(LawyerAvailability::class, 'availability_id');
    }

    /** Mỗi lịch hẹn được đánh giá tối đa 1 lần. */
    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }
}
