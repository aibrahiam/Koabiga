<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestAuth extends Command
{
    protected $signature = 'auth:test {phone} {pin}';
    protected $description = 'Test user authentication with phone and PIN';

    public function handle()
    {
        $phone = $this->argument('phone');
        $pin = $this->argument('pin');

        $this->info("Testing authentication for phone: {$phone}, PIN: {$pin}");

        // Test the normalizePhoneNumber method
        $normalizedPhone = User::normalizePhoneNumber($phone);
        $this->info("Normalized phone (10-digit): {$normalizedPhone}");

        // Find user by phone
        $user = User::where(function ($query) use ($normalizedPhone) {
                $query->where('phone', $normalizedPhone)
                      ->orWhere('secondary_phone', $normalizedPhone);
            })
            ->whereIn('role', ['member', 'unit_leader', 'zone_leader'])
            ->first();

        if (!$user) {
            $this->error("No user found with phone: {$phone}");
            $this->info("Checking all users in database:");
            User::whereIn('role', ['member', 'unit_leader', 'zone_leader'])->get()->each(function($u) {
                $this->line("  - ID: {$u->id}, Name: {$u->christian_name} {$u->family_name}, Phone: {$u->phone}, Role: {$u->role}");
            });
            return;
        }

        $this->info("User found: {$user->christian_name} {$user->family_name} (Role: {$user->role})");
        $this->info("PIN hash: {$user->pin}");

        // Test PIN verification
        if (Hash::check($pin, $user->pin)) {
            $this->info("✅ PIN verification successful!");
        } else {
            $this->error("❌ PIN verification failed!");
        }

        // Test the authenticateByPhoneAndPin method
        $authenticatedUser = User::authenticateByPhoneAndPin($phone, $pin);
        if ($authenticatedUser) {
            $this->info("✅ Authentication successful via authenticateByPhoneAndPin method!");
        } else {
            $this->error("❌ Authentication failed via authenticateByPhoneAndPin method!");
        }
    }
} 