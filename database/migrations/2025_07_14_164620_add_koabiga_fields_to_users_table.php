<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add Koabiga-specific fields
            $table->string('christian_name')->nullable()->after('name');
            $table->string('family_name')->nullable()->after('christian_name');
            $table->string('phone')->unique()->nullable()->after('email');
            $table->string('id_passport')->unique()->nullable()->after('phone');
            $table->enum('role', ['admin', 'unit_leader', 'zone_leader', 'member'])->default('member')->after('id_passport');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->after('role');
            $table->string('pin', 5)->nullable()->after('status');
            $table->foreignId('unit_id')->nullable()->after('pin')->constrained('units')->onDelete('set null');
            $table->foreignId('zone_id')->nullable()->after('unit_id')->constrained('zones')->onDelete('set null');
            $table->timestamp('last_login_at')->nullable()->after('zone_id');
            $table->timestamp('last_activity_at')->nullable()->after('last_login_at');
            $table->text('bio')->nullable()->after('last_activity_at');
            $table->string('avatar')->nullable()->after('bio');
            
            // Add indexes for better performance
            $table->index(['role', 'status']);
            $table->index(['unit_id', 'status']);
            $table->index(['zone_id', 'status']);
            $table->index('last_activity_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove indexes
            $table->dropIndex(['role', 'status']);
            $table->dropIndex(['unit_id', 'status']);
            $table->dropIndex(['zone_id', 'status']);
            $table->dropIndex('last_activity_at');
            
            // Remove foreign keys
            $table->dropForeign(['unit_id']);
            $table->dropForeign(['zone_id']);
            
            // Remove columns
            $table->dropColumn([
                'christian_name',
                'family_name',
                'phone',
                'id_passport',
                'role',
                'status',
                'pin',
                'unit_id',
                'zone_id',
                'last_login_at',
                'last_activity_at',
                'bio',
                'avatar'
            ]);
        });
    }
};
