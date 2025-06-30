<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FeeRule;

class FeeRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $feeRules = [
            [
                'name' => 'Land Usage Fee',
                'type' => 'land',
                'amount' => 50.00,
                'frequency' => 'monthly',
                'unit' => 'per hectare',
                'status' => 'active',
                'applicable_to' => 'all_members',
                'description' => 'Monthly fee for land usage and maintenance',
                'effective_date' => '2024-01-01',
                'created_by' => 'System Admin',
            ],
            [
                'name' => 'Equipment Rental Fee',
                'type' => 'equipment',
                'amount' => 25.00,
                'frequency' => 'daily',
                'unit' => 'per day',
                'status' => 'scheduled',
                'applicable_to' => 'unit_leaders',
                'description' => 'Daily rental fee for agricultural equipment',
                'effective_date' => '2024-12-01',
                'created_by' => 'Admin User',
            ],
            [
                'name' => 'Processing Fee',
                'type' => 'processing',
                'amount' => 5.00,
                'frequency' => 'per_transaction',
                'unit' => 'per transaction',
                'status' => 'active',
                'applicable_to' => 'all_members',
                'description' => 'Processing fee for produce sales',
                'effective_date' => '2024-03-01',
                'created_by' => 'System Admin',
            ],
            [
                'name' => 'Storage Fee',
                'type' => 'storage',
                'amount' => 15.00,
                'frequency' => 'weekly',
                'unit' => 'per cubic meter',
                'status' => 'inactive',
                'applicable_to' => 'all_members',
                'description' => 'Weekly storage fee for harvested produce',
                'effective_date' => '2024-04-01',
                'created_by' => 'Admin User',
            ],
            [
                'name' => 'Training Fee',
                'type' => 'training',
                'amount' => 100.00,
                'frequency' => 'one_time',
                'unit' => 'per session',
                'status' => 'active',
                'applicable_to' => 'new_members',
                'description' => 'One-time training fee for new members',
                'effective_date' => '2024-05-01',
                'created_by' => 'System Admin',
            ],
            [
                'name' => 'Irrigation Fee',
                'type' => 'land',
                'amount' => 30.00,
                'frequency' => 'monthly',
                'unit' => 'per hectare',
                'status' => 'draft',
                'applicable_to' => 'active_members',
                'description' => 'Monthly irrigation service fee',
                'effective_date' => '2024-07-01',
                'created_by' => 'Admin User',
            ],
        ];

        foreach ($feeRules as $feeRule) {
            FeeRule::create($feeRule);
        }
    }
}
