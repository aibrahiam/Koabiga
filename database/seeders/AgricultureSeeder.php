<?php

namespace Database\Seeders;

use App\Models\Land;
use App\Models\Crop;
use App\Models\Produce;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;

class AgricultureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only seed sample data in development environments
        if (!app()->environment('local', 'development')) {
            $this->command->info('Agriculture seeder skipped in production environment.');
            return;
        }

        // Get some users for seeding
        $users = User::where('role', 'member')->take(5)->get();
        $units = Unit::take(3)->get();

        if ($users->isEmpty()) {
            $this->command->warn('No member users found. Skipping agriculture seeding.');
            return;
        }

        // Create sample lands
        foreach ($users as $user) {
            $unit = $units->random();
            
            Land::create([
                'name' => 'Land ' . $user->id,
                'description' => 'Sample agricultural land',
                'area' => rand(1, 10),
                'location' => 'Zone ' . rand(1, 5),
                'soil_type' => ['clay', 'loam', 'sandy'][rand(0, 2)],
                'user_id' => $user->id,
                'unit_id' => $unit->id,
            ]);
        }

        // Create sample crops
        $lands = Land::all();
        $cropTypes = ['corn', 'wheat', 'rice', 'beans', 'potatoes'];

        foreach ($lands as $land) {
            Crop::create([
                'name' => $cropTypes[rand(0, 4)] . ' crop',
                'crop_name' => $cropTypes[rand(0, 4)],
                'type' => 'grain',
                'crop_type' => 'annual',
                'variety' => 'Standard',
                'planting_date' => now()->subDays(rand(30, 90)),
                'expected_harvest_date' => now()->addDays(rand(30, 120)),
                'area_planted' => $land->area * 0.8,
                'seed_quantity' => rand(10, 50),
                'land_id' => $land->id,
                'unit_id' => $land->unit_id,
                'user_id' => $land->user_id,
            ]);
        }

        // Create sample produce
        $crops = Crop::all();

        foreach ($crops as $crop) {
            if (rand(1, 3) === 1) { // 33% chance of having produce
                Produce::create([
                    'name' => $crop->crop_name . ' harvest',
                    'description' => 'Harvested ' . $crop->crop_name,
                    'quantity' => rand(100, 1000),
                    'unit' => 'kg',
                    'harvest_date' => now()->subDays(rand(1, 30)),
                    'quality_grade' => ['A', 'B', 'C'][rand(0, 2)],
                    'crop_id' => $crop->id,
                    'land_id' => $crop->land_id,
                    'unit_id' => $crop->unit_id,
                    'user_id' => $crop->user_id,
                ]);
            }
        }

        $this->command->info('Agriculture data seeded successfully!');
    }
} 