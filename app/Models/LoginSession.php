<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'ip_address',
        'user_agent',
        'is_active',
        'login_at',
        'logout_at',
        'last_activity_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'login_at' => 'datetime',
        'logout_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Get the user that owns the login session
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get active sessions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get sessions by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get recent sessions
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('login_at', '>=', now()->subDays($days));
    }

    /**
     * Mark session as inactive
     */
    public function deactivate()
    {
        $this->update([
            'is_active' => false,
            'logout_at' => now(),
        ]);
    }

    /**
     * Update last activity
     */
    public function updateActivity()
    {
        $this->update([
            'last_activity_at' => now(),
        ]);
    }
} 