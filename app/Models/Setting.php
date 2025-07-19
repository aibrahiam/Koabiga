<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'key',
        'value',
        'type',
        'description',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Get setting value by category and key
     */
    public static function getValue(string $category, string $key, $default = null)
    {
        $cacheKey = "setting.{$category}.{$key}";
        
        return Cache::remember($cacheKey, now()->addHours(24), function () use ($category, $key, $default) {
            $setting = self::where('category', $category)
                          ->where('key', $key)
                          ->first();
            
            if (!$setting) {
                return $default;
            }

            return self::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Set setting value
     */
    public static function setValue(string $category, string $key, $value, string $type = 'string', string $description = null): bool
    {
        $setting = self::updateOrCreate(
            ['category' => $category, 'key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'description' => $description,
            ]
        );

        // Clear cache
        Cache::forget("setting.{$category}.{$key}");

        return $setting->exists;
    }

    /**
     * Get all settings by category
     */
    public static function getCategory(string $category): array
    {
        $cacheKey = "settings.category.{$category}";
        
        return Cache::remember($cacheKey, now()->addHours(24), function () use ($category) {
            return self::where('category', $category)
                      ->get()
                      ->mapWithKeys(function ($setting) {
                          return [$setting->key => self::castValue($setting->value, $setting->type)];
                      })
                      ->toArray();
        });
    }

    /**
     * Get public settings
     */
    public static function getPublic(): array
    {
        return self::where('is_public', true)
                  ->get()
                  ->mapWithKeys(function ($setting) {
                      return [$setting->key => self::castValue($setting->value, $setting->type)];
                  })
                  ->toArray();
    }

    /**
     * Cast value based on type
     */
    private static function castValue($value, string $type)
    {
        if ($value === null) {
            return null;
        }

        switch ($type) {
            case 'integer':
                return (int) $value;
            case 'boolean':
                return (bool) $value;
            case 'json':
                return json_decode($value, true);
            case 'float':
                return (float) $value;
            default:
                return (string) $value;
        }
    }

    /**
     * Clear all settings cache
     */
    public static function clearCache(): void
    {
        $settings = self::all();
        foreach ($settings as $setting) {
            Cache::forget("setting.{$setting->category}.{$setting->key}");
        }
        Cache::forget("settings.category.{$setting->category}");
    }
}
