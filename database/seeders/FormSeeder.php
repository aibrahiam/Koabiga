<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Form;
use App\Services\FormService;

class FormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding forms...');
        
        // First, sync forms from the leaders folder
        $result = FormService::syncForms();
        
        $this->command->info("Synced {$result['total_synced']} forms from leaders folder");
        
        // Add some additional forms if needed
        $additionalForms = [
            [
                'name' => 'feedback-form',
                'title' => 'Feedback Form',
                'type' => 'feedback',
                'category' => 'other',
                'description' => 'General feedback form for members and leaders',
                'fields' => [
                    [
                        'name' => 'feedback_type',
                        'type' => 'select',
                        'label' => 'Feedback Type',
                        'required' => true,
                        'options' => ['General', 'Technical', 'Suggestion', 'Complaint'],
                        'placeholder' => 'Select feedback type',
                        'description' => 'Choose the type of feedback you want to provide'
                    ],
                    [
                        'name' => 'subject',
                        'type' => 'text',
                        'label' => 'Subject',
                        'required' => true,
                        'placeholder' => 'Enter feedback subject',
                        'description' => 'Brief subject of your feedback'
                    ],
                    [
                        'name' => 'message',
                        'type' => 'textarea',
                        'label' => 'Message',
                        'required' => true,
                        'placeholder' => 'Enter your feedback message',
                        'description' => 'Detailed feedback message'
                    ],
                    [
                        'name' => 'rating',
                        'type' => 'radio',
                        'label' => 'Rating',
                        'required' => false,
                        'options' => ['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent'],
                        'description' => 'Rate your overall experience'
                    ]
                ],
                'target_roles' => ['admin', 'unit_leader', 'member'],
                'status' => 'active',
                'user_id' => 1,
            ],
            [
                'name' => 'training-request',
                'title' => 'Training Request Form',
                'type' => 'request',
                'category' => 'training',
                'description' => 'Request training sessions for members',
                'fields' => [
                    [
                        'name' => 'training_topic',
                        'type' => 'text',
                        'label' => 'Training Topic',
                        'required' => true,
                        'placeholder' => 'Enter training topic',
                        'description' => 'What training do you need?'
                    ],
                    [
                        'name' => 'training_type',
                        'type' => 'select',
                        'label' => 'Training Type',
                        'required' => true,
                        'options' => ['Agricultural', 'Financial', 'Leadership', 'Technical', 'Other'],
                        'placeholder' => 'Select training type',
                        'description' => 'Type of training required'
                    ],
                    [
                        'name' => 'participants_count',
                        'type' => 'number',
                        'label' => 'Number of Participants',
                        'required' => true,
                        'placeholder' => 'Enter number of participants',
                        'description' => 'How many people will attend?'
                    ],
                    [
                        'name' => 'preferred_date',
                        'type' => 'date',
                        'label' => 'Preferred Date',
                        'required' => true,
                        'description' => 'When would you like the training?'
                    ],
                    [
                        'name' => 'additional_notes',
                        'type' => 'textarea',
                        'label' => 'Additional Notes',
                        'required' => false,
                        'placeholder' => 'Any additional information',
                        'description' => 'Additional notes or requirements'
                    ]
                ],
                'target_roles' => ['unit_leader'],
                'status' => 'active',
                'user_id' => 1,
            ]
        ];

        foreach ($additionalForms as $formData) {
            Form::updateOrCreate(
                ['name' => $formData['name']],
                $formData
            );
        }

        $this->command->info('Forms seeded successfully!');
    }
} 