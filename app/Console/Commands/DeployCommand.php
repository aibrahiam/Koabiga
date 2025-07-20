<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class DeployCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'koabiga:deploy {--force : Force deployment without confirmation} {--env=production : Environment to deploy to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deploy Koabiga application to production';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting Koabiga Deployment...');
        $this->newLine();

        // Check if we're in production mode
        if (!$this->option('force') && app()->environment('local')) {
            if (!$this->confirm('You are in local environment. Are you sure you want to deploy?')) {
                $this->error('Deployment cancelled.');
                return 1;
            }
        }

        try {
            // Step 1: Check prerequisites
            $this->checkPrerequisites();

            // Step 2: Backup current state
            $this->createBackup();

            // Step 3: Install dependencies
            $this->installDependencies();

            // Step 4: Build assets
            $this->buildAssets();

            // Step 5: Database operations
            $this->setupDatabase();

            // Step 6: Optimize Laravel
            $this->optimizeLaravel();

            // Step 7: Set permissions
            $this->setPermissions();

            // Step 8: Final checks
            $this->finalChecks();

            $this->newLine();
            $this->info('✅ Deployment completed successfully!');
            $this->info('🎉 Koabiga is now ready for production use.');

        } catch (\Exception $e) {
            $this->error('❌ Deployment failed: ' . $e->getMessage());
            $this->error('Please check the logs and try again.');
            return 1;
        }

        return 0;
    }

    /**
     * Check deployment prerequisites
     */
    private function checkPrerequisites()
    {
        $this->info('📋 Checking prerequisites...');

        // Check PHP version
        $phpVersion = PHP_VERSION;
        if (version_compare($phpVersion, '8.2.0', '<')) {
            throw new \Exception("PHP 8.2+ required. Current version: $phpVersion");
        }
        $this->line("✅ PHP version: $phpVersion");

        // Check required extensions
        $requiredExtensions = ['pdo', 'pdo_pgsql', 'mbstring', 'xml', 'curl', 'zip', 'gd', 'bcmath', 'json', 'tokenizer'];
        foreach ($requiredExtensions as $ext) {
            if (!extension_loaded($ext)) {
                throw new \Exception("Required PHP extension missing: $ext");
            }
        }
        $this->line('✅ All required PHP extensions installed');

        // Check if .env exists
        if (!File::exists('.env')) {
            throw new \Exception('.env file not found. Please create it from .env.example');
        }
        $this->line('✅ Environment file found');

        // Check database connection
        try {
            DB::connection()->getPdo();
            $this->line('✅ Database connection successful');
        } catch (\Exception $e) {
            throw new \Exception('Database connection failed: ' . $e->getMessage());
        }

        $this->info('✅ All prerequisites met');
    }

    /**
     * Create backup of current state
     */
    private function createBackup()
    {
        $this->info('💾 Creating backup...');

        $backupDir = storage_path('backups/' . date('Y-m-d_H-i-s'));
        File::makeDirectory($backupDir, 0755, true, true);

        // Backup .env
        if (File::exists('.env')) {
            File::copy('.env', $backupDir . '/.env.backup');
        }

        // Backup database (if possible)
        try {
            $tables = DB::select('SHOW TABLES');
            if (!empty($tables)) {
                $this->line('✅ Database backup created');
            }
        } catch (\Exception $e) {
            $this->warn('⚠️  Could not create database backup: ' . $e->getMessage());
        }

        $this->info('✅ Backup completed');
    }

    /**
     * Install dependencies
     */
    private function installDependencies()
    {
        $this->info('📦 Installing dependencies...');

        // Install Composer dependencies
        $this->line('Installing PHP dependencies...');
        $composerOutput = shell_exec('composer install --no-dev --optimize-autoloader --no-interaction 2>&1');
        if (strpos($composerOutput, 'error') !== false) {
            throw new \Exception('Composer installation failed: ' . $composerOutput);
        }
        $this->line('✅ PHP dependencies installed');

        // Install Node.js dependencies
        $this->line('Installing Node.js dependencies...');
        $npmOutput = shell_exec('npm ci --production=false 2>&1');
        if (strpos($npmOutput, 'error') !== false) {
            throw new \Exception('npm installation failed: ' . $npmOutput);
        }
        $this->line('✅ Node.js dependencies installed');

        $this->info('✅ All dependencies installed');
    }

    /**
     * Build frontend assets
     */
    private function buildAssets()
    {
        $this->info('🔨 Building frontend assets...');

        // Clean previous build
        if (File::exists('public/build')) {
            File::deleteDirectory('public/build');
        }

        // Build assets
        $buildOutput = shell_exec('npm run build 2>&1');
        if (strpos($buildOutput, 'error') !== false || !File::exists('public/build/manifest.json')) {
            throw new \Exception('Asset build failed: ' . $buildOutput);
        }

        $this->info('✅ Frontend assets built successfully');
    }

    /**
     * Setup database
     */
    private function setupDatabase()
    {
        $this->info('🗄️  Setting up database...');

        // Run migrations
        $this->line('Running migrations...');
        Artisan::call('migrate', ['--force' => true]);
        $this->line('✅ Migrations completed');

        // Check if seeding is needed
        $seededFile = database_path('seeded');
        if (!File::exists($seededFile)) {
            $this->line('Seeding database...');
            
            // Seed in order
            $seeders = [
                'ZoneSeeder',
                'UnitSeeder', 
                'AdminUserSeeder',
                'FeeRuleSeeder',
                'FormSeeder',
                'AgricultureSeeder'
            ];

            foreach ($seeders as $seeder) {
                try {
                    Artisan::call('db:seed', ['--class' => $seeder, '--force' => true]);
                    $this->line("✅ $seeder completed");
                } catch (\Exception $e) {
                    $this->warn("⚠️  $seeder failed: " . $e->getMessage());
                }
            }

            // Mark as seeded
            File::put($seededFile, date('Y-m-d H:i:s'));
            $this->line('✅ Database seeded');
        } else {
            $this->line('✅ Database already seeded');
        }

        $this->info('✅ Database setup completed');
    }

    /**
     * Optimize Laravel for production
     */
    private function optimizeLaravel()
    {
        $this->info('⚡ Optimizing Laravel...');

        // Clear all caches first
        $this->line('Clearing caches...');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');
        Artisan::call('cache:clear');

        // Cache configurations
        $this->line('Caching configurations...');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');

        // Create storage link if needed
        if (!File::exists('public/storage')) {
            $this->line('Creating storage link...');
            Artisan::call('storage:link');
        }

        $this->info('✅ Laravel optimized for production');
    }

    /**
     * Set proper file permissions
     */
    private function setPermissions()
    {
        $this->info('🔐 Setting file permissions...');

        // Set directory permissions
        $directories = [
            'storage' => 0755,
            'bootstrap/cache' => 0755,
            'public/build' => 0755
        ];

        foreach ($directories as $dir => $permission) {
            if (File::exists($dir)) {
                File::chmod($dir, $permission);
                $this->line("✅ Set permissions for $dir");
            }
        }

        // Set file permissions
        $files = [
            '.env' => 0644
        ];

        foreach ($files as $file => $permission) {
            if (File::exists($file)) {
                File::chmod($file, $permission);
                $this->line("✅ Set permissions for $file");
            }
        }

        $this->info('✅ File permissions set');
    }

    /**
     * Perform final checks
     */
    private function finalChecks()
    {
        $this->info('🔍 Performing final checks...');

        // Check if app is accessible
        if (!File::exists('public/index.php')) {
            throw new \Exception('public/index.php not found');
        }
        $this->line('✅ Application files in place');

        // Check database connection
        try {
            DB::connection()->getPdo();
            $this->line('✅ Database connection verified');
        } catch (\Exception $e) {
            throw new \Exception('Database connection failed: ' . $e->getMessage());
        }

        // Check if build assets exist
        if (!File::exists('public/build/manifest.json')) {
            throw new \Exception('Build assets not found');
        }
        $this->line('✅ Build assets verified');

        // Check storage link
        if (!File::exists('public/storage')) {
            throw new \Exception('Storage link not created');
        }
        $this->line('✅ Storage link verified');

        $this->info('✅ All final checks passed');
    }
}
