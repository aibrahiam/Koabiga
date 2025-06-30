import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';

export default function Welcome() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [errors, setErrors] = useState<{ phone?: string; pin?: string; general?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const validateForm = () => {
        const newErrors: { phone?: string; pin?: string } = {};

        // Phone number validation
        if (!phoneNumber.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d+$/.test(phoneNumber)) {
            newErrors.phone = 'Phone number must contain only digits';
        }

        // PIN validation
        if (!pin.trim()) {
            newErrors.pin = 'PIN is required';
        } else if (!/^\d{5}$/.test(pin)) {
            newErrors.pin = 'PIN must be exactly 5 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    pin: pin,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || 'Login successful!');
                // Clear form on success
                setPhoneNumber('');
                setPin('');
            } else {
                setErrors({ general: data.message || 'Login failed' });
            }
        } catch (error) {
            setErrors({ general: 'Network error. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setPhoneNumber(value);
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: undefined }));
        }
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
        setPin(value);
        if (errors.pin) {
            setErrors(prev => ({ ...prev, pin: undefined }));
        }
    };

    return (
        <>
            <Head title="Welcome to Koabiga" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6 text-gray-800 dark:from-green-950 dark:to-emerald-900 dark:text-gray-100">
                <div className="w-full max-w-md rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-green-200 dark:bg-gray-900/80 dark:border-green-800">
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <img 
                                src="/logo.jpg" 
                                alt="Koabiga Logo" 
                                className="h-16 w-16 rounded-lg object-cover shadow-lg"
                            />
                        </div>
                    </div>
                    
                    <h2 className="mb-6 text-center text-xl font-semibold text-gray-700 dark:text-gray-200">Member Login</h2>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Phone Number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                className="w-full rounded-lg border border-green-300 px-3 py-2 text-base shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:border-green-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-green-400 dark:focus:ring-green-800"
                                placeholder="Enter your phone number"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                disabled={isLoading}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="pin" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">5-digit PIN</label>
                            <div className="relative">
                                <input
                                    id="pin"
                                    name="pin"
                                    type={showPin ? 'text' : 'password'}
                                    maxLength={5}
                                    required
                                    className="w-full rounded-lg border border-green-300 px-3 py-2 text-base shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:border-green-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-green-400 dark:focus:ring-green-800 pr-10"
                                    placeholder="Enter your 5-digit PIN"
                                    value={pin}
                                    onChange={handlePinChange}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    tabIndex={-1}
                                    onClick={() => setShowPin((v) => !v)}
                                    disabled={isLoading}
                                >
                                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.pin && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pin}</p>
                            )}
                        </div>

                        {errors.general && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                                <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : 'Login as Member'}
                        </button>
                    </form>

                    <div className="flex flex-col gap-3 mt-6">
                        <Link
                            href="/unit-leader-login"
                            className="w-full rounded-lg border-2 border-emerald-500 bg-white px-4 py-3 text-center font-semibold text-emerald-600 shadow-md hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-colors duration-200 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-900/10"
                        >
                            Unit Leader Login
                        </Link>
                        <div className="flex justify-end">
                            <Link
                                href="/admin-login"
                                className="text-red-600 font-semibold hover:underline focus:outline-none focus:underline transition-colors duration-200"
                            >
                                Admin Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
