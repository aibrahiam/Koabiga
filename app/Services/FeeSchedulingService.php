<?php

namespace App\Services;

use App\Models\FeeRule;
use App\Models\FeeApplication;
use App\Models\User;
use App\Models\Unit;
use App\Models\FeeRuleUnit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FeeSchedulingService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Apply active fee rules to applicable users
     */
    public function applyActiveFeeRules(): array
    {
        $results = [
            'success' => true,
            'applied_count' => 0,
            'errors' => [],
            'details' => []
        ];

        try {
            DB::beginTransaction();

            // Get all active fee rules
            $activeRules = FeeRule::active()
                ->notDeleted()
                ->effectiveDateReached()
                ->get();

            foreach ($activeRules as $rule) {
                try {
                    $ruleResult = $this->applyFeeRule($rule);
                    $results['applied_count'] += $ruleResult['applied_count'];
                    $results['details'][] = $ruleResult;
                } catch (\Exception $e) {
                    $results['errors'][] = "Error applying rule {$rule->id}: " . $e->getMessage();
                    Log::error("Fee rule application error", [
                        'rule_id' => $rule->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $results['success'] = false;
            $results['errors'][] = "Transaction failed: " . $e->getMessage();
            Log::error("Fee scheduling transaction failed", ['error' => $e->getMessage()]);
        }

        return $results;
    }

    /**
     * Apply a specific fee rule to applicable users
     */
    public function applyFeeRule(FeeRule $feeRule): array
    {
        $result = [
            'rule_id' => $feeRule->id,
            'rule_name' => $feeRule->name,
            'applied_count' => 0,
            'errors' => []
        ];

        try {
            Log::info('Starting fee rule application', [
                'rule_id' => $feeRule->id,
                'rule_name' => $feeRule->name,
                'applicable_to' => $feeRule->applicable_to
            ]);

            // Get applicable users
            $users = $this->getApplicableUsers($feeRule);
            Log::info('Found applicable users', [
                'rule_id' => $feeRule->id,
                'user_count' => $users->count()
            ]);

            foreach ($users as $user) {
                try {
                    Log::info('Processing user for fee application', [
                        'rule_id' => $feeRule->id,
                        'user_id' => $user->id,
                        'user_name' => $user->christian_name . ' ' . $user->family_name
                    ]);

                    // Check if fee application already exists for this rule and user
                    $existingApplication = FeeApplication::where('fee_rule_id', $feeRule->id)
                        ->where('user_id', $user->id)
                        ->whereIn('status', ['pending', 'overdue'])
                        ->first();

                    if ($existingApplication) {
                        Log::info('Skipping user - fee application already exists', [
                            'rule_id' => $feeRule->id,
                            'user_id' => $user->id,
                            'existing_application_id' => $existingApplication->id
                        ]);
                        continue; // Skip if already applied
                    }

                    // Calculate fee amount
                    $unit = $user->unit;
                    Log::info('Calculating fee amount', [
                        'rule_id' => $feeRule->id,
                        'user_id' => $user->id,
                        'unit_id' => $unit?->id,
                        'base_amount' => $feeRule->amount
                    ]);

                    $amount = FeeApplication::calculateFeeAmount($feeRule, $user, $unit);
                    $dueDate = $this->calculateDueDate($feeRule);

                    Log::info('Fee calculation completed', [
                        'rule_id' => $feeRule->id,
                        'user_id' => $user->id,
                        'calculated_amount' => $amount,
                        'due_date' => $dueDate
                    ]);

                    // Create fee application
                    $application = FeeApplication::create([
                        'fee_rule_id' => $feeRule->id,
                        'user_id' => $user->id,
                        'unit_id' => $unit?->id,
                        'amount' => $amount,
                        'status' => FeeApplication::STATUS_PENDING,
                        'due_date' => $dueDate,
                        'calculation_data' => [
                            'base_amount' => $feeRule->amount,
                            'unit_override' => $unit ? $this->getUnitOverride($feeRule, $unit) : null,
                            'final_amount' => $amount,
                            'applied_at' => now()->toISOString(),
                        ],
                    ]);

                    Log::info('Fee application created successfully', [
                        'rule_id' => $feeRule->id,
                        'user_id' => $user->id,
                        'application_id' => $application->id,
                        'amount' => $amount
                    ]);

                    $result['applied_count']++;
                } catch (\Exception $e) {
                    $errorMsg = "Error applying to user {$user->id}: " . $e->getMessage();
                    $result['errors'][] = $errorMsg;
                    Log::error($errorMsg, [
                        'rule_id' => $feeRule->id,
                        'user_id' => $user->id,
                        'file' => $e->getFile(),
                        'line' => $e->getLine()
                    ]);
                }
            }

            Log::info('Fee rule application completed', [
                'rule_id' => $feeRule->id,
                'applied_count' => $result['applied_count'],
                'error_count' => count($result['errors'])
            ]);

        } catch (\Exception $e) {
            $errorMsg = "Error getting applicable users: " . $e->getMessage();
            $result['errors'][] = $errorMsg;
            Log::error($errorMsg, [
                'rule_id' => $feeRule->id,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return $result;
    }

    /**
     * Schedule a fee rule for future application
     */
    public function scheduleFeeRule(FeeRule $feeRule, string $effectiveDate): bool
    {
        try {
            $feeRule->update([
                'status' => FeeRule::STATUS_SCHEDULED,
                'effective_date' => $effectiveDate,
            ]);

            Log::info("Fee rule scheduled", [
                'rule_id' => $feeRule->id,
                'effective_date' => $effectiveDate
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to schedule fee rule", [
                'rule_id' => $feeRule->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Activate scheduled fee rules that have reached their effective date
     */
    public function activateScheduledRules(): array
    {
        $results = [
            'activated_count' => 0,
            'errors' => []
        ];

        try {
            $scheduledRules = FeeRule::scheduled()
                ->effectiveDateReached()
                ->notDeleted()
                ->get();

            foreach ($scheduledRules as $rule) {
                try {
                    if ($rule->activate()) {
                        $results['activated_count']++;
                        Log::info("Scheduled fee rule activated", ['rule_id' => $rule->id]);
                    }
                } catch (\Exception $e) {
                    $results['errors'][] = "Error activating rule {$rule->id}: " . $e->getMessage();
                }
            }
        } catch (\Exception $e) {
            $results['errors'][] = "Error activating scheduled rules: " . $e->getMessage();
        }

        return $results;
    }

    /**
     * Mark overdue fee applications
     */
    public function markOverdueFees(): array
    {
        $results = [
            'marked_count' => 0,
            'errors' => []
        ];

        try {
            $overdueApplications = FeeApplication::pending()
                ->dueBefore(now()->toDateString())
                ->get();

            foreach ($overdueApplications as $application) {
                try {
                    if ($application->markAsOverdue()) {
                        $results['marked_count']++;
                    }
                } catch (\Exception $e) {
                    $results['errors'][] = "Error marking overdue fee {$application->id}: " . $e->getMessage();
                }
            }
        } catch (\Exception $e) {
            $results['errors'][] = "Error marking overdue fees: " . $e->getMessage();
        }

        return $results;
    }

    /**
     * Assign fee rule to specific units
     */
    public function assignFeeRuleToUnits(FeeRule $feeRule, array $unitIds, array $customAmounts = []): array
    {
        $results = [
            'assigned_count' => 0,
            'errors' => []
        ];

        try {
            foreach ($unitIds as $unitId) {
                try {
                    $customAmount = $customAmounts[$unitId] ?? null;

                    FeeRuleUnit::updateOrCreate(
                        [
                            'fee_rule_id' => $feeRule->id,
                            'unit_id' => $unitId,
                        ],
                        [
                            'is_active' => true,
                            'custom_amount' => $customAmount,
                        ]
                    );

                    $results['assigned_count']++;
                } catch (\Exception $e) {
                    $results['errors'][] = "Error assigning to unit {$unitId}: " . $e->getMessage();
                }
            }
        } catch (\Exception $e) {
            $results['errors'][] = "Error assigning fee rule to units: " . $e->getMessage();
        }

        return $results;
    }

    /**
     * Get applicable users for a fee rule
     */
    private function getApplicableUsers(FeeRule $feeRule): \Illuminate\Database\Eloquent\Collection
    {
        Log::info('Getting applicable users for fee rule', [
            'rule_id' => $feeRule->id,
            'applicable_to' => $feeRule->applicable_to
        ]);

        switch ($feeRule->applicable_to) {
            case 'all_members':
                $users = User::where('role', 'member')->where('status', 'active')->get();
                Log::info('Found all_members users', [
                    'rule_id' => $feeRule->id,
                    'count' => $users->count()
                ]);
                return $users;
            
            case 'unit_leaders':
                $users = User::where('role', 'unit_leader')->where('status', 'active')->get();
                Log::info('Found unit_leaders users', [
                    'rule_id' => $feeRule->id,
                    'count' => $users->count()
                ]);
                return $users;
            
            case 'new_members':
                $users = User::where('role', 'member')
                    ->where('status', 'active')
                    ->where('created_at', '>=', now()->subMonths(3))
                    ->get();
                Log::info('Found new_members users', [
                    'rule_id' => $feeRule->id,
                    'count' => $users->count()
                ]);
                return $users;
            
            case 'active_members':
                $users = User::where('role', 'member')
                    ->where('status', 'active')
                    ->where('last_activity_at', '>=', now()->subMonths(6))
                    ->get();
                Log::info('Found active_members users', [
                    'rule_id' => $feeRule->id,
                    'count' => $users->count()
                ]);
                return $users;
            
            case 'specific_units':
                // Get users from units that have this fee rule assigned
                $unitIds = FeeRuleUnit::where('fee_rule_id', $feeRule->id)
                    ->where('is_active', true)
                    ->pluck('unit_id');
                
                Log::info('Found specific_units assignments', [
                    'rule_id' => $feeRule->id,
                    'unit_ids' => $unitIds->toArray()
                ]);

                $users = User::where('role', 'member')
                    ->where('status', 'active')
                    ->whereIn('unit_id', $unitIds)
                    ->get();
                
                Log::info('Found specific_units users', [
                    'rule_id' => $feeRule->id,
                    'count' => $users->count()
                ]);
                return $users;
            
            default:
                Log::warning('Unknown applicable_to value', [
                    'rule_id' => $feeRule->id,
                    'applicable_to' => $feeRule->applicable_to
                ]);
                return collect();
        }
    }

    /**
     * Calculate due date for a fee rule
     */
    private function calculateDueDate(FeeRule $feeRule): string
    {
        $effectiveDate = Carbon::parse($feeRule->effective_date);

        switch ($feeRule->frequency) {
            case 'daily':
                return $effectiveDate->addDay()->toDateString();
            case 'weekly':
                return $effectiveDate->addWeek()->toDateString();
            case 'monthly':
                return $effectiveDate->addMonth()->toDateString();
            case 'quarterly':
                return $effectiveDate->addMonths(3)->toDateString();
            case 'yearly':
                return $effectiveDate->addYear()->toDateString();
            case 'per_transaction':
                return $effectiveDate->toDateString();
            case 'one_time':
                return $effectiveDate->toDateString();
            default:
                return $effectiveDate->addMonth()->toDateString();
        }
    }

    /**
     * Get unit-specific override amount
     */
    private function getUnitOverride(FeeRule $feeRule, Unit $unit): ?float
    {
        $unitOverride = FeeRuleUnit::where('fee_rule_id', $feeRule->id)
            ->where('unit_id', $unit->id)
            ->where('is_active', true)
            ->first();

        return $unitOverride?->custom_amount;
    }
}
