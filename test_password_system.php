<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Helpers\PasswordHelper;
use App\Models\User;

echo "=== Password Helper Test ===\n\n";

// Test password hashing
$password = 'admin123';
$hashedPassword = PasswordHelper::hashPassword($password);
echo "Password: $password\n";
echo "Hashed: $hashedPassword\n";
echo "Verify: " . (PasswordHelper::verifyPassword($password, $hashedPassword) ? '✅ PASS' : '❌ FAIL') . "\n\n";

// Test PIN hashing
$pin = '12345';
$hashedPin = PasswordHelper::hashPin($pin);
echo "PIN: $pin\n";
echo "Hashed: $hashedPin\n";
echo "Verify: " . (PasswordHelper::verifyPin($pin, $hashedPin) ? '✅ PASS' : '❌ FAIL') . "\n\n";

// Test PIN generation
$newPin = PasswordHelper::generatePin();
echo "Generated PIN: $newPin\n";
echo "Valid format: " . (PasswordHelper::validatePinFormat($newPin) ? '✅ YES' : '❌ NO') . "\n\n";

// Test password strength validation
$strongPassword = 'Admin123';
$weakPassword = 'password';
echo "Strong password '$strongPassword': " . (PasswordHelper::validatePasswordStrength($strongPassword) ? '✅ STRONG' : '❌ WEAK') . "\n";
echo "Weak password '$weakPassword': " . (PasswordHelper::validatePasswordStrength($weakPassword) ? '✅ STRONG' : '❌ WEAK') . "\n\n";

// Test role-based login methods
echo "Role-based login tests:\n";
echo "Admin can use email login: " . (PasswordHelper::canUseEmailLogin('admin') ? '✅ YES' : '❌ NO') . "\n";
echo "Leader can use email login: " . (PasswordHelper::canUseEmailLogin('unit_leader') ? '✅ YES' : '❌ NO') . "\n";
echo "Member can use email login: " . (PasswordHelper::canUseEmailLogin('member') ? '✅ YES' : '❌ NO') . "\n";
echo "Admin can use phone login: " . (PasswordHelper::canUsePhoneLogin('admin') ? '✅ YES' : '❌ NO') . "\n";
echo "Leader can use phone login: " . (PasswordHelper::canUsePhoneLogin('unit_leader') ? '✅ YES' : '❌ NO') . "\n";
echo "Member can use phone login: " . (PasswordHelper::canUsePhoneLogin('member') ? '✅ YES' : '❌ NO') . "\n\n";

echo "=== Test Complete ===\n"; 