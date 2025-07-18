<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ErrorLogService;
use App\Models\User;

class GenerateTestErrors extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:generate-errors {count=5 : Number of errors to generate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate test errors for demonstration purposes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = (int) $this->argument('count');
        $users = User::whereIn('role', ['admin', 'unit_leader', 'zone_leader', 'member'])->get();

        if ($users->isEmpty()) {
            $this->error('No users found. Please create users first.');
            return 1;
        }

        $this->info("Generating {$count} test errors...");

        $errorTypes = [
            'database' => [
                'Database connection timeout',
                'Query execution failed',
                'Table does not exist',
                'Column not found',
                'Foreign key constraint violation',
            ],
            'validation' => [
                'Invalid email format provided',
                'Required field missing',
                'File size exceeds limit',
                'Invalid file type',
                'Duplicate entry detected',
            ],
            'authentication' => [
                'Invalid credentials provided',
                'Account locked due to failed attempts',
                'Session expired',
                'Insufficient permissions',
                'Token validation failed',
            ],
            'api' => [
                'API rate limit exceeded',
                'Invalid API endpoint',
                'Request timeout',
                'Service unavailable',
                'Invalid response format',
            ],
        ];

        for ($i = 0; $i < $count; $i++) {
            $errorType = array_rand($errorTypes);
            $messages = $errorTypes[$errorType];
            $message = $messages[array_rand($messages)];
            $user = $users->random();

            switch ($errorType) {
                case 'database':
                    ErrorLogService::logDatabaseError($message, 'SELECT * FROM non_existent_table', [], $user->id);
                    break;
                case 'validation':
                    ErrorLogService::logValidationError($message, ['field' => 'email', 'rule' => 'email'], $user->id);
                    break;
                case 'authentication':
                    ErrorLogService::logAuthError($message, ['email' => 'test@example.com'], $user->id);
                    break;
                case 'api':
                    ErrorLogService::logApiError($message, '/api/users', ['code' => 429, 'body' => 'Rate limit exceeded'], $user->id);
                    break;
            }

            $this->line("Generated {$errorType} error: {$message}");
        }

        $this->info("Successfully generated {$count} test errors!");
        return 0;
    }
} 