<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordHelper
{
    /**
     * Hash a password using Laravel's Hash facade
     */
    public static function hashPassword(string $password): string
    {
        return Hash::make($password);
    }

    /**
     * Verify a password against a hash
     */
    public static function verifyPassword(string $password, string $hash): bool
    {
        return Hash::check($password, $hash);
    }

    /**
     * Generate a secure PIN (5 digits)
     */
    public static function generatePin(): string
    {
        return str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT);
    }

    /**
     * Hash a PIN using a simple method (for basic security)
     */
    public static function hashPin(string $pin): string
    {
        return hash('sha256', $pin . config('app.key'));
    }

    /**
     * Verify a PIN
     */
    public static function verifyPin(string $pin, string $hashedPin): bool
    {
        return self::hashPin($pin) === $hashedPin;
    }

    /**
     * Generate a secure random string for remember tokens
     */
    public static function generateRememberToken(): string
    {
        return Str::random(60);
    }

    /**
     * Check if a user can use email/password login
     */
    public static function canUseEmailLogin(string $role): bool
    {
        return in_array($role, ['admin']);
    }

    /**
     * Check if a user can use phone/PIN login
     */
    public static function canUsePhoneLogin(string $role): bool
    {
        return in_array($role, ['unit_leader', 'member']);
    }

    /**
     * Validate PIN format (5 digits)
     */
    public static function validatePinFormat(string $pin): bool
    {
        return preg_match('/^\d{5}$/', $pin);
    }

    /**
     * Validate password strength
     */
    public static function validatePasswordStrength(string $password): bool
    {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        return strlen($password) >= 8 
            && preg_match('/[A-Z]/', $password) 
            && preg_match('/[a-z]/', $password) 
            && preg_match('/[0-9]/', $password);
    }
} 