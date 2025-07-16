<?php

namespace Database\Seeders;

use App\Models\Unit;
use App\Models\Zone;
use App\Models\User;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create zones first if they don't exist
        $zones = Zone::all();
        if ($zones->isEmpty()) {
            $zones = Zone::factory(3)->create();
        }

        // Create units
        $unitNames = [
            'Unit Alpha',
            'Unit Beta', 
            'Unit Gamma',
            'Unit Delta',
            'Unit Epsilon'
        ];

        foreach ($unitNames as $index => $name) {
            $zone = $zones->get($index % $zones->count());
            
            Unit::create([
                'name' => $name,
                'code' => 'U' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'description' => 'Agricultural unit for ' . $name,
                'zone_id' => $zone->id,
                'leader_id' => null, // Will be assigned later
                'status' => 'active',
            ]);
        }

        $this->command->info('Units seeded successfully!');
    }
} 