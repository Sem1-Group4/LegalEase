<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Specialization extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'slug', 'description'];

    /** Các luật sư thuộc chuyên môn này (N:N qua bảng lawyer_specialization). */
    public function lawyerProfiles(): BelongsToMany
    {
        return $this->belongsToMany(LawyerProfile::class, 'lawyer_specialization');
    }
}
