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
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UnitLeaderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\Member\DashboardController as MemberDashboardController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;

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

// Admin API Routes (Protected with rate limiting)
Route::prefix('admin')->middleware(['web', 'auth:web', 'role:admin', 'throttle:60,1'])->group(function () {
    // Logout (requires authentication)
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/activities', [AdminDashboardController::class, 'activities']);
        Route::get('/members', [AdminDashboardController::class, 'members']);
    });
    
    // Reports Management
    Route::prefix('reports')->group(function () {
        Route::get('/', [AdminReportController::class, 'index']);
        Route::post('/generate', [AdminReportController::class, 'generate']);
        Route::get('/statistics', [AdminReportController::class, 'statistics']);
        Route::patch('/{id}/status', [AdminReportController::class, 'updateStatus']);
        Route::delete('/{id}', [AdminReportController::class, 'destroy']);
    });
    
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

    // Leader Member Creation
    Route::post('/members', [UnitLeaderController::class, 'createMember']);

    // Units Management
    Route::prefix('admin-units')->group(function () {
        Route::get('/', [UnitController::class, 'index']);
        Route::post('/', [UnitController::class, 'store']);
        Route::post('/generate-code', [UnitController::class, 'generateCode']);
        Route::get('/{id}', [UnitController::class, 'show']);
        Route::put('/{id}', [UnitController::class, 'update']);
        Route::delete('/{id}', [UnitController::class, 'destroy']);
        Route::get('/{id}/members', [UnitController::class, 'getMembers']);
        Route::post('/{id}/members', [UnitController::class, 'addMember']);
        Route::delete('/{id}/members/{memberId}', [UnitController::class, 'removeMember']);
        Route::get('/statistics', [UnitController::class, 'statistics']);
    });

    // Zones Management
    Route::prefix('zones')->group(function () {
        Route::get('/', [ZoneController::class, 'index']);
        Route::post('/', [ZoneController::class, 'store']);
        Route::get('/{id}', [ZoneController::class, 'show']);
        Route::put('/{id}', [ZoneController::class, 'update']);
        Route::delete('/{id}', [ZoneController::class, 'destroy']);
        Route::get('/{id}/units', [ZoneController::class, 'getUnits']);
        Route::get('/{id}/members', [ZoneController::class, 'getMembers']);
        Route::get('/statistics', [ZoneController::class, 'getStatistics']);
    });

    // Fee Rules Management
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

    // Pages Management
    Route::prefix('pages')->group(function () {
        Route::get('/', [PageController::class, 'index']);
        Route::post('/', [PageController::class, 'store']);
        Route::get('/{page}', [PageController::class, 'show']);
        Route::put('/{page}', [PageController::class, 'update']);
        Route::delete('/{page}', [PageController::class, 'destroy']);
        Route::get('/navigation/{role}/preview', [PageController::class, 'getNavigationPreview']);
        Route::get('/statistics', [PageController::class, 'getStats']);
    });

    // Forms Management
    Route::prefix('forms')->group(function () {
        Route::get('/', [FormController::class, 'index']);
        Route::post('/', [FormController::class, 'store']);
        Route::get('/{form}', [FormController::class, 'show']);
        Route::put('/{form}', [FormController::class, 'update']);
        Route::delete('/{form}', [FormController::class, 'destroy']);
        Route::get('/{form}/submissions', [FormController::class, 'getSubmissions']);
        Route::get('/{form}/assigned-members', [FormController::class, 'getAssignedMembers']);
        Route::post('/{form}/assign-members', [FormController::class, 'assignMembers']);
        Route::delete('/{form}/unassign-members', [FormController::class, 'unassignMembers']);
        Route::post('/sync', [FormController::class, 'syncForms']);
        Route::get('/stats', [FormController::class, 'getStats']);
        Route::get('/available', [FormController::class, 'getAvailableForms']);
        Route::post('/create-file', [FormController::class, 'createFormFile']);
        Route::delete('/delete-file/{formName}', [FormController::class, 'deleteFormFile']);
    });
});

// Member API Routes (Protected with rate limiting)
Route::prefix('member')->middleware(['web', 'auth:web', 'role:member', 'throttle:60,1'])->group(function () {
    Route::get('/dashboard/stats', [MemberController::class, 'getDashboardStats']);
    Route::get('/dashboard/activities', [MemberController::class, 'getRecentActivities']);
    Route::get('/dashboard/upcoming-fees', [MemberController::class, 'getUpcomingFees']);
    Route::get('/unit', [MemberController::class, 'getUnit']);
    Route::get('/land', [MemberController::class, 'getLand']);
    Route::get('/crops', [MemberController::class, 'getCrops']);
    Route::get('/produce', [MemberController::class, 'getProduce']);
    Route::get('/forms', [MemberController::class, 'getForms']);
    Route::get('/reports', [MemberController::class, 'getReports']);
    Route::get('/fees', [MemberController::class, 'getFees']);
    
    // Payment routes
    Route::post('/payments/initiate', [PaymentController::class, 'initiatePayment']);
    Route::post('/payments/check-status', [PaymentController::class, 'checkPaymentStatus']);
    Route::get('/payments/history', [PaymentController::class, 'getPaymentHistory']);
    
    // Member Dashboard routes
    Route::get('/dashboard', [MemberDashboardController::class, 'stats']);
    Route::get('/dashboard/activities', [MemberDashboardController::class, 'activities']);
    Route::get('/dashboard/upcoming-fees', [MemberDashboardController::class, 'upcomingFees']);
});

// Public system metrics (limited access with rate limiting)
Route::prefix('system')->middleware(['throttle:30,1'])->group(function () {
    Route::get('/health', [SystemMetricsController::class, 'currentStats']);
});

// MTN MoMo callback route (public with rate limiting)
Route::post('/mtn-momo/callback', [PaymentController::class, 'handleCallback'])->middleware('throttle:10,1');

// Leaders API Routes (Protected with rate limiting)
Route::prefix('leaders')->middleware(['web', 'auth:web', 'role:unit_leader,zone_leader', 'throttle:60,1'])->group(function () {
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
    Route::get('/fees', [UnitLeaderController::class, 'getFees']);

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

// Unit Leader specific routes (for form submissions)
Route::prefix('unit-leader')->middleware(['web', 'auth:web', 'role:unit_leader'])->group(function () {
    Route::get('/unit', [UnitLeaderController::class, 'getUnit']);
    Route::get('/land', [UnitLeaderController::class, 'getLands']);
    Route::get('/members', [UnitLeaderController::class, 'members']);
    Route::get('/crops', [UnitLeaderController::class, 'getCrops']);
    Route::post('/land', [UnitLeaderController::class, 'createLand']);
    Route::post('/crops', [UnitLeaderController::class, 'createCrop']);
    Route::post('/produce', [UnitLeaderController::class, 'createProduce']);
    Route::post('/forms/submit', [UnitLeaderController::class, 'submitForm']);
});

