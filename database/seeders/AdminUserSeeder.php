<?php

namespace Database\Seeders;

use App\Helpers\PasswordHelper;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only create admin user if it doesn't exist and environment allows
        if (!User::where('role', 'admin')->exists() && env('CREATE_DEFAULT_ADMIN', false)) {
            User::create([
                'christian_name' => env('ADMIN_FIRST_NAME', 'Admin'),
                'family_name' => env('ADMIN_LAST_NAME', 'User'),
                'email' => env('ADMIN_EMAIL', 'admin@koabiga.com'),
                'password' => env('ADMIN_PASSWORD', 'changeme'), // Will be hashed by model events
                'role' => 'admin',
                'status' => 'active',
                'bio' => 'System Administrator',
            ]);

            $this->command->info('Default admin user created. Please change the password immediately.');
        }

        // Only create test users in development
        if (app()->environment('local', 'development')) {
            // Create unit leader
            User::create([
                'christian_name' => 'Unit',
                'family_name' => 'Leader',
                'phone' => '1234567890',
                'id_passport' => 'LEADER001',
                'national_id' => 'LEADER123456',
                'gender' => 'male',
                'role' => 'unit_leader',
                'status' => 'active',
                'pin' => '12345', // Will be hashed by model events
                'bio' => 'Unit Leader',
            ]);

            // Create member
            User::create([
                'christian_name' => 'Test',
                'family_name' => 'Member',
                'phone' => '1234567891',
                'id_passport' => 'MEMBER001',
                'national_id' => 'MEMBER123456',
                'gender' => 'male',
                'role' => 'member',
                'status' => 'active',
                'pin' => '23456', // Will be hashed by model events
                'bio' => 'Test Member',
            ]);

            $this->command->info('Development users created successfully!');
            $this->command->info('Leader Login: 1234567890 / 12345');
            $this->command->info('Member Login: 1234567891 / 23456');
        }
    }
} 