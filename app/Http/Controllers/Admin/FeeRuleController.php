<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeeRule;
use App\Models\FeeApplication;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\ActivityLogService;

class FeeRuleController extends Controller
{
    public function index(): Response
    {
        $feeRules = FeeRule::notDeleted()
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total_rules' => FeeRule::notDeleted()->count(),
            'active_rules' => FeeRule::active()->notDeleted()->count(),
            'scheduled_rules' => FeeRule::scheduled()->notDeleted()->count(),
            'inactive_rules' => FeeRule::where('status', 'inactive')->notDeleted()->count(),
            'total_applications' => FeeApplication::count(),
            'pending_applications' => FeeApplication::pending()->count(),
            'overdue_applications' => FeeApplication::overdue()->count(),
            'paid_applications' => FeeApplication::paid()->count(),
        ];

        return Inertia::render('koabiga/admin/fee-rules/fee-rules', [
            'feeRules' => $feeRules,
            'stats' => $stats,
        ]);
    }

    public function create(): Response
    {
        $units = Unit::with('zone')->orderBy('name')->get();
        
        return Inertia::render('koabiga/admin/fee-rules/create', [
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:land,equipment,processing,storage,training,other',
            'amount' => 'required|numeric|min:0',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly,yearly,per_transaction,one_time',
            'unit' => 'required|string|max:255',
            'status' => 'required|in:active,inactive,draft,scheduled',
            'applicable_to' => 'required|in:all_members,unit_leaders,new_members,active_members,specific_units',
            'description' => 'required|string',
            'effective_date' => 'required|date',
        ]);

        // Determine initial status based on effective date
        $effectiveDate = $validated['effective_date'];
        $status = $validated['status'];
        
        if ($status === 'scheduled' || ($status === 'active' && $effectiveDate > now()->toDateString())) {
            $status = 'scheduled';
        }

        $feeRule = FeeRule::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'frequency' => $validated['frequency'],
            'unit' => $validated['unit'],
            'status' => $status,
            'applicable_to' => $validated['applicable_to'],
            'description' => $validated['description'],
            'effective_date' => $effectiveDate,
            'created_by' => Auth::user()?->name ?? 'System',
        ]);

        // Log the fee rule creation
        ActivityLogService::logFeeRuleCreation($feeRule);

        return redirect()->route('koabiga.admin.fee-rules.index')
            ->with('success', 'Fee rule created successfully');
    }

    public function show(FeeRule $feeRule): Response
    {
        if ($feeRule->is_deleted) {
            abort(404);
        }

        $feeRule->load(['feeApplications.user', 'feeApplications.unit', 'unitAssignments.unit']);

        $applications = $feeRule->feeApplications()
            ->with(['user:id,christian_name,family_name,phone', 'unit:id,name,code'])
            ->orderBy('created_at', 'desc')
            ->get();

        $unitAssignments = $feeRule->unitAssignments()
            ->with('unit:id,name,code,zone_id')
            ->get();

        $stats = [
            'total_applications' => $applications->count(),
            'pending_applications' => $applications->where('status', 'pending')->count(),
            'overdue_applications' => $applications->where('status', 'overdue')->count(),
            'paid_applications' => $applications->where('status', 'paid')->count(),
            'total_amount_due' => $applications->whereIn('status', ['pending', 'overdue'])->sum('amount'),
            'total_amount_paid' => $applications->where('status', 'paid')->sum('amount'),
        ];

        return Inertia::render('koabiga/admin/fee-rules/view-fee', [
            'feeRule' => $feeRule,
            'applications' => $applications,
            'unitAssignments' => $unitAssignments,
            'stats' => $stats,
        ]);
    }

    public function edit(FeeRule $feeRule): Response
    {
        if ($feeRule->is_deleted) {
            abort(404);
        }

        $units = Unit::with('zone')->orderBy('name')->get();

        return Inertia::render('koabiga/admin/fee-rules/edit-fee', [
            'feeRule' => $feeRule,
            'units' => $units,
        ]);
    }

    public function update(Request $request, FeeRule $feeRule)
    {
        if ($feeRule->is_deleted) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:land,equipment,processing,storage,training,other',
            'amount' => 'required|numeric|min:0',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly,yearly,per_transaction,one_time',
            'unit' => 'required|string|max:255',
            'status' => 'required|in:active,inactive,draft,scheduled',
            'applicable_to' => 'required|in:all_members,unit_leaders,new_members,active_members,specific_units',
            'description' => 'required|string',
            'effective_date' => 'required|date',
        ]);

        // Determine status based on effective date
        $effectiveDate = $validated['effective_date'];
        $status = $validated['status'];
        
        if ($status === 'scheduled' || ($status === 'active' && $effectiveDate > now()->toDateString())) {
            $status = 'scheduled';
        }

        $feeRule->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'frequency' => $validated['frequency'],
            'unit' => $validated['unit'],
            'status' => $status,
            'applicable_to' => $validated['applicable_to'],
            'description' => $validated['description'],
            'effective_date' => $effectiveDate,
        ]);

        // Log the fee rule update
        ActivityLogService::logFeeRuleUpdate($feeRule);

        return redirect()->route('koabiga.admin.fee-rules.show', $feeRule)
            ->with('success', 'Fee rule updated successfully');
    }

    public function destroy(FeeRule $feeRule)
    {
        if ($feeRule->is_deleted) {
            abort(404);
        }

        // Check if fee rule has applications
        if ($feeRule->feeApplications()->count() > 0) {
            return back()->with('error', 'Cannot delete fee rule with existing applications');
        }

        $feeRuleName = $feeRule->name;
        $feeRuleId = $feeRule->id;
        
        $feeRule->delete();

        // Log the fee rule deletion
        ActivityLogService::logFeeRuleDeletion($feeRuleName, $feeRuleId);

        return redirect()->route('koabiga.admin.fee-rules.index')
            ->with('success', 'Fee rule deleted successfully');
    }

    public function applyFeeRule(FeeRule $feeRule)
    {
        try {
            Log::info('Applying fee rule via web controller', [
                'fee_rule_id' => $feeRule->id,
                'fee_rule_name' => $feeRule->name,
                'user_id' => Auth::id(),
                'user_role' => Auth::user()?->role,
            ]);

            // Check if fee rule is active
            if ($feeRule->status !== 'active') {
                return back()->with('error', 'Only active fee rules can be applied');
            }

            // Check if effective date has been reached
            if ($feeRule->effective_date > now()->toDateString()) {
                return back()->with('error', 'Fee rule effective date has not been reached yet');
            }

            $feeService = new \App\Services\FeeSchedulingService();
            $result = $feeService->applyFeeRule($feeRule);

            // Log the fee rule application
            ActivityLogService::logFeeRuleApplication($feeRule, $result['applied_count']);

            if ($result['applied_count'] > 0) {
                return back()->with('success', "Fee rule applied successfully! {$result['applied_count']} applications created.");
            } else {
                return back()->with('warning', 'No new applications were created. Users may already have pending applications for this rule.');
            }
        } catch (\Exception $e) {
            Log::error('Error applying fee rule via web controller', [
                'fee_rule_id' => $feeRule->id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return back()->with('error', 'Failed to apply fee rule: ' . $e->getMessage());
        }
    }

    public function scheduleFeeRule(Request $request, FeeRule $feeRule)
    {
        $validated = $request->validate([
            'effective_date' => 'required|date|after:today',
        ]);

        try {
            $feeService = new \App\Services\FeeSchedulingService();
            $success = $feeService->scheduleFeeRule($feeRule, $validated['effective_date']);

            if ($success) {
                return back()->with('success', 'Fee rule scheduled successfully');
            } else {
                return back()->with('error', 'Failed to schedule fee rule');
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to schedule fee rule: ' . $e->getMessage());
        }
    }

    public function assignToUnits(Request $request, FeeRule $feeRule)
    {
        $validated = $request->validate([
            'unit_ids' => 'required|array',
            'unit_ids.*' => 'exists:units,id',
            'custom_amounts' => 'sometimes|array',
            'custom_amounts.*' => 'numeric|min:0',
        ]);

        try {
            $feeService = new \App\Services\FeeSchedulingService();
            $result = $feeService->assignFeeRuleToUnits(
                $feeRule, 
                $validated['unit_ids'], 
                $validated['custom_amounts'] ?? []
            );

            return back()->with('success', "Fee rule assigned to {$result['assigned_count']} units");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to assign fee rule to units: ' . $e->getMessage());
        }
    }
} 