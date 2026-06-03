<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LawyerAvailability extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'lawyer_profile_id',
        'available_date',
        'start_time',
        'end_time',
        'status',
        'repeat_from',
        'repeat_to',
    ];

    protected function casts(): array
    {
        return [
            'available_date' => 'date',
            'repeat_from' => 'date',
            'repeat_to' => 'date',
        ];
    }

    public function lawyerProfile(): BelongsTo
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    /** Một slot dùng cho tối đa 1 lịch hẹn. */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'availability_id');
    }
}
