<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Crop extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'crop_name',
        'type',
        'crop_type',
        'variety',
        'planting_date',
        'expected_harvest_date',
        'area_planted',
        'seed_quantity',
        'land_id',
        'unit_id',
        'user_id',
    ];

    protected $casts = [
        'planting_date' => 'date',
        'expected_harvest_date' => 'date',
        'area_planted' => 'decimal:2',
        'seed_quantity' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the land where this crop is planted
     */
    public function land(): BelongsTo
    {
        return $this->belongsTo(Land::class);
    }

    /**
     * Get the unit that owns this crop
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Get the user that owns this crop
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the produce from this crop
     */
    public function produces(): HasMany
    {
        return $this->hasMany(Produce::class);
    }

    /**
     * Scope to get crops from active users
     */
    public function scopeFromActiveUsers($query)
    {
        return $query->whereHas('user', function ($q) {
            $q->where('status', 'active');
        });
    }

    /**
     * Scope to get crops by unit
     */
    public function scopeByUnit($query, $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    /**
     * Scope to get crops by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get crops by land
     */
    public function scopeByLand($query, $landId)
    {
        return $query->where('land_id', $landId);
    }
} 