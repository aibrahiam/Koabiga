<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\ZoneController;
use App\Http\Controllers\Api\FeeRuleController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\SystemMetricsController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\ErrorLogController;
use App\Http\Controllers\Api\LoginSessionController;
use App\Http\Controllers\Api\UnitLeaderController;
use App\Http\Controllers\Api\Member\DashboardController as MemberDashboardController;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication Routes (Public)
Route::middleware(['web'])->group(function () {
    Route::post('/admin/login', [AuthController::class, 'adminLogin']);
    Route::post('/leaders/login', [AuthController::class, 'leadersLogin']);
    Route::post('/member/login', [AuthController::class, 'memberLogin']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Debug route to test authentication
Route::get('/debug/auth', function () {
    return response()->json([
        'authenticated' => Auth::check(),
        'user' => Auth::user() ? [
            'id' => Auth::user()->id,
            'email' => Auth::user()->email,
            'role' => Auth::user()->role,
        ] : null,
        'session_id' => session()->getId(),
        'session_data' => session()->all(),
    ]);
});

// Debug route to test session
Route::get('/debug/session', function () {
    return response()->json([
        'session_id' => session()->getId(),
        'session_data' => session()->all(),
        'cookies' => request()->cookies->all(),
    ]);
});

// Test login route to debug authentication
Route::post('/test-login', function (Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');
    
    // Test authentication
    $user = \App\Models\User::authenticateAdmin($email, $password);
    
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }
    
    // Log in the user
    Auth::login($user);
    
    // Regenerate session
    $request->session()->regenerate();
    
    // Set session data
    $request->session()->put('user_id', $user->id);
    $request->session()->put('user_role', $user->role);
    $request->session()->save();
    
    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
        ],
        'session_id' => $request->session()->getId(),
        'authenticated' => Auth::check(),
    ]);
});

