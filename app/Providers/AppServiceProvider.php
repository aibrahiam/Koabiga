<?php

namespace App\Providers;

use App\Helpers\PasswordHelper;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register PasswordHelper as a singleton
        $this->app->singleton(PasswordHelper::class, function ($app) {
            return new PasswordHelper();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
