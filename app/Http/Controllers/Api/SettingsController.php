<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

class SettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Mock settings data
        $settings = [
            'system' => [
                'app_name' => 'Koabiga',
                'app_version' => '1.0.0',
                'maintenance_mode' => false,
                'debug_mode' => false,
                'timezone' => 'Africa/Kigali',
                'locale' => 'en',
            ],
            'email' => [
                'smtp_host' => 'smtp.mailtrap.io',
                'smtp_port' => 2525,
                'smtp_encryption' => 'tls',
                'from_address' => 'noreply@koabiga.com',
                'from_name' => 'Koabiga System',
            ],
            'notifications' => [
                'email_notifications' => true,
                'sms_notifications' => true,
                'push_notifications' => false,
                'activity_alerts' => true,
                'report_reminders' => true,
            ],
            'security' => [
                'session_timeout' => 15, // minutes
                'max_login_attempts' => 5,
                'password_expiry_days' => 90,
                'two_factor_auth' => false,
                'ip_whitelist' => [],
            ],
            'agriculture' => [
                'default_currency' => 'RWF',
                'land_measurement_unit' => 'hectares',
                'crop_tracking_enabled' => true,
                'produce_tracking_enabled' => true,
                'fee_management_enabled' => true,
            ],
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

        // Mock settings update
        $updatedSettings = $validated['settings'];

        // In a real implementation, you would save these to a settings table or config files
        foreach ($updatedSettings as $category => $settings) {
            foreach ($settings as $key => $value) {
                // Store in cache for now
                Cache::put("settings.{$category}.{$key}", $value, now()->addDays(30));
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
        // Public settings that don't require authentication
        $publicSettings = [
            'app_name' => 'Koabiga',
            'app_version' => '1.0.0',
            'maintenance_mode' => false,
            'timezone' => 'Africa/Kigali',
            'locale' => 'en',
            'default_currency' => 'RWF',
            'land_measurement_unit' => 'hectares',
        ];

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
            // Reset all settings
            Cache::flush();
        } else {
            // Reset specific category
            $keys = Cache::get("settings.{$category}.*");
            foreach ($keys as $key) {
                Cache::forget($key);
            }
        }

        return response()->json([
            'success' => true,
            'message' => ucfirst($category) . ' settings reset to defaults'
        ]);
    }

    public function show(string $key): JsonResponse
    {
        // Get specific setting value
        $value = Cache::get("settings.{$key}", null);

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
} 