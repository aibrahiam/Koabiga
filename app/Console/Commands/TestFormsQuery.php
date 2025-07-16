<?php

namespace App\Console\Commands;

use App\Models\Form;
use Illuminate\Console\Command;

class TestFormsQuery extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:forms-query';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the forms query to debug the 500 error';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing forms query...');
        
        try {
            // Test 1: Basic query
            $this->info('Test 1: Basic forms query');
            $forms = Form::all();
            $this->info("Found {$forms->count()} total forms");
            
            // Test 2: Query with status filter
            $this->info('Test 2: Forms with status=active');
            $activeForms = Form::where('status', 'active')->get();
            $this->info("Found {$activeForms->count()} active forms");
            
            // Test 3: Query with target_roles filter
            $this->info('Test 3: Forms with target_roles containing unit_leader');
            $unitLeaderForms = Form::whereJsonContains('target_roles', 'unit_leader')->get();
            $this->info("Found {$unitLeaderForms->count()} forms for unit leaders");
            
            // Test 4: Combined query (what the API is doing)
            $this->info('Test 4: Combined query (status=active AND target_roles=unit_leader)');
            $combinedForms = Form::where('status', 'active')
                ->whereJsonContains('target_roles', 'unit_leader')
                ->get();
            $this->info("Found {$combinedForms->count()} active forms for unit leaders");
            
            // Show the forms
            if ($combinedForms->count() > 0) {
                $this->info('Forms found:');
                foreach ($combinedForms as $form) {
                    $this->line("- {$form->title} (ID: {$form->id})");
                }
            }
            
            // Test 5: Check the SQL query
            $this->info('Test 5: SQL query');
            $query = Form::where('status', 'active')
                ->whereJsonContains('target_roles', 'unit_leader');
            $this->info("SQL: " . $query->toSql());
            $this->info("Bindings: " . json_encode($query->getBindings()));
            
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
        }
    }
} 