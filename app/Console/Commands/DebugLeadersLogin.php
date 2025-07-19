<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DebugLeadersLogin extends Command
{
    protected $signature = 'debug:leaders-login {phone} {pin}';
    protected $description = 'Debug leaders login authentication process';

    public function handle()
    {
        $phone = $this->argument('phone');
        $pin = $this->argument('pin');

        $this->info("Testing leaders login with:");
        $this->info("Phone: {$phone}");
        $this->info("PIN: {$pin}");
        $this->line('');

        // Step 1: Normalize phone number
        $normalizedPhone = User::normalizePhoneNumber($phone);
        $this->info("Normalized phone: {$normalizedPhone}");

        // Step 2: Find user by phone
        $user = User::where('phone', $normalizedPhone)
                   ->orWhere('phone', $phone)
                   ->orWhere('secondary_phone', $normalizedPhone)
                   ->orWhere('secondary_phone', $phone)
                   ->first();

        if (!$user) {
            $this->error("❌ User not found with phone: {$phone}");
            $this->info("Available users with phone numbers:");
            User::whereNotNull('phone')->orWhereNotNull('secondary_phone')->get()->each(function($u) {
                $this->line("- ID: {$u->id}, Name: {$u->christian_name} {$u->family_name}, Phone: {$u->phone}, Secondary: {$u->secondary_phone}");
            });
            return 1;
        }

        $this->info("✅ User found: {$user->christian_name} {$user->family_name} (ID: {$user->id})");
        $this->info("User role: {$user->role}");
        $this->info("User phone: {$user->phone}");
        $this->info("User secondary phone: {$user->secondary_phone}");
        $this->line('');

        // Step 3: Check if user is a leader
        if (!in_array($user->role, ['unit_leader', 'zone_leader'])) {
            $this->error("❌ User is not a leader. Role: {$user->role}");
            return 1;
        }

        $this->info("✅ User is a leader");
        $this->line('');

        // Step 4: Test PIN authentication
        $this->info("Testing PIN authentication...");
        
        // Test the exact method used in User model
        $authenticatedUser = User::authenticateByPhoneAndPin($phone, $pin);
        
        if ($authenticatedUser) {
            $this->info("✅ Authentication successful!");
            $this->info("Authenticated user: {$authenticatedUser->christian_name} {$authenticatedUser->family_name}");
        } else {
            $this->error("❌ Authentication failed");
            
            // Debug PIN hashing
            $this->line('');
            $this->info("Debugging PIN hashing:");
            $this->info("Input PIN: {$pin}");
            $this->info("Stored PIN hash: {$user->pin}");
            
            // Test different PIN formats
            $testPins = [$pin, str_pad($pin, 5, '0', STR_PAD_LEFT), str_pad($pin, 5, '0', STR_PAD_RIGHT)];
            foreach ($testPins as $testPin) {
                $hash = Hash::make($testPin);
                $this->info("Testing PIN '{$testPin}' -> Hash: {$hash}");
                if (Hash::check($testPin, $user->pin)) {
                    $this->info("✅ PIN '{$testPin}' matches!");
                    break;
                }
            }
        }

        return 0;
    }


} 