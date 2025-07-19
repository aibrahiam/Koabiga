<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // System settings
            ['category' => 'system', 'key' => 'app_name', 'value' => 'Koabiga', 'type' => 'string', 'description' => 'Application name', 'is_public' => true],
            ['category' => 'system', 'key' => 'app_version', 'value' => '1.0.0', 'type' => 'string', 'description' => 'Application version', 'is_public' => true],
            ['category' => 'system', 'key' => 'maintenance_mode', 'value' => 'false', 'type' => 'boolean', 'description' => 'Maintenance mode status', 'is_public' => true],
            ['category' => 'system', 'key' => 'debug_mode', 'value' => 'false', 'type' => 'boolean', 'description' => 'Debug mode status', 'is_public' => false],
            ['category' => 'system', 'key' => 'timezone', 'value' => 'Africa/Kigali', 'type' => 'string', 'description' => 'System timezone', 'is_public' => true],
            ['category' => 'system', 'key' => 'locale', 'value' => 'en', 'type' => 'string', 'description' => 'System locale', 'is_public' => true],

            // Email settings
            ['category' => 'email', 'key' => 'smtp_host', 'value' => '', 'type' => 'string', 'description' => 'SMTP host', 'is_public' => false],
            ['category' => 'email', 'key' => 'smtp_port', 'value' => '587', 'type' => 'integer', 'description' => 'SMTP port', 'is_public' => false],
            ['category' => 'email', 'key' => 'smtp_encryption', 'value' => 'tls', 'type' => 'string', 'description' => 'SMTP encryption', 'is_public' => false],
            ['category' => 'email', 'key' => 'from_address', 'value' => 'noreply@koabiga.com', 'type' => 'string', 'description' => 'From email address', 'is_public' => false],
            ['category' => 'email', 'key' => 'from_name', 'value' => 'Koabiga System', 'type' => 'string', 'description' => 'From name', 'is_public' => false],

            // Notification settings
            ['category' => 'notifications', 'key' => 'email_notifications', 'value' => 'true', 'type' => 'boolean', 'description' => 'Enable email notifications', 'is_public' => false],
            ['category' => 'notifications', 'key' => 'sms_notifications', 'value' => 'true', 'type' => 'boolean', 'description' => 'Enable SMS notifications', 'is_public' => false],
            ['category' => 'notifications', 'key' => 'push_notifications', 'value' => 'false', 'type' => 'boolean', 'description' => 'Enable push notifications', 'is_public' => false],
            ['category' => 'notifications', 'key' => 'activity_alerts', 'value' => 'true', 'type' => 'boolean', 'description' => 'Enable activity alerts', 'is_public' => false],
            ['category' => 'notifications', 'key' => 'report_reminders', 'value' => 'true', 'type' => 'boolean', 'description' => 'Enable report reminders', 'is_public' => false],

            // Security settings
            ['category' => 'security', 'key' => 'session_timeout', 'value' => '15', 'type' => 'integer', 'description' => 'Session timeout in minutes', 'is_public' => false],
            ['category' => 'security', 'key' => 'max_login_attempts', 'value' => '5', 'type' => 'integer', 'description' => 'Maximum login attempts', 'is_public' => false],
            ['category' => 'security', 'key' => 'password_expiry_days', 'value' => '90', 'type' => 'integer', 'description' => 'Password expiry in days', 'is_public' => false],
            ['category' => 'security', 'key' => 'two_factor_auth', 'value' => 'false', 'type' => 'boolean', 'description' => 'Enable two-factor authentication', 'is_public' => false],
            ['category' => 'security', 'key' => 'ip_whitelist', 'value' => '[]', 'type' => 'json', 'description' => 'IP whitelist', 'is_public' => false],

            // Agriculture settings
            ['category' => 'agriculture', 'key' => 'default_currency', 'value' => 'RWF', 'type' => 'string', 'description' => 'Default currency', 'is_public' => true],
            ['category' => 'agriculture', 'key' => 'land_measurement_unit', 'value' => 'hectares', 'type' => 'string', 'description' => 'Land measurement unit', 'is_public' => true],
            ['category' => 'agriculture', 'key' => 'crop_tracking_enabled', 'value' => 'true', 'type' => 'boolean', 'description' => 'Enable crop tracking', 'is_public' => false],
            ['category' => 'agriculture', 'key' => 'produce_tracking_enabled', 'value' => 'true', 'type' => 'boolean', 'description' => 'Enable produce tracking', 'is_public' => false],
            ['category' => 'agriculture', 'key' => 'fee_management_enabled', 'value' => 'true', 'type' => 'boolean', 'description' => 'Enable fee management', 'is_public' => false],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['category' => $setting['category'], 'key' => $setting['key']],
                $setting
            );
        }
    }
}
