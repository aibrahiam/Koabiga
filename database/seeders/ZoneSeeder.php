<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zones = [
            [
                'name' => 'North Agricultural Zone',
                'code' => 'NAZ',
                'description' => 'Primary agricultural zone covering the northern region with fertile soil and good irrigation',
                'location' => 'Northern Region, District A',
                'status' => 'active',
            ],
            [
                'name' => 'South Valley Zone',
                'code' => 'SVZ',
                'description' => 'Valley-based agricultural zone with excellent water resources and moderate climate',
                'location' => 'Southern Valley, District B',
                'status' => 'active',
            ],
            [
                'name' => 'East Highlands Zone',
                'code' => 'EHZ',
                'description' => 'Highland agricultural zone specializing in terrace farming and specialty crops',
                'location' => 'Eastern Highlands, District C',
                'status' => 'active',
            ],
            [
                'name' => 'West Plains Zone',
                'code' => 'WPZ',
                'description' => 'Plains-based zone with large-scale farming operations and modern equipment',
                'location' => 'Western Plains, District D',
                'status' => 'active',
            ],
            [
                'name' => 'Central Hub Zone',
                'code' => 'CHZ',
                'description' => 'Central zone serving as the main distribution and processing hub',
                'location' => 'Central District, Main City',
                'status' => 'active',
            ],
            [
                'name' => 'Coastal Zone',
                'code' => 'CZ',
                'description' => 'Coastal agricultural zone with unique climate conditions for specialty crops',
                'location' => 'Coastal Region, District E',
                'status' => 'inactive',
            ],
        ];

        foreach ($zones as $zoneData) {
            Zone::create($zoneData);
        }

        $this->command->info('Zones seeded successfully!');
    }
} 