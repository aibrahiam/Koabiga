<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ErrorLog;
use App\Models\User;
use Carbon\Carbon;

class ErrorLogSeeder extends Seeder
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

        $errorMessages = [
            'error' => [
                'Database connection failed: Connection refused',
                'SQLSTATE[42S02]: Base table or view not found: 1146 Table \'koabiga.users\' doesn\'t exist',
                'Class "App\\Services\\NonExistentService" not found',
                'Call to undefined method App\\Models\\User::nonExistentMethod()',
                'Division by zero',
                'Maximum execution time of 30 seconds exceeded',
                'Allowed memory size of 134217728 bytes exhausted',
                'Undefined variable: $undefinedVariable',
                'Trying to get property of non-object',
                'Cannot use object of type stdClass as array',
            ],
            'warning' => [
                'API rate limit exceeded for endpoint /api/users',
                'Deprecated function mysql_connect() called',
                'File upload size exceeds limit',
                'Session timeout warning',
                'Database query took longer than expected',
                'Memory usage is high',
                'Slow database query detected',
                'Invalid email format provided',
                'Missing required field in form submission',
                'Duplicate entry for unique constraint',
            ],
            'info' => [
                'User session started',
                'Database backup completed successfully',
                'Cache cleared successfully',
                'Email sent successfully',
                'File uploaded successfully',
                'User profile updated',
                'System maintenance completed',
                'New user registered',
                'Password reset requested',
                'Login attempt recorded',
            ],
        ];

        $files = [
            'app/Http/Controllers/Admin/UserController.php',
            'app/Models/User.php',
            'app/Services/AuthService.php',
            'resources/views/admin/dashboard.blade.php',
            'database/migrations/2024_01_01_create_users_table.php',
            'app/Http/Middleware/Authenticate.php',
            'routes/web.php',
            'config/database.php',
            'app/Providers/AppServiceProvider.php',
            'public/js/app.js',
        ];

        // Generate error logs for the past 30 days
        for ($i = 0; $i < 50; $i++) {
            $level = array_rand($errorMessages);
            $messages = $errorMessages[$level];
            $message = $messages[array_rand($messages)];
            
            $user = $users->random();
            $file = $files[array_rand($files)];
            $line = rand(1, 500);
            
            // Generate random timestamp within the past 30 days
            $timestamp = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            // Some errors should be resolved
            $resolved = rand(1, 10) <= 3; // 30% chance of being resolved
            $resolvedAt = $resolved ? $timestamp->copy()->addHours(rand(1, 24)) : null;
            $resolvedBy = $resolved ? $users->random()->id : null;

            ErrorLog::create([
                'user_id' => $user->id,
                'level' => $level,
                'message' => $message,
                'stack_trace' => $level === 'error' ? $this->generateStackTrace($file, $line) : null,
                'file' => $level === 'error' ? $file : null,
                'line' => $level === 'error' ? $line : null,
                'context' => [
                    'url' => 'https://koabiga.com/admin/' . strtolower(str_replace(' ', '-', $message)),
                    'method' => ['GET', 'POST', 'PUT', 'DELETE'][array_rand(['GET', 'POST', 'PUT', 'DELETE'])],
                    'ip_address' => $this->generateRandomIP(),
                    'user_agent' => $this->generateRandomUserAgent(),
                    'timestamp' => $timestamp->toISOString(),
                    'exception_class' => $level === 'error' ? 'Exception' : null,
                    'exception_code' => $level === 'error' ? rand(1000, 9999) : null,
                ],
                'resolved' => $resolved,
                'resolved_at' => $resolvedAt,
                'resolved_by' => $resolvedBy,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);
        }

        $this->command->info('Error logs seeded successfully!');
    }

    private function generateStackTrace($file, $line): string
    {
        return "#0 {$file}({$line}): Illuminate\\Database\\Eloquent\\Model::findOrFail()
#1 app/Http/Controllers/Admin/UserController.php(45): App\\Http\\Controllers\\Admin\\UserController->show()
#2 vendor/laravel/framework/src/Illuminate/Routing/Controller.php(54): call_user_func_array()
#3 vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php(45): Illuminate\\Routing\\Controller->callAction()
#4 vendor/laravel/framework/src/Illuminate/Routing/Route.php(254): Illuminate\\Routing\\ControllerDispatcher->dispatch()
#5 vendor/laravel/framework/src/Illuminate/Routing/Route.php(197): Illuminate\\Routing\\Route->runController()
#6 vendor/laravel/framework/src/Illuminate/Routing/Router.php(726): Illuminate\\Routing\\Route->run()
#7 vendor/laravel/framework/src/Illuminate/Routing/Router.php(703): Illuminate\\Routing\\Router->runRouteWithinStack()
#8 vendor/laravel/framework/src/Illuminate/Routing/Router.php(667): Illuminate\\Routing\\Router->runRoute()
#9 vendor/laravel/framework/src/Illuminate/Routing/Router.php(656): Illuminate\\Routing\\Router->dispatchToRoute()
#10 vendor/laravel/framework/src/Illuminate/Routing/Router.php(635): Illuminate\\Routing\\Router->dispatch()";
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