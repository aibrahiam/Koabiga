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
        // Create admin user
        User::create([
            'christian_name' => 'Admin',
            'family_name' => 'User',
            'name' => 'Admin User',
            'email' => 'admin@koabiga.com',
            'password' => 'admin123', // Will be hashed by model events
            'role' => 'admin',
            'status' => 'active',
            'bio' => 'System Administrator',
        ]);

        // Create unit leader
        User::create([
            'christian_name' => 'Unit',
            'family_name' => 'Leader',
            'name' => 'Unit Leader',
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
            'name' => 'Test Member',
            'phone' => '1234567891',
            'id_passport' => 'MEMBER001',
            'national_id' => 'MEMBER123456',
            'gender' => 'male',
            'role' => 'member',
            'status' => 'active',
            'pin' => '23456', // Will be hashed by model events
            'bio' => 'Test Member',
        ]);

        $this->command->info('Admin, Leader, and Member users created successfully!');
        $this->command->info('Admin Login: admin@koabiga.com / admin123');
        $this->command->info('Leader Login: 1234567890 / 12345');
        $this->command->info('Member Login: 1234567891 / 23456');
    }
} 