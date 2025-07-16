<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\FeeRuleController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\ErrorLogController;
use App\Http\Controllers\Api\LoginSessionController;
use App\Http\Controllers\Api\SystemMetricsController;
use App\Http\Controllers\Api\ZoneController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\FormController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:web')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication API Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);

// Test authentication status
Route::get('/test-auth', function (Request $request) {
    if (Auth::check()) {
        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => Auth::user()->id,
                'christian_name' => Auth::user()->christian_name,
                'family_name' => Auth::user()->family_name,
                'email' => Auth::user()->email,
                'role' => Auth::user()->role,
                'phone' => Auth::user()->phone,
            ]
        ]);
    }
    
    return response()->json([
        'authenticated' => false,
        'user' => null
    ]);
});

// Test endpoint
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is working',
        'timestamp' => now()
    ]);
});

// Debug endpoint to test admin access
Route::get('/debug-admin', function () {
    $user = Auth::user();
    return response()->json([
        'authenticated' => Auth::check(),
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->christian_name . ' ' . $user->family_name,
            'role' => $user->role,
            'status' => $user->status
        ] : null,
        'is_admin' => $user && $user->role === 'admin',
        'session_id' => session()->getId(),
        'csrf_token' => csrf_token()
    ]);
})->middleware(['auth:web', 'role:admin']);

// Debug test route for member creation
Route::post('/debug/member-test', function (Request $request) {
    try {
        Log::info('Debug member test - Request received', [
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Debug endpoint working',
            'data' => $request->all()
        ]);
    } catch (\Exception $e) {
        Log::error('Debug member test error: ' . $e->getMessage(), [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Debug endpoint error: ' . $e->getMessage()
        ], 500);
    }
});

