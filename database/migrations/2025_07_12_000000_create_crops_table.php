<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crops', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('crop_name')->nullable();
            $table->string('type');
            $table->string('crop_type')->nullable();
            $table->string('variety')->nullable();
            $table->date('planting_date')->nullable();
            $table->date('expected_harvest_date')->nullable();
            $table->decimal('area_planted', 8, 2)->nullable();
            $table->decimal('seed_quantity', 8, 2)->nullable();
            $table->unsignedBigInteger('land_id')->nullable();
            $table->unsignedBigInteger('unit_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
            
            $table->foreign('land_id')->references('id')->on('lands')->onDelete('cascade');
            $table->foreign('unit_id')->references('id')->on('units')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crops');
    }
}; 