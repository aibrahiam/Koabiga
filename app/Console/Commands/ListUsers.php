<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class ListUsers extends Command
{
    protected $signature = 'users:list';
    protected $description = 'List all users with their phone numbers';

    public function handle()
    {
        $users = User::whereIn('role', ['member', 'unit_leader', 'zone_leader'])->get();
        
        $this->info("Found {$users->count()} users:");
        
        foreach ($users as $user) {
            $this->line("ID: {$user->id}, Name: {$user->christian_name} {$user->family_name}, Phone: {$user->phone}, Role: {$user->role}");
        }
    }
} 