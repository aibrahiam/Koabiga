<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'fee_application_id',
        'reference_id',
        'external_id',
        'amount',
        'currency',
        'phone_number',
        'description',
        'status',
        'payment_method',
        'financial_transaction_id',
        'payer_message',
        'payee_note',
        'reason',
        'callback_data',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'callback_data' => 'array',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the user that owns the payment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the fee application associated with the payment
     */
    public function feeApplication(): BelongsTo
    {
        return $this->belongsTo(FeeApplication::class);
    }

    /**
     * Scope to get pending payments
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get successful payments
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'SUCCESSFUL');
    }

    /**
     * Scope to get failed payments
     */
    public function scopeFailed($query)
    {
        return $query->whereIn('status', ['FAILED', 'REJECTED', 'TIMEOUT']);
    }

    /**
     * Check if payment is successful
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'SUCCESSFUL';
    }

    /**
     * Check if payment is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment is failed
     */
    public function isFailed(): bool
    {
        return in_array($this->status, ['FAILED', 'REJECTED', 'TIMEOUT']);
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount, 0) . ' ' . $this->currency;
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute(): string
    {
        switch ($this->status) {
            case 'SUCCESSFUL':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'FAILED':
            case 'REJECTED':
            case 'TIMEOUT':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        }
    }
} 