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
        Schema::table('forms', function (Blueprint $table) {
            $table->enum('status', ['draft', 'active', 'inactive'])->default('active')->after('target_roles');
            $table->json('target_units')->nullable()->after('status');
            $table->foreignId('unit_id')->nullable()->after('target_units')->constrained('units')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->after('unit_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->after('user_id')->constrained('users')->onDelete('set null');
            $table->date('due_date')->nullable()->after('assigned_to');
            $table->timestamp('submitted_at')->nullable()->after('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('forms', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['assigned_to']);
            $table->dropColumn(['status', 'target_units', 'unit_id', 'user_id', 'assigned_to', 'due_date', 'submitted_at']);
        });
    }
};
