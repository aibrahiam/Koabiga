<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Setting;
use Illuminate\Support\Facades\Artisan;

class SettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Get settings from database with fallback to config
        $settings = [
            'system' => [
                'app_name' => Setting::getValue('system', 'app_name', config('app.name', 'Koabiga')),
                'app_version' => Setting::getValue('system', 'app_version', config('app.version', '1.0.0')),
                'maintenance_mode' => Setting::getValue('system', 'maintenance_mode', app()->isDownForMaintenance()),
                'debug_mode' => Setting::getValue('system', 'debug_mode', config('app.debug', false)),
                'timezone' => Setting::getValue('system', 'timezone', config('app.timezone', 'Africa/Kigali')),
                'locale' => Setting::getValue('system', 'locale', config('app.locale', 'en')),
            ],
            'email' => [
                'smtp_host' => Setting::getValue('email', 'smtp_host', config('mail.mailers.smtp.host', '')),
                'smtp_port' => Setting::getValue('email', 'smtp_port', config('mail.mailers.smtp.port', 587)),
                'smtp_encryption' => Setting::getValue('email', 'smtp_encryption', config('mail.mailers.smtp.encryption', 'tls')),
                'from_address' => Setting::getValue('email', 'from_address', config('mail.from.address', 'noreply@koabiga.com')),
                'from_name' => Setting::getValue('email', 'from_name', config('mail.from.name', 'Koabiga System')),
            ],
            'notifications' => Setting::getCategory('notifications'),
            'security' => Setting::getCategory('security'),
            'agriculture' => Setting::getCategory('agriculture'),
        ];

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.system' => 'nullable|array',
            'settings.email' => 'nullable|array',
            'settings.notifications' => 'nullable|array',
            'settings.security' => 'nullable|array',
            'settings.agriculture' => 'nullable|array',
        ]);

        $updatedSettings = $validated['settings'];

        // Store settings in database
        foreach ($updatedSettings as $category => $settings) {
            foreach ($settings as $key => $value) {
                $type = $this->determineType($value);
                Setting::setValue($category, $key, $value, $type);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $updatedSettings
        ]);
    }

    public function public(): JsonResponse
    {
        // Get public settings from database
        $publicSettings = Setting::getPublic();

        return response()->json([
            'success' => true,
            'data' => $publicSettings
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|in:system,email,notifications,security,agriculture,all',
        ]);

        $category = $validated['category'];

        if ($category === 'all') {
            // Reset all settings by deleting them (will be recreated by seeder)
            Setting::truncate();
            // Re-seed default settings
            Artisan::call('db:seed', ['--class' => 'SettingsSeeder']);
        } else {
            // Reset specific category
            Setting::where('category', $category)->delete();
            // Re-seed only that category
            Artisan::call('db:seed', ['--class' => 'SettingsSeeder']);
        }

        return response()->json([
            'success' => true,
            'message' => ucfirst($category) . ' settings reset to defaults'
        ]);
    }

    public function show(string $key): JsonResponse
    {
        // Parse category and key from dot notation (e.g., "system.app_name")
        $parts = explode('.', $key);
        if (count($parts) !== 2) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid setting key format. Use category.key format.'
            ], 400);
        }

        [$category, $settingKey] = $parts;
        $value = Setting::getValue($category, $settingKey);

        if ($value === null) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'key' => $key,
                'value' => $value,
            ]
        ]);
    }

    /**
     * Determine the type of a value for storage
     */
    private function determineType($value): string
    {
        if (is_bool($value)) {
            return 'boolean';
        } elseif (is_int($value)) {
            return 'integer';
        } elseif (is_float($value)) {
            return 'float';
        } elseif (is_array($value)) {
            return 'json';
        } else {
            return 'string';
        }
    }
} 