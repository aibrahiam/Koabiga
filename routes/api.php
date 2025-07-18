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
use App\Http\Controllers\Api\UserController;
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
    Route::post('/leaders/login', [AuthController::class, 'leadersLogin']);
    Route::post('/member/login', [AuthController::class, 'memberLogin']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Test route for debugging
Route::post('/test-leaders-login', function (Request $request) {
    return response()->json([
        'message' => 'Test route working',
        'received_data' => $request->all(),
        'headers' => $request->headers->all()
    ]);
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

    // Leader Member Creation
    Route::post('/members', [UnitLeaderController::class, 'createMember']);

    // Units Management
    Route::prefix('units')->group(function () {
        Route::get('/', [UnitController::class, 'index']);
        Route::post('/', [UnitController::class, 'store']);
        Route::post('/generate-code', [UnitController::class, 'generateCode']);
        Route::get('/{id}', [UnitController::class, 'show']);
        Route::put('/{id}', [UnitController::class, 'update']);
        Route::delete('/{id}', [UnitController::class, 'destroy']);
    });
});

// Member API Routes
Route::prefix('member')->middleware(['web', 'auth:web', 'role:member'])->group(function () {
    Route::get('/dashboard/stats', [MemberController::class, 'getDashboardStats']);
    Route::get('/dashboard/activities', [MemberController::class, 'getRecentActivities']);
    Route::get('/dashboard/upcoming-fees', [MemberController::class, 'getUpcomingFees']);
    Route::get('/land', [MemberController::class, 'getLand']);
    Route::get('/crops', [MemberController::class, 'getCrops']);
    Route::get('/produce', [MemberController::class, 'getProduce']);
    Route::get('/forms', [MemberController::class, 'getForms']);
    Route::get('/reports', [MemberController::class, 'getReports']);
    Route::get('/fees', [MemberController::class, 'getFees']);
});

// Public system metrics (limited access)
Route::prefix('system')->group(function () {
    Route::get('/health', [SystemMetricsController::class, 'currentStats']);
});

// Leaders API Routes
Route::prefix('leaders')->middleware(['web', 'auth:web', 'role:unit_leader,zone_leader'])->group(function () {
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
    Route::get('/dashboard/stats', [MemberController::class, 'getDashboardStats']);
    Route::get('/dashboard/activities', [MemberController::class, 'getRecentActivities']);
    Route::get('/dashboard/upcoming-fees', [MemberController::class, 'getUpcomingFees']);
    Route::get('/land', [MemberController::class, 'getLand']);
    Route::get('/crops', [MemberController::class, 'getCrops']);
    Route::get('/produce', [MemberController::class, 'getProduce']);
});