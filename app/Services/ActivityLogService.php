<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Log;

class ActivityLogService
{
    /**
     * Log a user activity
     */
    public static function log($action, $description, $metadata = null, $userId = null)
    {
        try {
            $userId = $userId ?? Auth::id();
            
            ActivityLog::create([
                'user_id' => $userId,
                'action' => $action,
                'description' => $description,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'metadata' => $metadata,
            ]);
        } catch (\Exception $e) {
            // Log the error but don't break the application
            Log::error('Failed to log activity', [
                'action' => $action,
                'description' => $description,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Log a system event (no user associated)
     */
    public static function logSystem($action, $description, $metadata = null)
    {
        try {
            ActivityLog::create([
                'user_id' => null,
                'action' => $action,
                'description' => $description,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'metadata' => $metadata,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log system activity', [
                'action' => $action,
                'description' => $description,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Log user login
     */
    public static function logLogin($user)
    {
        self::log('login', "User {$user->email} logged in successfully", [
            'user_email' => $user->email,
            'user_role' => $user->role,
            'login_time' => now()->toISOString(),
        ], $user->id);
    }

    /**
     * Log user logout
     */
    public static function logLogout($user)
    {
        self::log('logout', "User {$user->email} logged out", [
            'user_email' => $user->email,
            'user_role' => $user->role,
            'logout_time' => now()->toISOString(),
        ], $user->id);
    }

    /**
     * Log fee rule application
     */
    public static function logFeeRuleApplication($feeRule, $applicationsCount)
    {
        self::log('apply', "Fee rule '{$feeRule->name}' applied to {$applicationsCount} users", [
            'fee_rule_id' => $feeRule->id,
            'fee_rule_name' => $feeRule->name,
            'applications_count' => $applicationsCount,
            'applied_at' => now()->toISOString(),
        ]);
    }

    /**
     * Log fee rule creation
     */
    public static function logFeeRuleCreation($feeRule)
    {
        self::log('create', "Fee rule '{$feeRule->name}' created", [
            'fee_rule_id' => $feeRule->id,
            'fee_rule_name' => $feeRule->name,
            'fee_rule_type' => $feeRule->type,
            'fee_rule_amount' => $feeRule->amount,
            'created_at' => now()->toISOString(),
        ]);
    }

    /**
     * Log fee rule update
     */
    public static function logFeeRuleUpdate($feeRule)
    {
        self::log('update', "Fee rule '{$feeRule->name}' updated", [
            'fee_rule_id' => $feeRule->id,
            'fee_rule_name' => $feeRule->name,
            'updated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Log fee rule deletion
     */
    public static function logFeeRuleDeletion($feeRuleName, $feeRuleId)
    {
        self::log('delete', "Fee rule '{$feeRuleName}' deleted", [
            'fee_rule_id' => $feeRuleId,
            'fee_rule_name' => $feeRuleName,
            'deleted_at' => now()->toISOString(),
        ]);
    }

    /**
     * Log unit creation
     */
    public static function logUnitCreation($unit)
    {
        self::log('create', "Unit '{$unit->name}' created", [
            'unit_id' => $unit->id,
            'unit_name' => $unit->name,
            'unit_code' => $unit->code,
            'zone_id' => $unit->zone_id,
            'created_at' => now()->toISOString(),
        ]);
    }

    /**
     * Log unit update
     */
    public static function logUnitUpdate($unit)
    {
        self::log('update', "Unit '{$unit->name}' updated", [
            'unit_id' => $unit->id,
            'unit_name' => $unit->name,
            'unit_code' => $unit->code,
            'updated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Log unit deletion
     */
    public static function logUnitDeletion($unitName, $unitId)
    {
        self::log('delete', "Unit '{$unitName}' deleted", [
            'unit_id' => $unitId,
            'unit_name' => $unitName,
            'deleted_at' => now()->toISOString(),
        ]);
    }

    /**
     * Log member creation
     */
    public static function logMemberCreation($member)
    {
        self::log('create', "Member '{$member->christian_name} {$member->family_name}' created", [
            'member_id' => $member->id,
            'member_name' => $member->christian_name . ' ' . $member->family_name,
            'member_email' => $member->email,
            'created_at' => now()->toISOString(),
        ]);
    }

    /**
     * Log member update
     */
    public static function logMemberUpdate($member)
    {
        self::log('update', "Member '{$member->christian_name} {$member->family_name}' updated", [
            'member_id' => $member->id,
            'member_name' => $member->christian_name . ' ' . $member->family_name,
            'updated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Log system error
     */
    public static function logError($error, $context = [])
    {
        self::logSystem('error', "System error: {$error}", array_merge($context, [
            'error_time' => now()->toISOString(),
            'error_message' => $error,
        ]));
    }

    /**
     * Log database operation
     */
    public static function logDatabaseOperation($operation, $table, $recordId = null, $details = [])
    {
        self::logSystem('database', "Database {$operation} on {$table}", array_merge($details, [
            'operation' => $operation,
            'table' => $table,
            'record_id' => $recordId,
            'timestamp' => now()->toISOString(),
        ]));
    }
} 