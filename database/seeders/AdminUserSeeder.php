<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@koabiga.com'],
            [
                'christian_name' => 'Admin',
                'family_name' => 'User',
                'name' => 'Admin User',
                'password' => Hash::make('A6bi1881994@'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $this->command->info('Admin user created/updated successfully!');
    }
} 