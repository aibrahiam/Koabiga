<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityLog;
use App\Models\User;
use Carbon\Carbon;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::whereIn('role', ['admin', 'unit_leader', 'zone_leader', 'member'])->get();
        
        if ($users->isEmpty()) {
            $this->command->info('No users found. Please run UserSeeder first.');
            return;
        }

        $actions = [
            'login' => [
                'User {user} logged in successfully',
                'User {user} accessed the system',
                'User {user} started a new session',
            ],
            'logout' => [
                'User {user} logged out',
                'User {user} ended their session',
                'User {user} signed out of the system',
            ],
            'create' => [
                'Fee rule "{item}" created',
                'Unit "{item}" created',
                'Member "{item}" created',
                'Zone "{item}" created',
            ],
            'update' => [
                'Fee rule "{item}" updated',
                'Unit "{item}" updated',
                'Member "{item}" updated',
                'Zone "{item}" updated',
            ],
            'delete' => [
                'Fee rule "{item}" deleted',
                'Unit "{item}" deleted',
                'Member "{item}" deleted',
            ],
            'apply' => [
                'Fee rule "{item}" applied to {count} users',
                'Fee rule "{item}" scheduled for application',
                'Fee rule "{item}" activated',
            ],
            'error' => [
                'System error: Database connection failed',
                'System error: Invalid fee rule configuration',
                'System error: User authentication failed',
                'System error: File upload failed',
            ],
        ];

        $items = [
            'Monthly Land Fee',
            'Equipment Processing Fee',
            'Storage Fee',
            'Training Fee',
            'Unit A',
            'Unit B',
            'Unit C',
            'Zone 1',
            'Zone 2',
            'John Doe',
            'Jane Smith',
            'Mike Johnson',
        ];

        // Generate activity logs for the past 30 days
        for ($i = 0; $i < 100; $i++) {
            $action = array_rand($actions);
            $actionTemplates = $actions[$action];
            $template = $actionTemplates[array_rand($actionTemplates)];
            
            $description = $template;
            
            // Replace placeholders
            if (str_contains($description, '{user}')) {
                $user = $users->random();
                $description = str_replace('{user}', $user->email, $description);
                $userId = $user->id;
            } else {
                $userId = $users->random()->id;
            }
            
            if (str_contains($description, '{item}')) {
                $item = $items[array_rand($items)];
                $description = str_replace('{item}', $item, $description);
            }
            
            if (str_contains($description, '{count}')) {
                $count = rand(5, 50);
                $description = str_replace('{count}', $count, $description);
            }

            // Generate random timestamp within the past 30 days
            $timestamp = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            ActivityLog::create([
                'user_id' => $action === 'error' ? null : $userId,
                'action' => $action,
                'description' => $description,
                'ip_address' => $this->generateRandomIP(),
                'user_agent' => $this->generateRandomUserAgent(),
                'metadata' => [
                    'timestamp' => $timestamp->toISOString(),
                    'action_type' => $action,
                    'random_data' => rand(1000, 9999),
                ],
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);
        }

        $this->command->info('Activity logs seeded successfully!');
    }

    private function generateRandomIP(): string
    {
        return rand(1, 255) . '.' . rand(0, 255) . '.' . rand(0, 255) . '.' . rand(0, 255);
    }

    private function generateRandomUserAgent(): string
    {
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        ];
        
        return $userAgents[array_rand($userAgents)];
    }
} 