// Admin API Routes (Protected)
Route::prefix('admin')->middleware(['web', 'auth:web', 'role:admin'])->group(function () {
    // Logout (requires authentication)
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // System Metrics
    Route::prefix('system-metrics')->group(function () {
        Route::get('/current-stats', [SystemMetricsController::class, 'currentStats']);
        Route::get('/dashboard', [SystemMetricsController::class, 'dashboard']);
        Route::get('/historical', [SystemMetricsController::class, 'historical']);
        Route::post('/record', [SystemMetricsController::class, 'record']);
    });

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
        Route::delete('/{sessionId}/force-logout', [LoginSessionController::class, 'forceLogout']);
        Route::delete('/clear-old', [LoginSessionController::class, 'clearOldSessions']);
    });

    // Members Management
    Route::prefix('members')->group(function () {
        Route::get('/', [MemberController::class, 'index']);
        Route::post('/', [MemberController::class, 'store']);
        Route::get('/{id}', [MemberController::class, 'show']);
        Route::put('/{id}', [MemberController::class, 'update']);
        Route::delete('/{id}', [MemberController::class, 'destroy']);
        Route::post('/import', [MemberController::class, 'import']);
        Route::get('/export', [MemberController::class, 'export']);
    });

    // Units Management
    Route::prefix('units')->group(function () {
        Route::get('/', [UnitController::class, 'index']);
        Route::post('/', [UnitController::class, 'store']);
        Route::get('/{unit}', [UnitController::class, 'show']);
        Route::put('/{unit}', [UnitController::class, 'update']);
        Route::delete('/{unit}', [UnitController::class, 'destroy']);
        Route::get('/{unit}/members', [UnitController::class, 'getMembers']);
        Route::post('/{unit}/members', [UnitController::class, 'addMember']);
        Route::delete('/{unit}/members/{memberId}', [UnitController::class, 'removeMember']);
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

    // Fee Rules API Routes
    Route::prefix('fee-rules')->group(function () {
        Route::get('/', [FeeRuleController::class, 'index']);
        Route::post('/', [FeeRuleController::class, 'store']);
        Route::get('/statistics', [FeeRuleController::class, 'statistics']);
        Route::get('/{feeRule}', [FeeRuleController::class, 'show']);
        Route::put('/{feeRule}', [FeeRuleController::class, 'update']);
        Route::delete('/{feeRule}', [FeeRuleController::class, 'destroy']);
        Route::post('/{feeRule}/apply', [FeeRuleController::class, 'applyFeeRule']);
        Route::post('/{feeRule}/schedule', [FeeRuleController::class, 'scheduleFeeRule']);
        Route::post('/{feeRule}/assign-units', [FeeRuleController::class, 'assignToUnits']);
        Route::get('/{feeRule}/applications', [FeeRuleController::class, 'getFeeApplications']);
        Route::get('/{feeRule}/unit-assignments', [FeeRuleController::class, 'getUnitAssignments']);
        Route::get('/{feeRule}/statistics', [FeeRuleController::class, 'getFeeRuleStatistics']);
    });

    // Forms Management
    Route::prefix('forms')->group(function () {
        Route::get('/', [FormController::class, 'index']);
        Route::post('/', [FormController::class, 'store']);
        Route::get('/{form}', [FormController::class, 'show']);
        Route::put('/{form}', [FormController::class, 'update']);
        Route::delete('/{form}', [FormController::class, 'destroy']);
        Route::get('/{form}/submissions', [FormController::class, 'getSubmissions']);
    });

    // Pages Management
    Route::prefix('pages')->group(function () {
        Route::get('/', [PageController::class, 'index']);
        Route::post('/', [PageController::class, 'store']);
        Route::get('/{id}', [PageController::class, 'show']);
        Route::put('/{id}', [PageController::class, 'update']);
        Route::delete('/{id}', [PageController::class, 'destroy']);
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

// Leaders API Routes
Route::prefix('leaders')->middleware(['web', 'auth:web', 'role:unit_leader'])->group(function () {
    Route::get('/stats', [UnitLeaderController::class, 'stats']);
    Route::get('/unit', [UnitLeaderController::class, 'getUnit']);
    Route::get('/activities', [UnitLeaderController::class, 'activities']);
    Route::get('/tasks', [UnitLeaderController::class, 'tasks']);
    Route::get('/members', [UnitLeaderController::class, 'members']);
    Route::get('/crops', [UnitLeaderController::class, 'getCrops']);
    Route::get('/produce', [UnitLeaderController::class, 'produce']);
    Route::get('/reports', [UnitLeaderController::class, 'reports']);
    Route::get('/lands', [UnitLeaderController::class, 'getLands']);
    Route::get('/forms', [UnitLeaderController::class, 'getForms']);
    Route::get('/assigned-forms', [UnitLeaderController::class, 'getAssignedForms']);

    // Members Management for Unit Leaders
    Route::prefix('members')->group(function () {
        Route::post('/', [UnitLeaderController::class, 'createMember']);
        Route::put('/{id}', [UnitLeaderController::class, 'updateMember']);
        Route::get('/{id}', [UnitLeaderController::class, 'showMember']);
    });

    // Land Management for Unit Leaders
    Route::prefix('land')->group(function () {
        Route::post('/', [UnitLeaderController::class, 'createLand']);
        Route::put('/{id}', [UnitLeaderController::class, 'updateLand']);
        Route::get('/{id}', [UnitLeaderController::class, 'showLand']);
    });

    // Crops Management for Unit Leaders
    Route::prefix('crops')->group(function () {
        Route::post('/', [UnitLeaderController::class, 'createCrop']);
        Route::put('/{id}', [UnitLeaderController::class, 'updateCrop']);
        Route::get('/{id}', [UnitLeaderController::class, 'showCrop']);
    });

    // Produce Management for Unit Leaders
    Route::prefix('produce')->group(function () {
        Route::post('/', [UnitLeaderController::class, 'createProduce']);
        Route::put('/{id}', [UnitLeaderController::class, 'updateProduce']);
        Route::get('/{id}', [UnitLeaderController::class, 'showProduce']);
    });

    // Profile Management
    Route::put('/profile', [UnitLeaderController::class, 'updateProfile']);
    Route::put('/password', [UnitLeaderController::class, 'updatePassword']);
    Route::put('/notifications', [UnitLeaderController::class, 'updateNotifications']);
});

// Member API Routes
Route::prefix('member')->middleware(['web', 'auth:web', 'role:member'])->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [MemberDashboardController::class, 'stats']);
        Route::get('/activities', [MemberDashboardController::class, 'activities']);
        Route::get('/upcoming-fees', [MemberDashboardController::class, 'upcomingFees']);
    });
});