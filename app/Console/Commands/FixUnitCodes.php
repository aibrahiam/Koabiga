<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Unit;

class FixUnitCodes extends Command
{
    protected $signature = 'units:fix-codes';
    protected $description = 'Check and fix unit codes';

    public function handle()
    {
        $units = Unit::all();
        
        $this->info("Found {$units->count()} units:");
        
        foreach ($units as $unit) {
            $this->line("ID: {$unit->id}, Name: {$unit->name}, Code: " . ($unit->code ?? 'NULL'));
            
            if (!$unit->code) {
                // Generate a code based on the unit name
                $code = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $unit->name), 0, 3)) . str_pad($unit->id, 3, '0', STR_PAD_LEFT);
                $unit->update(['code' => $code]);
                $this->info("  -> Generated code: {$code}");
            }
        }
        
        $this->info("Unit codes fixed!");
    }
} 