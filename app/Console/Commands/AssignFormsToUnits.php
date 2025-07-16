<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Form;
use App\Models\Unit;

class AssignFormsToUnits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'forms:assign-to-units';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign forms to specific units for testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Assigning forms to units...');

        // Get the first unit
        $unit = Unit::first();
        if (!$unit) {
            $this->error('No units found in the database.');
            return 1;
        }

        $this->info("Found unit: {$unit->name} ({$unit->code})");

        // Get some forms to assign
        $forms = Form::where('status', 'active')->take(5)->get();
        
        if ($forms->isEmpty()) {
            $this->error('No active forms found in the database.');
            return 1;
        }

        $assignedCount = 0;
        foreach ($forms as $form) {
            // Update the form to include this unit in target_units
            $targetUnits = is_array($form->target_units) ? $form->target_units : [];
            if (!in_array($unit->id, $targetUnits)) {
                $targetUnits[] = $unit->id;
                $form->update(['target_units' => $targetUnits]);
                $assignedCount++;
                $this->info("Assigned form: {$form->title}");
            }
        }

        $this->info("Successfully assigned {$assignedCount} forms to unit {$unit->name}");

        // Show summary
        $this->info("\nSummary:");
        $this->info("- Total forms: " . Form::count());
        $this->info("- Forms with target_units: " . Form::whereNotNull('target_units')->count());
        $this->info("- Forms assigned to unit {$unit->id}: " . Form::whereJsonContains('target_units', $unit->id)->count());

        return 0;
    }
} 