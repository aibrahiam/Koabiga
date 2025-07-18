<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FormService;

class SyncForms extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'forms:sync {--force : Force sync even if forms exist}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync forms from the leaders folder to the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting forms sync...');
        
        try {
            $result = FormService::syncForms();
            
            $this->info("Sync completed successfully!");
            $this->info("Total available forms: {$result['total_available']}");
            $this->info("Total synced: {$result['total_synced']}");
            $this->info("Total errors: {$result['total_errors']}");
            
            if (!empty($result['errors'])) {
                $this->warn('Errors encountered:');
                foreach ($result['errors'] as $error) {
                    $this->error("- {$error['form']}: {$error['error']}");
                }
            }
            
            if (!empty($result['synced'])) {
                $this->info('Synced forms:');
                foreach ($result['synced'] as $form) {
                    $this->line("- {$form->name}: {$form->title}");
                }
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error("Sync failed: {$e->getMessage()}");
            return 1;
        }
    }
} 