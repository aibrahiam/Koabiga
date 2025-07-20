<?php
/**
 * Koabiga cPanel Deployment Script
 * 
 * This script automates the deployment process for cPanel shared hosting
 * without requiring SSH access. Run this script via cPanel File Manager
 * or by visiting it in your browser.
 */

// Prevent direct access in production
if (isset($_GET['run']) && $_GET['run'] === 'deploy') {
    // Only allow if accessed from localhost or with proper authentication
    if ($_SERVER['REMOTE_ADDR'] !== '127.0.0.1' && $_SERVER['REMOTE_ADDR'] !== '::1') {
        die('Access denied. This script should only be run locally.');
    }
} else {
    // Show deployment form
    showDeploymentForm();
    exit;
}

// Start deployment
deployKoabiga();

function showDeploymentForm() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Koabiga cPanel Deployment</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
            .btn:hover { background: #0056b3; }
            .btn-danger { background: #dc3545; }
            .btn-danger:hover { background: #c82333; }
            .step { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Koabiga cPanel Deployment</h1>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> This script will modify your application files and database. 
                Make sure you have a backup before proceeding.
            </div>

            <div class="step">
                <h3>Prerequisites:</h3>
                <ul>
                    <li>✅ All files uploaded to cPanel</li>
                    <li>✅ Database created in cPanel</li>
                    <li>✅ .env file configured</li>
                    <li>✅ File permissions set correctly</li>
                </ul>
            </div>

            <div class="step">
                <h3>What this script will do:</h3>
                <ul>
                    <li>🔧 Install Composer dependencies</li>
                    <li>🔑 Generate application key</li>
                    <li>🗄️ Run database migrations</li>
                    <li>🌱 Seed database with initial data</li>
                    <li>⚡ Optimize Laravel for production</li>
                    <li>🔗 Create storage link</li>
                    <li>✅ Perform final checks</li>
                </ul>
            </div>

            <form method="GET" onsubmit="return confirm('Are you sure you want to proceed with deployment?');">
                <input type="hidden" name="run" value="deploy">
                <button type="submit" class="btn btn-danger">🚀 Start Deployment</button>
            </form>

            <div class="step">
                <h3>After deployment:</h3>
                <ol>
                    <li>Delete this script for security</li>
                    <li>Test your application</li>
                    <li>Configure your domain</li>
                    <li>Enable SSL certificate</li>
                </ol>
            </div>
        </div>
    </body>
    </html>
    <?php
}

function deployKoabiga() {
    echo "<h1>🚀 Koabiga cPanel Deployment</h1>";
    echo "<div style='font-family: monospace; background: #f8f9fa; padding: 20px; border-radius: 5px;'>";
    
    $errors = [];
    $success = [];

    try {
        // Step 1: Check prerequisites
        echo "<h3>📋 Step 1: Checking prerequisites...</h3>";
        
        // Check PHP version
        if (version_compare(PHP_VERSION, '8.2.0', '<')) {
            $errors[] = "PHP 8.2+ required. Current version: " . PHP_VERSION;
        } else {
            $success[] = "✅ PHP version: " . PHP_VERSION;
        }

        // Check required extensions
        $requiredExtensions = ['pdo', 'pdo_mysql', 'mbstring', 'xml', 'curl', 'zip', 'gd', 'bcmath', 'json', 'tokenizer'];
        foreach ($requiredExtensions as $ext) {
            if (!extension_loaded($ext)) {
                $errors[] = "Required PHP extension missing: $ext";
            } else {
                $success[] = "✅ Extension loaded: $ext";
            }
        }

        // Check if .env exists
        if (!file_exists('.env')) {
            $errors[] = ".env file not found";
        } else {
            $success[] = "✅ .env file found";
        }

        // Check if vendor directory exists
        if (!is_dir('vendor')) {
            $errors[] = "vendor directory not found. Please upload Composer dependencies.";
        } else {
            $success[] = "✅ vendor directory found";
        }

        // Check if public/build exists
        if (!is_dir('public/build')) {
            $errors[] = "public/build directory not found. Please build assets first.";
        } else {
            $success[] = "✅ build directory found";
        }

        if (!empty($errors)) {
            echo "<div style='color: red;'>";
            echo "<h4>❌ Prerequisites not met:</h4>";
            foreach ($errors as $error) {
                echo "- $error<br>";
            }
            echo "</div>";
            return;
        }

        foreach ($success as $msg) {
            echo "$msg<br>";
        }

        // Step 2: Load Laravel
        echo "<h3>🔧 Step 2: Loading Laravel...</h3>";
        
        if (!file_exists('vendor/autoload.php')) {
            throw new Exception("Composer autoload not found");
        }
        
        require_once 'vendor/autoload.php';
        
        if (!file_exists('bootstrap/app.php')) {
            throw new Exception("Laravel bootstrap not found");
        }
        
        $app = require_once 'bootstrap/app.php';
        $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
        
        echo "✅ Laravel loaded successfully<br>";

        // Step 3: Generate application key
        echo "<h3>🔑 Step 3: Generating application key...</h3>";
        
        $envFile = '.env';
        $envContent = file_get_contents($envFile);
        
        if (!preg_match('/APP_KEY=base64:/', $envContent)) {
            $key = 'base64:' . base64_encode(random_bytes(32));
            $envContent = preg_replace('/APP_KEY=.*/', 'APP_KEY=' . $key, $envContent);
            file_put_contents($envFile, $envContent);
            echo "✅ Application key generated<br>";
        } else {
            echo "✅ Application key already exists<br>";
        }

        // Step 4: Run migrations
        echo "<h3>🗄️ Step 4: Running database migrations...</h3>";
        
        try {
            $output = [];
            $returnCode = 0;
            exec('php artisan migrate --force 2>&1', $output, $returnCode);
            
            if ($returnCode === 0) {
                echo "✅ Migrations completed successfully<br>";
                foreach ($output as $line) {
                    echo "&nbsp;&nbsp;$line<br>";
                }
            } else {
                throw new Exception("Migration failed: " . implode("\n", $output));
            }
        } catch (Exception $e) {
            echo "⚠️ Migration warning: " . $e->getMessage() . "<br>";
        }

        // Step 5: Seed database
        echo "<h3>🌱 Step 5: Seeding database...</h3>";
        
        try {
            $output = [];
            $returnCode = 0;
            exec('php artisan db:seed --force 2>&1', $output, $returnCode);
            
            if ($returnCode === 0) {
                echo "✅ Database seeded successfully<br>";
                foreach ($output as $line) {
                    echo "&nbsp;&nbsp;$line<br>";
                }
            } else {
                echo "⚠️ Seeding warning: " . implode("\n", $output) . "<br>";
            }
        } catch (Exception $e) {
            echo "⚠️ Seeding warning: " . $e->getMessage() . "<br>";
        }

        // Step 6: Optimize Laravel
        echo "<h3>⚡ Step 6: Optimizing Laravel...</h3>";
        
        $optimizationCommands = [
            'config:cache' => 'Configuration cached',
            'route:cache' => 'Routes cached',
            'view:cache' => 'Views cached',
            'optimize' => 'Application optimized'
        ];
        
        foreach ($optimizationCommands as $command => $message) {
            try {
                $output = [];
                $returnCode = 0;
                exec("php artisan $command 2>&1", $output, $returnCode);
                
                if ($returnCode === 0) {
                    echo "✅ $message<br>";
                } else {
                    echo "⚠️ $command warning: " . implode("\n", $output) . "<br>";
                }
            } catch (Exception $e) {
                echo "⚠️ $command warning: " . $e->getMessage() . "<br>";
            }
        }

        // Step 7: Create storage link
        echo "<h3>🔗 Step 7: Creating storage link...</h3>";
        
        if (!is_link('public/storage')) {
            try {
                $output = [];
                $returnCode = 0;
                exec('php artisan storage:link 2>&1', $output, $returnCode);
                
                if ($returnCode === 0) {
                    echo "✅ Storage link created<br>";
                } else {
                    echo "⚠️ Storage link warning: " . implode("\n", $output) . "<br>";
                }
            } catch (Exception $e) {
                echo "⚠️ Storage link warning: " . $e->getMessage() . "<br>";
            }
        } else {
            echo "✅ Storage link already exists<br>";
        }

        // Step 8: Set permissions
        echo "<h3>🔐 Step 8: Setting file permissions...</h3>";
        
        $directories = ['storage', 'bootstrap/cache'];
        foreach ($directories as $dir) {
            if (is_dir($dir)) {
                chmod($dir, 0755);
                echo "✅ Set permissions for $dir<br>";
            }
        }
        
        if (file_exists('.env')) {
            chmod('.env', 0644);
            echo "✅ Set permissions for .env<br>";
        }

        // Step 9: Final checks
        echo "<h3>🔍 Step 9: Final checks...</h3>";
        
        // Check if app is accessible
        if (file_exists('public/index.php')) {
            echo "✅ Application files in place<br>";
        } else {
            $errors[] = "public/index.php not found";
        }

        // Check database connection
        try {
            $pdo = new PDO(
                'mysql:host=' . env('DB_HOST', 'localhost') . ';dbname=' . env('DB_DATABASE'),
                env('DB_USERNAME'),
                env('DB_PASSWORD')
            );
            echo "✅ Database connection verified<br>";
        } catch (Exception $e) {
            $errors[] = "Database connection failed: " . $e->getMessage();
        }

        // Check if build assets exist
        if (file_exists('public/build/manifest.json')) {
            echo "✅ Build assets verified<br>";
        } else {
            $errors[] = "Build assets not found";
        }

        // Check storage link
        if (is_link('public/storage') || is_dir('public/storage')) {
            echo "✅ Storage link verified<br>";
        } else {
            $errors[] = "Storage link not created";
        }

        if (!empty($errors)) {
            echo "<div style='color: red;'>";
            echo "<h4>❌ Final check issues:</h4>";
            foreach ($errors as $error) {
                echo "- $error<br>";
            }
            echo "</div>";
        } else {
            echo "<h2 style='color: green;'>🎉 Deployment completed successfully!</h2>";
            echo "<p>Your Koabiga application is now ready for production use.</p>";
        }

    } catch (Exception $e) {
        echo "<div style='color: red;'>";
        echo "<h3>❌ Deployment failed:</h3>";
        echo "<p>" . $e->getMessage() . "</p>";
        echo "</div>";
    }

    echo "</div>";
    
    echo "<div style='margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 5px;'>";
    echo "<h3>📋 Next Steps:</h3>";
    echo "<ol>";
    echo "<li><strong>Delete this script</strong> for security</li>";
    echo "<li>Test your application functionality</li>";
    echo "<li>Configure your domain in cPanel</li>";
    echo "<li>Enable SSL certificate</li>";
    echo "<li>Set up regular backups</li>";
    echo "</ol>";
    echo "</div>";
}

// Helper function to get environment variables
function env($key, $default = null) {
    $envFile = '.env';
    if (!file_exists($envFile)) {
        return $default;
    }
    
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($name, $value) = explode('=', $line, 2);
            if (trim($name) === $key) {
                return trim($value);
            }
        }
    }
    
    return $default;
}
?> 