// Comprehensive member creation test endpoint (bypasses auth)
Route::post('/debug/member-creation-test', function (Request $request) {
    try {
        Log::info('=== MEMBER CREATION TEST START ===');
        Log::info('Request method:', ['method' => $request->method()]);
        Log::info('Request headers:', $request->headers->all());
        Log::info('Request content type:', ['content_type' => $request->header('Content-Type')]);
        Log::info('Request body:', ['body' => $request->getContent()]);
        Log::info('Request all data (before merge):', $request->all());

        // Force merge JSON if Laravel did not parse it
        if (empty($request->all()) && !empty($request->getContent())) {
            $data = json_decode($request->getContent(), true);
            Log::info('Decoded JSON body:', $data);
            if (is_array($data)) {
                $request->merge($data);
                Log::info('Request all data (after merge):', $request->all());
            }
        }

        // Test if we can access individual fields
        Log::info('Individual fields test:', [
            'christian_name' => $request->input('christian_name'),
            'family_name' => $request->input('family_name'),
            'phone' => $request->input('phone'),
            'role' => $request->input('role'),
            'status' => $request->input('status'),
            'pin' => $request->input('pin'),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Request debugging complete',
            'data' => [
                'method' => $request->method(),
                'content_type' => $request->header('Content-Type'),
                'body' => $request->getContent(),
                'all_data' => $request->all(),
                'input' => $request->input(),
            ]
        ]);
        
    } catch (\Exception $e) {
        Log::error('=== MEMBER CREATION TEST FAILED ===');
        Log::error('Error: ' . $e->getMessage(), [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Member creation test failed: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

// Test endpoint for fee rule application (bypasses auth)
Route::post('/debug/apply-fee-rule/{id}', function (Request $request, $id) {
    try {
        Log::info('=== FEE RULE APPLICATION TEST START ===');
        
        $feeRule = \App\Models\FeeRule::find($id);
        if (!$feeRule) {
            return response()->json([
                'success' => false,
                'message' => 'Fee rule not found'
            ], 404);
        }
        
        Log::info('Fee rule found', [
            'id' => $feeRule->id,
            'name' => $feeRule->name,
            'status' => $feeRule->status,
            'effective_date' => $feeRule->effective_date,
            'applicable_to' => $feeRule->applicable_to
        ]);
        
        // Check if fee rule is active
        if ($feeRule->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Only active fee rules can be applied'
            ], 400);
        }
        
        // Check if effective date has been reached
        if ($feeRule->effective_date > now()->toDateString()) {
            return response()->json([
                'success' => false,
                'message' => 'Fee rule effective date has not been reached yet'
            ], 400);
        }
        
        $feeService = new \App\Services\FeeSchedulingService();
        Log::info('FeeSchedulingService instantiated successfully');
        
        $result = $feeService->applyFeeRule($feeRule);
        Log::info('Fee rule application completed', [
            'result' => $result
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Fee rule applied successfully',
            'data' => $result
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error in fee rule application test: ' . $e->getMessage(), [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage(),
            'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
        ], 500);
    }
});




// Fee Rules API Routes
// Protect Fee Rules API endpoints for admin only
Route::prefix('fee-rules')->middleware(['auth:web', 'role:admin'])->group(function () {
    Route::get('/', [FeeRuleController::class, 'index']);
    Route::post('/', [FeeRuleController::class, 'store']);
    Route::get('/statistics', [FeeRuleController::class, 'statistics']);
    Route::get('/{feeRule}', [FeeRuleController::class, 'show']);
    Route::put('/{feeRule}', [FeeRuleController::class, 'update']);
    Route::patch('/{feeRule}', [FeeRuleController::class, 'update']);
    Route::delete('/{feeRule}', [FeeRuleController::class, 'destroy']);
    Route::post('/{feeRule}/apply', [FeeRuleController::class, 'applyFeeRule']);
    Route::post('/{feeRule}/schedule', [FeeRuleController::class, 'scheduleFeeRule']);
    Route::post('/{feeRule}/assign-units', [FeeRuleController::class, 'assignToUnits']);
    Route::get('/{feeRule}/applications', [FeeRuleController::class, 'getFeeApplications']);
    Route::get('/{feeRule}/statistics', [FeeRuleController::class, 'getFeeRuleStatistics']);
    Route::get('/{feeRule}/unit-assignments', [FeeRuleController::class, 'getUnitAssignments']);
    Route::post('/activate-scheduled', [FeeRuleController::class, 'activateScheduledRules']);
});

// Protect members API endpoint for member and unit_leader roles
Route::get('members', [\App\Http\Controllers\MemberController::class, 'index'])->middleware(['auth:web', 'role:member,unit_leader']);

// Member resource APIs (read-only)
Route::prefix('member')->middleware(['auth:web', 'role:member'])->group(function () {
    // Dashboard endpoints
    Route::get('dashboard/stats', [\App\Http\Controllers\Api\Member\DashboardController::class, 'stats']);
    Route::get('dashboard/activities', [\App\Http\Controllers\Api\Member\DashboardController::class, 'activities']);
    Route::get('dashboard/upcoming-fees', [\App\Http\Controllers\Api\Member\DashboardController::class, 'upcomingFees']);
    
    // Resource endpoints
    Route::get('land', [\App\Http\Controllers\Api\Member\LandController::class, 'index']);
    Route::get('land/{id}', [\App\Http\Controllers\Api\Member\LandController::class, 'show']);
    Route::get('crops', [\App\Http\Controllers\Api\Member\CropController::class, 'index']);
    Route::get('crops/{id}', [\App\Http\Controllers\Api\Member\CropController::class, 'show']);
    Route::get('produce', [\App\Http\Controllers\Api\Member\ProduceController::class, 'index']);
    Route::get('produce/{id}', [\App\Http\Controllers\Api\Member\ProduceController::class, 'show']);
    Route::get('reports', [\App\Http\Controllers\Api\Member\ReportController::class, 'index']);
    Route::get('reports/{id}', [\App\Http\Controllers\Api\Member\ReportController::class, 'show']);
    Route::get('forms', [\App\Http\Controllers\Api\Member\FormController::class, 'index']);
    Route::get('forms/{id}', [\App\Http\Controllers\Api\Member\FormController::class, 'show']);
    Route::get('fees', [\App\Http\Controllers\Api\Member\FeeController::class, 'index']);
    Route::get('fees/upcoming', [\App\Http\Controllers\Api\Member\FeeController::class, 'upcomingFees']);
    Route::get('fees/statistics', [\App\Http\Controllers\Api\Member\FeeController::class, 'statistics']);
    Route::get('fees/payment-methods', [\App\Http\Controllers\Api\Member\FeeController::class, 'getPaymentMethods']);
    Route::get('fees/{feeApplication}', [\App\Http\Controllers\Api\Member\FeeController::class, 'show']);
    Route::post('fees/{feeApplication}/pay', [\App\Http\Controllers\Api\Member\FeeController::class, 'recordPayment']);
});

// Admin-only logging and monitoring APIs
Route::prefix('admin')->middleware(['auth:web', 'role:admin'])->group(function () {
    // Activity Logs
    Route::prefix('activity-logs')->group(function () {
        Route::get('/', [ActivityLogController::class, 'index']);
        Route::get('/statistics', [ActivityLogController::class, 'statistics']);
        Route::get('/user/{userId}/summary', [ActivityLogController::class, 'userSummary']);
        Route::delete('/clear-old', [ActivityLogController::class, 'clearOldLogs']);
    });

    // Error Logs
    Route::prefix('error-logs')->group(function () {
        Route::get('/', [ErrorLogController::class, 'index']);
        Route::get('/statistics', [ErrorLogController::class, 'statistics']);
        Route::get('/{id}', [ErrorLogController::class, 'show']);
        Route::patch('/{id}/resolve', [ErrorLogController::class, 'resolve']);
        Route::post('/bulk-resolve', [ErrorLogController::class, 'bulkResolve']);
        Route::delete('/clear-old', [ErrorLogController::class, 'clearOldLogs']);
    });

    // Login Sessions
    Route::prefix('login-sessions')->group(function () {
        Route::get('/', [LoginSessionController::class, 'index']);
        Route::get('/statistics', [LoginSessionController::class, 'statistics']);
        Route::get('/user/{userId}/summary', [LoginSessionController::class, 'userSummary']);
        Route::post('/{sessionId}/force-logout', [LoginSessionController::class, 'forceLogout']);
        Route::delete('/clear-old', [LoginSessionController::class, 'clearOldSessions']);
    });

    // System Metrics
    Route::prefix('system-metrics')->group(function () {
        Route::get('/', [SystemMetricsController::class, 'index']);
        Route::get('/current-stats', [SystemMetricsController::class, 'currentStats']);
        Route::get('/historical', [SystemMetricsController::class, 'historical']);
        Route::post('/record', [SystemMetricsController::class, 'record']);
        Route::get('/dashboard', [SystemMetricsController::class, 'dashboard']);
    });

    // Members Management
    Route::prefix('members')->group(function () {
        Route::get('/', [MemberController::class, 'index']);
        Route::post('/', [MemberController::class, 'store']);
        Route::post('/import', [MemberController::class, 'import']);
        Route::get('/export', [MemberController::class, 'export']);
        Route::get('/{id}', [MemberController::class, 'show']);
        Route::put('/{id}', [MemberController::class, 'update']);
        Route::delete('/{id}', [MemberController::class, 'destroy']);
    });

    // Reports Management
    Route::prefix('reports')->group(function () {
        Route::get('/', [ReportController::class, 'index']);
        Route::get('/export', [ReportController::class, 'export']);
        Route::post('/generate-preview', [ReportController::class, 'generatePreview']);
        Route::post('/generate', [ReportController::class, 'generate']);
        Route::get('/{id}', [ReportController::class, 'show']);
        Route::patch('/{id}/status', [ReportController::class, 'updateStatus']);
        Route::delete('/{id}', [ReportController::class, 'destroy']);
    });

    // Fee Rules
    Route::prefix('fee-rules')->group(function () {
        Route::get('/', [FeeRuleController::class, 'index']);
        Route::post('/', [FeeRuleController::class, 'store']);
        Route::get('/statistics', [FeeRuleController::class, 'statistics']);
        Route::get('/{id}', [FeeRuleController::class, 'show']);
        Route::put('/{id}', [FeeRuleController::class, 'update']);
        Route::delete('/{id}', [FeeRuleController::class, 'destroy']);
        Route::post('/{id}/apply', [FeeRuleController::class, 'applyFeeRule']);
        Route::post('/{id}/schedule', [FeeRuleController::class, 'scheduleFeeRule']);
        Route::post('/{id}/assign-units', [FeeRuleController::class, 'assignToUnits']);
        Route::get('/{id}/applications', [FeeRuleController::class, 'getFeeApplications']);
        Route::get('/{id}/unit-assignments', [FeeRuleController::class, 'getUnitAssignments']);
        Route::post('/activate-scheduled', [FeeRuleController::class, 'activateScheduledRules']);
    });

    // Units Management
    Route::prefix('units')->group(function () {
        Route::get('/', [UnitController::class, 'index']);
        Route::post('/', [UnitController::class, 'store']);
        Route::get('/{id}', [UnitController::class, 'show']);
        Route::put('/{id}', [UnitController::class, 'update']);
        Route::delete('/{id}', [UnitController::class, 'destroy']);
        Route::get('/{id}/members', [UnitController::class, 'getMembers']);
        Route::post('/{id}/members', [UnitController::class, 'addMember']);
        Route::delete('/{id}/members/{memberId}', [UnitController::class, 'removeMember']);
    });

    // Zones Management
    Route::prefix('zones')->group(function () {
        Route::get('/', [ZoneController::class, 'index']);
        Route::post('/', [ZoneController::class, 'store']);
        Route::get('/statistics', [ZoneController::class, 'statistics']);
        Route::get('/available-leaders', [ZoneController::class, 'getAvailableLeaders']);
        Route::get('/{zone}', [ZoneController::class, 'show']);
        Route::put('/{zone}', [ZoneController::class, 'update']);
        Route::delete('/{zone}', [ZoneController::class, 'destroy']);
    });

    // Forms Management
    Route::prefix('forms')->group(function () {
        Route::get('/', [FormController::class, 'index']);
        Route::post('/', [FormController::class, 'store']);
        Route::get('/{id}', [FormController::class, 'show']);
        Route::put('/{id}', [FormController::class, 'update']);
        Route::delete('/{id}', [FormController::class, 'destroy']);
        Route::get('/{id}/submissions', [FormController::class, 'getSubmissions']);
    });

    // Pages Management
    Route::prefix('pages')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\PageController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\PageController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Api\PageController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Api\PageController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\PageController::class, 'destroy']);
    });

    // Settings Management
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'index']);
        Route::put('/', [SettingsController::class, 'update']);
        Route::get('/public', [SettingsController::class, 'public']);
        Route::post('/reset', [SettingsController::class, 'reset']);
        Route::get('/{key}', [SettingsController::class, 'show']);
    });
});

