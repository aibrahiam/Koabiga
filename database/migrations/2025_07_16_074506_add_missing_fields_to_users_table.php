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
            // Add missing fields if they don't exist
            if (!Schema::hasColumn('users', 'national_id')) {
                $table->string('national_id', 25)->nullable()->after('id_passport');
            }
            
            if (!Schema::hasColumn('users', 'gender')) {
                $table->enum('gender', ['male', 'female'])->nullable()->after('national_id');
            }
            
            if (!Schema::hasColumn('users', 'pin')) {
                $table->string('pin')->nullable()->after('password');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['national_id', 'gender', 'pin']);
        });
    }
};
