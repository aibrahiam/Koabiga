<?php

namespace App\Console\Commands;

use App\Models\FeeRule;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ActivateScheduledFeeRules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fee-rules:activate-scheduled {--dry-run : Show what would be activated without actually activating}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Activate scheduled fee rules whose effective date has been reached';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for scheduled fee rules to activate...');

        $scheduledRules = FeeRule::scheduled()
            ->effectiveDateReached()
            ->notDeleted()
            ->get();

        if ($scheduledRules->isEmpty()) {
            $this->info('No scheduled fee rules found that need activation.');
            return 0;
        }

        $this->info("Found {$scheduledRules->count()} scheduled fee rules to activate:");

        $activatedCount = 0;
        $tableData = [];

        foreach ($scheduledRules as $rule) {
            $tableData[] = [
                'ID' => $rule->id,
                'Name' => $rule->name,
                'Type' => $rule->type,
                'Effective Date' => $rule->effective_date->format('Y-m-d'),
                'Status' => $rule->status,
            ];

            if (!$this->option('dry-run')) {
                if ($rule->activate()) {
                    $activatedCount++;
                    $this->line("✓ Activated: {$rule->name} (ID: {$rule->id})");
                    
                    // Log the activation
                    Log::info("Fee rule activated", [
                        'fee_rule_id' => $rule->id,
                        'fee_rule_name' => $rule->name,
                        'activated_at' => now(),
                    ]);
                } else {
                    $this->error("✗ Failed to activate: {$rule->name} (ID: {$rule->id})");
                }
            } else {
                $this->line("Would activate: {$rule->name} (ID: {$rule->id})");
            }
        }

        // Display table
        $this->table(['ID', 'Name', 'Type', 'Effective Date', 'Status'], $tableData);

        if ($this->option('dry-run')) {
            $this->info("Dry run completed. {$scheduledRules->count()} fee rules would be activated.");
        } else {
            $this->info("Activation completed. {$activatedCount} fee rules activated successfully.");
        }

        return 0;
    }
}
