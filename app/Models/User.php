<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'christian_name',
        'family_name',
        'id_passport',
        'national_id',
        'email',
        'phone',
        'secondary_phone',
        'pin',
        'password',
        'role',
        'status',
        'gender',
        'unit_id',
        'zone_id',
        'last_activity_at',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'pin',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Boot the model and add event listeners
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically set the name field when christian_name or family_name changes
        static::saving(function ($user) {
            if ($user->christian_name || $user->family_name) {
                $user->name = trim($user->christian_name . ' ' . $user->family_name);
            }
        });
    }

    /**
     * Get the user's full name
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->christian_name . ' ' . $this->family_name);
    }

    /**
     * Get the user's display name (for non-admin users, use phone)
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->role === 'admin') {
            return $this->getFullNameAttribute();
        }
        return $this->phone ?? $this->getFullNameAttribute();
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is member
     */
    public function isMember(): bool
    {
        return $this->role === 'member';
    }

    /**
     * Check if user is unit leader
     */
    public function isUnitLeader(): bool
    {
        return $this->role === 'unit_leader';
    }

    /**
     * Check if user is zone leader
     */
    public function isZoneLeader(): bool
    {
        return $this->role === 'zone_leader';
    }

    /**
     * Authenticate user by phone and PIN
     */
    public static function authenticateByPhoneAndPin(string $phone, string $pin): ?self
    {
        // Normalize phone number - handle both 10-digit and 12-digit formats
        $normalizedPhone = self::normalizePhoneNumber($phone);
        
        $user = self::where(function ($query) use ($normalizedPhone) {
                $query->where('phone', $normalizedPhone)
                      ->orWhere('secondary_phone', $normalizedPhone);
            })
            ->whereIn('role', ['member', 'unit_leader', 'zone_leader'])
            ->first();

        if ($user && Hash::check($pin, $user->pin)) {
            return $user;
        }

        return null;
    }

    /**
     * Normalize phone number to 10-digit format (07XXXXXXXX)
     */
    public static function normalizePhoneNumber(string $phone): string
    {
        // Remove any non-digit characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // If it's already 10 digits and starts with 07, return as is
        if (strlen($phone) === 10 && strpos($phone, '07') === 0) {
            return $phone;
        }
        
        // If it's 12 digits and starts with 250, remove the prefix
        if (strlen($phone) === 12 && strpos($phone, '250') === 0) {
            return substr($phone, 3); // Remove '250' prefix
        }
        
        // If it's 9 digits and starts with 7, add 0 prefix
        if (strlen($phone) === 9 && strpos($phone, '7') === 0) {
            return '0' . $phone;
        }
        
        // Return as is if it doesn't match any pattern
        return $phone;
    }

    /**
     * Format phone number for display (ensure 10-digit format)
     */
    public static function formatPhoneForDisplay(string $phone): string
    {
        // Remove any non-digit characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // If it's 12 digits and starts with 250, remove the prefix
        if (strlen($phone) === 12 && strpos($phone, '250') === 0) {
            return substr($phone, 3); // Remove '250' prefix
        }
        
        // If it's 9 digits and starts with 7, add 0 prefix
        if (strlen($phone) === 9 && strpos($phone, '7') === 0) {
            return '0' . $phone;
        }
        
        // Return as is if it doesn't match the pattern
        return $phone;
    }

    /**
     * Authenticate admin by email and password
     */
    public static function authenticateAdmin(string $email, string $password): ?self
    {
        $user = self::where('email', $email)
            ->where('role', 'admin')
            ->first();

        if ($user && Hash::check($password, $user->password)) {
            return $user;
        }

        return null;
    }

    /**
     * Relationships
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function lands()
    {
        return $this->hasMany(Land::class);
    }

    public function crops()
    {
        return $this->hasMany(Crop::class);
    }

    public function produces()
    {
        return $this->hasMany(Produce::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function forms()
    {
        return $this->hasMany(Form::class);
    }

    /**
     * Get the user's activity logs
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get the user's error logs
     */
    public function errorLogs()
    {
        return $this->hasMany(ErrorLog::class);
    }

    /**
     * Get the user's login sessions
     */
    public function loginSessions()
    {
        return $this->hasMany(LoginSession::class);
    }

    /**
     * Get the user's active login sessions
     */
    public function activeLoginSessions()
    {
        return $this->hasMany(LoginSession::class)->where('is_active', true);
    }

    /**
     * Get the user's latest login session
     */
    public function latestLoginSession()
    {
        return $this->hasOne(LoginSession::class)->latest();
    }

    /**
     * Get the user's fee applications
     */
    public function feeApplications()
    {
        return $this->hasMany(FeeApplication::class);
    }

    /**
     * Get the user's fee payments
     */
    public function feePayments()
    {
        return $this->hasMany(MemberFee::class);
    }

    /**
     * Get the user's pending fees
     */
    public function pendingFees()
    {
        return $this->feeApplications()->whereIn('status', ['pending', 'overdue']);
    }

    /**
     * Get the user's paid fees
     */
    public function paidFees()
    {
        return $this->feeApplications()->where('status', 'paid');
    }
}