// Public system metrics (limited access)
Route::prefix('system')->group(function () {
    Route::get('/health', [SystemMetricsController::class, 'currentStats']);
});

// Unit Leader API Routes
Route::prefix('unit-leader')->middleware(['auth:web', 'role:unit_leader'])->group(function () {
    Route::get('/stats', [\App\Http\Controllers\Api\UnitLeaderController::class, 'stats']);
    Route::get('/unit', [\App\Http\Controllers\Api\UnitLeaderController::class, 'getUnit']);
    Route::get('/activities', [\App\Http\Controllers\Api\UnitLeaderController::class, 'activities']);
    Route::get('/tasks', [\App\Http\Controllers\Api\UnitLeaderController::class, 'tasks']);
    Route::get('/members', [\App\Http\Controllers\Api\UnitLeaderController::class, 'members']);
    Route::get('/crops', [\App\Http\Controllers\Api\UnitLeaderController::class, 'getCrops']);
    Route::get('/lands', [\App\Http\Controllers\Api\UnitLeaderController::class, 'getLands']);
    Route::get('/produce', [\App\Http\Controllers\Api\UnitLeaderController::class, 'produce']);
    Route::get('/reports', [\App\Http\Controllers\Api\UnitLeaderController::class, 'reports']);
    
    // Additional endpoints for forms
    Route::get('/land', [\App\Http\Controllers\Api\UnitLeaderController::class, 'getLands']);
    Route::get('/crops', [\App\Http\Controllers\Api\UnitLeaderController::class, 'getCrops']);
    
    // Forms Management for Unit Leaders
    Route::get('/forms', [\App\Http\Controllers\Api\UnitLeaderController::class, 'getForms']);
    Route::get('/assigned-forms', [\App\Http\Controllers\Api\UnitLeaderController::class, 'getAssignedForms']);
    Route::prefix('forms')->group(function () {
        Route::get('/', [FormController::class, 'index']);
        Route::get('/{id}', [FormController::class, 'show']);
        Route::post('/submit', [FormController::class, 'submitForm']);
    });
    


    // Members Management for Unit Leaders
    Route::prefix('members')->group(function () {
        Route::post('/', [\App\Http\Controllers\Api\UnitLeaderController::class, 'createMember']);
        Route::put('/{id}', [\App\Http\Controllers\Api\UnitLeaderController::class, 'updateMember']);
        Route::get('/{id}', [\App\Http\Controllers\Api\UnitLeaderController::class, 'showMember']);
    });

    // Land Management for Unit Leaders
    Route::prefix('land')->group(function () {
        Route::post('/', [\App\Http\Controllers\Api\UnitLeaderController::class, 'createLand']);
        Route::put('/{id}', [\App\Http\Controllers\Api\UnitLeaderController::class, 'updateLand']);
        Route::get('/{id}', [\App\Http\Controllers\Api\UnitLeaderController::class, 'showLand']);
    });

    // Crops Management for Unit Leaders
    Route::prefix('crops')->group(function () {
        Route::post('/', [\App\Http\Controllers\Api\UnitLeaderController::class, 'createCrop']);
        Route::put('/{id}', [\App\Http\Controllers\Api\UnitLeaderController::class, 'updateCrop']);
        Route::get('/{id}', [\App\Http\Controllers\Api\UnitLeaderController::class, 'showCrop']);
    });

    // Produce Management for Unit Leaders
    Route::prefix('produce')->group(function () {
        Route::post('/', [\App\Http\Controllers\Api\UnitLeaderController::class, 'createProduce']);
        Route::put('/{id}', [\App\Http\Controllers\Api\UnitLeaderController::class, 'updateProduce']);
        Route::get('/{id}', [\App\Http\Controllers\Api\UnitLeaderController::class, 'showProduce']);
    });
    
    // Settings Management for Unit Leaders
    Route::prefix('settings')->group(function () {
        Route::put('/profile', [\App\Http\Controllers\Api\UnitLeaderController::class, 'updateProfile']);
        Route::put('/password', [\App\Http\Controllers\Api\UnitLeaderController::class, 'updatePassword']);
        Route::put('/notifications', [\App\Http\Controllers\Api\UnitLeaderController::class, 'updateNotifications']);
    });
});

