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
        Schema::create('fee_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // land, equipment, processing, storage, training, other
            $table->decimal('amount', 10, 2);
            $table->string('frequency'); // daily, weekly, monthly, quarterly, yearly, per_transaction, one_time
            $table->string('unit'); // per hectare, per day, etc.
            $table->string('status')->default('active'); // active, inactive, draft, scheduled
            $table->string('applicable_to'); // all_members, unit_leaders, new_members, active_members, specific_units
            $table->text('description');
            $table->date('effective_date');
            $table->string('created_by')->nullable();
            $table->boolean('is_deleted')->default(false); // For soft delete
            $table->timestamps();
            $table->softDeletes(); // Adds deleted_at column for soft deletes
            
            // Indexes for better performance
            $table->index(['status', 'effective_date']);
            $table->index(['type', 'status']);
            $table->index('is_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_rules');
    }
};
