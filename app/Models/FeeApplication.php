<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeApplication extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_PAID = 'paid';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'fee_rule_id',
        'user_id',
        'unit_id',
        'amount',
        'due_date',
        'paid_date',
        'status',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the fee rule that this application belongs to
     */
    public function feeRule(): BelongsTo
    {
        return $this->belongsTo(FeeRule::class);
    }

    /**
     * Get the user that this fee application belongs to
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the unit that this fee application belongs to
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Scope to get pending applications
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope to get paid applications
     */
    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    /**
     * Scope to get overdue applications
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_OVERDUE);
    }

    /**
     * Scope to get applications by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get applications by unit
     */
    public function scopeByUnit($query, $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    /**
     * Calculate fee amount based on fee rule and user
     */
    public static function calculateFeeAmount(FeeRule $feeRule, User $user, Unit $unit = null): float
    {
        $baseAmount = $feeRule->amount;

        // Apply unit-specific overrides if available
        if ($unit) {
            $unitOverride = $feeRule->unitAssignments()
                ->where('unit_id', $unit->id)
                ->first();

            if ($unitOverride && $unitOverride->custom_amount) {
                $baseAmount = $unitOverride->custom_amount;
            }
        }

        return $baseAmount;
    }
} 