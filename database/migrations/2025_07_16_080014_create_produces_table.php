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
        Schema::create('produces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2)->nullable();
            $table->string('unit', 50)->nullable();
            $table->date('harvest_date')->nullable();
            $table->string('quality_grade', 50)->nullable();
            $table->unsignedBigInteger('crop_id')->nullable();
            $table->unsignedBigInteger('land_id')->nullable();
            $table->unsignedBigInteger('unit_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('crop_id')->references('id')->on('crops')->onDelete('cascade');
            $table->foreign('land_id')->references('id')->on('lands')->onDelete('cascade');
            $table->foreign('unit_id')->references('id')->on('units')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indexes for better performance
            $table->index(['crop_id', 'harvest_date']);
            $table->index(['unit_id', 'harvest_date']);
            $table->index(['user_id', 'harvest_date']);
            $table->index('quality_grade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produces');
    }
};
