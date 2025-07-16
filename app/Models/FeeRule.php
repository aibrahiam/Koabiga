<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeeRule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'amount',
        'frequency',
        'unit',
        'status',
        'applicable_to',
        'description',
        'effective_date',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'effective_date' => 'date',
        'is_deleted' => 'boolean',
    ];

    protected $dates = [
        'effective_date',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Status constants
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_DRAFT = 'draft';
    const STATUS_SCHEDULED = 'scheduled';

    // Type constants
    const TYPE_LAND = 'land';
    const TYPE_EQUIPMENT = 'equipment';
    const TYPE_PROCESSING = 'processing';
    const TYPE_STORAGE = 'storage';
    const TYPE_TRAINING = 'training';
    const TYPE_OTHER = 'other';

    // Frequency constants
    const FREQUENCY_DAILY = 'daily';
    const FREQUENCY_WEEKLY = 'weekly';
    const FREQUENCY_MONTHLY = 'monthly';
    const FREQUENCY_QUARTERLY = 'quarterly';
    const FREQUENCY_YEARLY = 'yearly';
    const FREQUENCY_PER_TRANSACTION = 'per_transaction';
    const FREQUENCY_ONE_TIME = 'one_time';

    // Applicable to constants
    const APPLICABLE_ALL_MEMBERS = 'all_members';
    const APPLICABLE_UNIT_LEADERS = 'unit_leaders';
    const APPLICABLE_NEW_MEMBERS = 'new_members';
    const APPLICABLE_ACTIVE_MEMBERS = 'active_members';
    const APPLICABLE_SPECIFIC_UNITS = 'specific_units';

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeNotDeleted($query)
    {
        return $query->where('is_deleted', false);
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    public function scopeEffectiveDateReached($query)
    {
        return $query->where('effective_date', '<=', now()->toDateString());
    }

    // Methods
    public function isScheduled(): bool
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function shouldBeActivated(): bool
    {
        return $this->isScheduled() && $this->effective_date <= now()->toDateString();
    }

    public function activate(): bool
    {
        if ($this->shouldBeActivated()) {
            $this->update(['status' => self::STATUS_ACTIVE]);
            return true;
        }
        return false;
    }

    // Soft delete override
    public function delete()
    {
        $this->update(['is_deleted' => true]);
        return parent::delete();
    }

    public function forceDelete()
    {
        return parent::delete();
    }

    public function restore()
    {
        $this->update(['is_deleted' => false]);
        return parent::restore();
    }

    /**
     * Get the fee applications for this rule
     */
    public function feeApplications()
    {
        return $this->hasMany(FeeApplication::class);
    }

    /**
     * Get the unit assignments for this rule
     */
    public function unitAssignments()
    {
        return $this->hasMany(FeeRuleUnitAssignment::class);
    }
}
