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
        'date_of_birth',
        'address',
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
     * Get the role attribute with null safety
     */
    public function getRoleAttribute($value)
    {
        return $value ?? null;
    }

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
        'date_of_birth' => 'date',
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
        $user = self::where('phone', $phone)
                    ->orWhere('secondary_phone', $phone)
                    ->first();
        
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
        return isset($this->role) && $this->role === 'admin';
    }

    /**
     * Check if user is unit leader
     */
    public function isUnitLeader(): bool
    {
        return isset($this->role) && $this->role === 'unit_leader';
    }

    /**
     * Check if user is member
     */
    public function isMember(): bool
    {
        return isset($this->role) && $this->role === 'member';
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
     * Get user role safely
     */
    public function getRole(): ?string
    {
        return $this->role ?? null;
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
     * Normalize phone number to 10-digit format
     * Removes all non-digit characters and ensures 10 digits
     */
    public static function normalizePhoneNumber(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        // Remove all non-digit characters
        $digits = preg_replace('/[^0-9]/', '', $phone);

        // If it's a Kenyan number starting with +254, convert to 10 digits
        if (strlen($digits) === 12 && substr($digits, 0, 3) === '254') {
            return '0' . substr($digits, 3);
        }

        // If it's already 10 digits, return as is
        if (strlen($digits) === 10) {
            return $digits;
        }

        // If it's 9 digits, add leading 0
        if (strlen($digits) === 9) {
            return '0' . $digits;
        }

        // If it's 11 digits starting with 0, return as is
        if (strlen($digits) === 11 && substr($digits, 0, 1) === '0') {
            return $digits;
        }

        // For any other format, return the digits as is (validation will catch invalid formats)
        return $digits;
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
