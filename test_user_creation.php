<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "=== User Creation Test ===\n\n";

try {
    // Test creating an admin user
    $admin = User::create([
        'christian_name' => 'Test',
        'family_name' => 'Admin',
        'email' => 'testadmin@koabiga.com',
        'password' => 'test123',
        'role' => 'admin',
        'status' => 'active',
        'bio' => 'Test Admin User'
    ]);
    
    echo "✅ Admin user created successfully!\n";
    echo "ID: {$admin->id}\n";
    echo "Full Name: {$admin->full_name}\n";
    echo "Email: {$admin->email}\n";
    echo "Role: {$admin->role}\n\n";
    
    // Test creating a leader user
    $leader = User::create([
        'christian_name' => 'Test',
        'family_name' => 'Leader',
        'phone' => '1234567899',
        'id_passport' => 'TESTLEADER001',
        'national_id' => 'TESTLEADER123456',
        'gender' => 'male',
        'role' => 'unit_leader',
        'status' => 'active',
        'pin' => '99999',
        'bio' => 'Test Leader User'
    ]);
    
    echo "✅ Leader user created successfully!\n";
    echo "ID: {$leader->id}\n";
    echo "Full Name: {$leader->full_name}\n";
    echo "Phone: {$leader->phone}\n";
    echo "Role: {$leader->role}\n\n";
    
    // Clean up test users
    User::where('email', 'testadmin@koabiga.com')->delete();
    User::where('phone', '1234567899')->delete();
    
    echo "✅ Test users cleaned up successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n"; 