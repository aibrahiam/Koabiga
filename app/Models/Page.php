<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'path',
        'role',
        'description',
        'features',
        'permissions',
        'status',
        'icon',
        'sort_order',
        'is_public',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'features' => 'array',
        'permissions' => 'array',
        'is_public' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who created this page
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this page
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the creator's name
     */
    public function getCreatedByNameAttribute(): string
    {
        return $this->creator ? $this->creator->full_name : 'System';
    }

    /**
     * Get the updater's name
     */
    public function getUpdatedByNameAttribute(): string
    {
        return $this->updater ? $this->updater->full_name : 'System';
    }

    /**
     * Get the last modified date
     */
    public function getLastModifiedAttribute(): string
    {
        return $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : $this->created_at->format('Y-m-d H:i:s');
    }

    /**
     * Scope to get active pages
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get pages by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope to get public pages
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope to get pages by path
     */
    public function scopeByPath($query, $path)
    {
        return $query->where('path', $path);
    }
} 