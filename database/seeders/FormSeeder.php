<?php

namespace Database\Seeders;

use App\Models\Form;
use App\Models\User;
use Illuminate\Database\Seeder;

class FormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user for form creation
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            $this->command->error('Admin user not found. Please run DatabaseSeeder first.');
            return;
        }

        $forms = [
            [
                'name' => 'member_registration',
                'title' => 'Member Registration Form',
                'type' => 'registration',
                'category' => 'member',
                'description' => 'Form for registering new members to the agricultural unit',
                'fields' => [
                    [
                        'name' => 'christian_name',
                        'type' => 'text',
                        'label' => 'Christian Name',
                        'required' => true,
                        'placeholder' => 'Enter christian name'
                    ],
                    [
                        'name' => 'family_name',
                        'type' => 'text',
                        'label' => 'Family Name',
                        'required' => true,
                        'placeholder' => 'Enter family name'
                    ],
                    [
                        'name' => 'phone',
                        'type' => 'text',
                        'label' => 'Phone Number',
                        'required' => true,
                        'placeholder' => '07XXXXXXXX'
                    ],
                    [
                        'name' => 'id_passport',
                        'type' => 'text',
                        'label' => 'ID/Passport Number',
                        'required' => true,
                        'placeholder' => 'Enter ID or passport number'
                    ]
                ],
                'status' => 'active',
                'target_roles' => ['unit_leader'],
                'user_id' => $admin->id
            ],
            [
                'name' => 'land_assignment',
                'title' => 'Land Assignment Request',
                'type' => 'request',
                'category' => 'land',
                'description' => 'Form for requesting land assignment for unit members',
                'fields' => [
                    [
                        'name' => 'land_number',
                        'type' => 'text',
                        'label' => 'Land Number',
                        'required' => true,
                        'placeholder' => 'Enter land number'
                    ],
                    [
                        'name' => 'zone',
                        'type' => 'text',
                        'label' => 'Zone',
                        'required' => true,
                        'placeholder' => 'Enter zone'
                    ],
                    [
                        'name' => 'area',
                        'type' => 'number',
                        'label' => 'Area (Hectares)',
                        'required' => true,
                        'placeholder' => '0.00'
                    ],
                    [
                        'name' => 'member_id',
                        'type' => 'select',
                        'label' => 'Assign to Member',
                        'required' => true,
                        'options' => ['Select member']
                    ]
                ],
                'status' => 'active',
                'target_roles' => ['unit_leader'],
                'user_id' => $admin->id
            ],
            [
                'name' => 'crop_registration',
                'title' => 'Crop Registration Form',
                'type' => 'registration',
                'category' => 'crop',
                'description' => 'Form for registering new crops in the unit',
                'fields' => [
                    [
                        'name' => 'crop_name',
                        'type' => 'text',
                        'label' => 'Crop Name',
                        'required' => true,
                        'placeholder' => 'Enter crop name'
                    ],
                    [
                        'name' => 'crop_type',
                        'type' => 'select',
                        'label' => 'Crop Type',
                        'required' => true,
                        'options' => ['maize', 'beans', 'rice', 'wheat', 'potatoes', 'cassava', 'vegetables', 'fruits']
                    ],
                    [
                        'name' => 'variety',
                        'type' => 'text',
                        'label' => 'Crop Variety',
                        'required' => true,
                        'placeholder' => 'Enter crop variety'
                    ],
                    [
                        'name' => 'planting_date',
                        'type' => 'date',
                        'label' => 'Planting Date',
                        'required' => true
                    ],
                    [
                        'name' => 'area_planted',
                        'type' => 'number',
                        'label' => 'Area Planted (Hectares)',
                        'required' => true,
                        'placeholder' => '0.00'
                    ]
                ],
                'status' => 'active',
                'target_roles' => ['unit_leader'],
                'user_id' => $admin->id
            ],
            [
                'name' => 'harvest_report',
                'title' => 'Harvest Report Form',
                'type' => 'report',
                'category' => 'harvest',
                'description' => 'Form for reporting harvest yields and produce',
                'fields' => [
                    [
                        'name' => 'produce_name',
                        'type' => 'text',
                        'label' => 'Produce Name',
                        'required' => true,
                        'placeholder' => 'Enter produce name'
                    ],
                    [
                        'name' => 'crop_id',
                        'type' => 'select',
                        'label' => 'Source Crop',
                        'required' => true,
                        'options' => ['Select crop']
                    ],
                    [
                        'name' => 'harvest_date',
                        'type' => 'date',
                        'label' => 'Harvest Date',
                        'required' => true
                    ],
                    [
                        'name' => 'quantity_harvested',
                        'type' => 'number',
                        'label' => 'Quantity Harvested (kg)',
                        'required' => true,
                        'placeholder' => '0.00'
                    ],
                    [
                        'name' => 'quality_grade',
                        'type' => 'select',
                        'label' => 'Quality Grade',
                        'required' => true,
                        'options' => ['grade_a', 'grade_b', 'grade_c', 'rejected']
                    ]
                ],
                'status' => 'active',
                'target_roles' => ['unit_leader'],
                'user_id' => $admin->id
            ]
        ];

        foreach ($forms as $formData) {
            Form::create($formData);
        }

        $this->command->info('Created ' . count($forms) . ' sample forms');
    }
} 