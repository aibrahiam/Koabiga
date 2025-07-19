<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'type',
        'priority',
        'status',
        'due_date',
        'completed_date',
        'assigned_by',
        'assigned_to',
        'unit_id',
        'land_id',
        'crop_id',
        'attachments',
        'notes',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_date' => 'date',
        'attachments' => 'array',
    ];

    /**
     * Get the user who assigned the task
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Get the user assigned to the task
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the unit associated with the task
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Get the land associated with the task
     */
    public function land(): BelongsTo
    {
        return $this->belongsTo(Land::class);
    }

    /**
     * Get the crop associated with the task
     */
    public function crop(): BelongsTo
    {
        return $this->belongsTo(Crop::class);
    }

    /**
     * Scope for upcoming tasks
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', '!=', 'completed')
                    ->where('status', '!=', 'cancelled')
                    ->where('due_date', '>=', now()->toDateString());
    }

    /**
     * Scope for completed tasks
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for pending tasks
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for overdue tasks
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'completed')
                    ->where('status', '!=', 'cancelled')
                    ->where('due_date', '<', now()->toDateString());
    }
}
