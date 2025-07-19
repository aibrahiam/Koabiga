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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_application_id')->nullable()->constrained()->onDelete('set null');
            $table->string('reference_id')->unique(); // MTN MoMo reference ID
            $table->string('external_id')->nullable(); // External reference ID
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->string('phone_number');
            $table->text('description');
            $table->string('status')->default('pending'); // pending, SUCCESSFUL, FAILED, REJECTED, TIMEOUT
            $table->string('payment_method')->default('mtn_momo');
            $table->string('financial_transaction_id')->nullable(); // MTN MoMo transaction ID
            $table->text('payer_message')->nullable();
            $table->text('payee_note')->nullable();
            $table->text('reason')->nullable(); // Failure reason
            $table->json('callback_data')->nullable(); // Raw callback data from MTN
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['reference_id']);
            $table->index(['external_id']);
            $table->index(['status']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
