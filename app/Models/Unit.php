<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'zone_id',
        'leader_id',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Generate an automated unit code based on zone code
     */
    public static function generateCode($zoneId): string
    {
        $zone = Zone::find($zoneId);
        
        if (!$zone) {
            throw new \Exception('Zone not found');
        }

        // Get the first two letters of the zone code
        $zonePrefix = strtoupper(substr($zone->code, 0, 2));
        
        // Find the highest unit number for this zone
        $highestUnit = self::where('zone_id', $zoneId)
            ->where('code', 'like', $zonePrefix . '%')
            ->orderByRaw('CAST(SUBSTRING(code, ' . (strlen($zonePrefix) + 1) . ') AS INTEGER) DESC')
            ->first();
        
        if ($highestUnit) {
            // Extract the number part from the existing code
            $numberPart = substr($highestUnit->code, strlen($zonePrefix));
            $nextNumber = intval($numberPart) + 1;
        } else {
            $nextNumber = 1;
        }

        // Format with leading zeros (e.g., 01, 02, 10, 99)
        return $zonePrefix . str_pad($nextNumber, 2, '0', STR_PAD_LEFT);
    }


} 