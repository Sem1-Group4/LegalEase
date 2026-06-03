<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    public $timestamps = false; // Bảng tra cứu, không có created_at/updated_at

    protected $fillable = ['name', 'region'];

    public function lawyerProfiles(): HasMany
    {
        return $this->hasMany(LawyerProfile::class);
    }

    public function customerProfiles(): HasMany
    {
        return $this->hasMany(CustomerProfile::class);
    }
}
