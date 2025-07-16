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
            // Drop the name column if it exists
            if (Schema::hasColumn('users', 'name')) {
                $table->dropColumn('name');
            }
            
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('users', 'christian_name')) {
                $table->string('christian_name')->nullable();
            }
            
            if (!Schema::hasColumn('users', 'family_name')) {
                $table->string('family_name')->nullable();
            }
            
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable();
            }
            
            if (!Schema::hasColumn('users', 'pin')) {
                $table->string('pin', 6)->nullable();
            }
            
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'leader', 'member'])->default('member');
            }
            
            if (!Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            }
            
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable();
            }
            
            if (!Schema::hasColumn('users', 'secondary_phone')) {
                $table->string('secondary_phone')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add back the name column
            $table->string('name')->nullable();
            
            // Drop the Koabiga-specific columns
            $table->dropColumn([
                'christian_name',
                'family_name', 
                'phone',
                'pin',
                'role',
                'status',
                'bio',
                'secondary_phone'
            ]);
        });
    }
}; 