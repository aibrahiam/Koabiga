<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FeeRuleController;
use App\Http\Controllers\AuthController;

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

// Authentication API Routes
Route::post('/login', [AuthController::class, 'login']);

// Fee Rules API Routes
Route::prefix('fee-rules')->group(function () {
    Route::get('/', [FeeRuleController::class, 'index']);
    Route::post('/', [FeeRuleController::class, 'store']);
    Route::get('/{feeRule}', [FeeRuleController::class, 'show']);
    Route::put('/{feeRule}', [FeeRuleController::class, 'update']);
    Route::patch('/{feeRule}', [FeeRuleController::class, 'update']);
    Route::delete('/{feeRule}', [FeeRuleController::class, 'destroy']);
    Route::post('/activate-scheduled', [FeeRuleController::class, 'activateScheduledRules']);
});

Route::get('members', [\App\Http\Controllers\MemberController::class, 'index']); 