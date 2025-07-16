<?php

namespace App\Models;

use App\Helpers\PasswordHelper;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'christian_name',
        'family_name',
        'email',
        'password',
        'phone',
        'id_passport',
        'national_id',
        'gender',
        'role',
        'status',
        'pin',
        'unit_id',
        'zone_id',
        'bio',
        'avatar',
        'secondary_phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Boot the model and add event listeners
     */
    protected static function boot()
    {
        parent::boot();

        // Hash password before saving
        static::creating(function ($user) {
            if ($user->password && !PasswordHelper::canUsePhoneLogin($user->role)) {
                $user->password = PasswordHelper::hashPassword($user->password);
            }
            
            if ($user->pin && PasswordHelper::canUsePhoneLogin($user->role)) {
                $user->pin = PasswordHelper::hashPin($user->pin);
            }
        });

        // Hash password before updating
        static::updating(function ($user) {
            if ($user->isDirty('password') && $user->password && !PasswordHelper::canUsePhoneLogin($user->role)) {
                $user->password = PasswordHelper::hashPassword($user->password);
            }
            
            if ($user->isDirty('pin') && $user->pin && PasswordHelper::canUsePhoneLogin($user->role)) {
                $user->pin = PasswordHelper::hashPin($user->pin);
            }
        });
    }

    /**
     * Authenticate user by email and password (Admin only)
     */
    public static function authenticateByEmail(string $email, string $password): ?self
    {
        $user = self::where('email', $email)->first();
        
        if (!$user || !PasswordHelper::canUseEmailLogin($user->role)) {
            return null;
        }

        if (PasswordHelper::verifyPassword($password, $user->password)) {
            $user->updateLastLogin();
            return $user;
        }

        return null;
    }

    /**
     * Authenticate user by phone and PIN (Leaders and Members only)
     */
    public static function authenticateByPhone(string $phone, string $pin): ?self
    {
        $user = self::where('phone', $phone)->first();
        
        if (!$user || !PasswordHelper::canUsePhoneLogin($user->role)) {
            return null;
        }

        if (PasswordHelper::verifyPin($pin, $user->pin)) {
            $user->updateLastLogin();
            return $user;
        }

        return null;
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin(): void
    {
        $this->update([
            'last_login_at' => now(),
            'last_activity_at' => now()
        ]);
    }

    /**
     * Update last activity timestamp
     */
    public function updateLastActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is unit leader
     */
    public function isUnitLeader(): bool
    {
        return $this->role === 'unit_leader';
    }

    /**
     * Check if user is member
     */
    public function isMember(): bool
    {
        return $this->role === 'member';
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get full name
     */
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([$this->christian_name, $this->family_name]);
        return !empty($parts) ? implode(' ', $parts) : 'Unknown User';
    }

    /**
     * Get display name
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->full_name ?: 'Unknown User';
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for users by role
     */
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope for admins
     */
    public function scopeAdmins($query)
    {
        return $query->byRole('admin');
    }

    /**
     * Scope for unit leaders
     */
    public function scopeUnitLeaders($query)
    {
        return $query->byRole('unit_leader');
    }

    /**
     * Scope for members
     */
    public function scopeMembers($query)
    {
        return $query->byRole('member');
    }

    /**
     * Relationship with Unit
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Relationship with Zone
     */
    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * Relationship with Lands
     */
    public function lands()
    {
        return $this->hasMany(Land::class);
    }

    /**
     * Relationship with Crops
     */
    public function crops()
    {
        return $this->hasMany(Crop::class);
    }

    /**
     * Relationship with Produces
     */
    public function produces()
    {
        return $this->hasMany(Produce::class);
    }

    /**
     * Relationship with Activity Logs
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Relationship with Login Sessions
     */
    public function loginSessions()
    {
        return $this->hasMany(LoginSession::class);
    }
}
