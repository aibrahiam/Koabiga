<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeRuleUnitAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'fee_rule_id',
        'unit_id',
        'custom_amount',
        'is_active',
    ];

    protected $casts = [
        'custom_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the fee rule that this assignment belongs to
     */
    public function feeRule(): BelongsTo
    {
        return $this->belongsTo(FeeRule::class);
    }

    /**
     * Get the unit that this assignment belongs to
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Scope to get active assignments
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get assignments by unit
     */
    public function scopeByUnit($query, $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    /**
     * Scope to get assignments by fee rule
     */
    public function scopeByFeeRule($query, $feeRuleId)
    {
        return $query->where('fee_rule_id', $feeRuleId);
    }
} 