<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LawyerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'city_id',
        'license_number',
        'experience_years',
        'bio',
        'office_address',
        'consultation_fee',
        'avatar',
        'is_verified',
        'is_featured',
        'approval_status',
        'rating_avg',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'is_featured' => 'boolean',
            'consultation_fee' => 'decimal:2',
            'rating_avg' => 'decimal:1',
        ];
    }

    // ----- Quan hệ -----

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function specializations(): BelongsToMany
    {
        return $this->belongsToMany(Specialization::class, 'lawyer_specialization');
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(LawyerAvailability::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
