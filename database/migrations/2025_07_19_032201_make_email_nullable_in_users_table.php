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
            // Make email nullable since members and leaders use phone + PIN
            $table->string('email')->nullable()->change();
            
            // Make password nullable since members and leaders use PIN instead
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Make email required again
            $table->string('email')->nullable(false)->change();
            
            // Make password required again
            $table->string('password')->nullable(false)->change();
        });
    }
};