// Form Management Routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin/forms')->group(function () {
    Route::get('/', [FormController::class, 'index']);
    Route::post('/', [FormController::class, 'store']);
    Route::get('/{id}', [FormController::class, 'show']);
    Route::put('/{id}', [FormController::class, 'update']);
    Route::delete('/{id}', [FormController::class, 'destroy']);
    Route::get('/{id}/assigned-members', [FormController::class, 'getAssignedMembers']);
});

// Admin Forms API Routes
Route::middleware(['auth:web', 'role:admin'])->prefix('admin')->group(function () {
    // Get all forms for admin management
    Route::get('/forms', [FormController::class, 'index']);
    
    // Create new form
    Route::post('/forms', [FormController::class, 'store']);
    
    // Get specific form
    Route::get('/forms/{form}', [FormController::class, 'show']);
    
    // Update form
    Route::put('/forms/{form}', [FormController::class, 'update']);
    
    // Delete form
    Route::delete('/forms/{form}', [FormController::class, 'destroy']);
    
    // Get form submissions
    Route::get('/forms/{form}/submissions', [FormController::class, 'getSubmissions']);
    
    // Get assigned members for a form
    Route::get('/forms/{id}/assigned-members', [FormController::class, 'getAssignedMembers']);
});

// Unit Leader Forms API Routes
Route::middleware(['auth:web', 'role:unit_leader'])->prefix('unit-leader')->group(function () {
    // Get forms available for unit leaders
    Route::get('/forms', [FormController::class, 'getUnitLeaderForms']);
    
    // Get forms specifically assigned to the unit leader's unit
    Route::get('/assigned-forms', [FormController::class, 'getAssignedForms']);
    
    // Submit form data
    Route::post('/forms/submit', [FormController::class, 'submitForm']);
    
    // Get unit leader's unit information
    Route::get('/unit', function () {
        $user = Auth::user();
        if (!$user || $user->role !== 'unit_leader') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $unit = \App\Models\Unit::where('leader_id', $user->id)->first();
        if (!$unit) {
            return response()->json(['success' => false, 'message' => 'No unit assigned'], 404);
        }
        
        return response()->json(['success' => true, 'data' => $unit]);
    });
    
    // Get lands for unit leader's unit
    Route::get('/land', function (Request $request) {
        $user = Auth::user();
        if (!$user || $user->role !== 'unit_leader') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $unit = \App\Models\Unit::where('leader_id', $user->id)->first();
        if (!$unit) {
            return response()->json(['success' => false, 'message' => 'No unit assigned'], 404);
        }
        
        $lands = \App\Models\Land::where('unit_id', $unit->id)->get();
        return response()->json(['success' => true, 'data' => $lands]);
    });
    
    // Get members for unit leader's unit
    Route::get('/members', function () {
        $user = Auth::user();
        if (!$user || $user->role !== 'unit_leader') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $unit = \App\Models\Unit::where('leader_id', $user->id)->first();
        if (!$unit) {
            return response()->json(['success' => false, 'message' => 'No unit assigned'], 404);
        }
        
        $members = \App\Models\User::where('unit_id', $unit->id)
            ->where('role', 'member')
            ->where('status', 'active')
            ->get(['id', 'christian_name', 'family_name', 'phone']);
            
        return response()->json(['success' => true, 'data' => $members]);
    });
});