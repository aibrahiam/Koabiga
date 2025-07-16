import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { clearSessionOnLoginPage } from '@/lib/session-manager';

type LeadersLoginForm = {
    phone: string;
    pin: string;
};

interface LeadersLoginProps {
    status?: string;
    canResetPin?: boolean;
}

export default function LeadersLogin({ status, canResetPin }: LeadersLoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LeadersLoginForm>>({
        phone: '',
        pin: '',
    });

    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    // Auto-clear session on visiting login page
    useEffect(() => {
        clearSessionOnLoginPage();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setGeneralError(null);

        try {
            const response = await fetch('/api/leaders/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    phone: data.phone,
                    pin: data.pin,
                }),
            });

            const result = await response.json();

            if (response.ok && result.message === 'Login successful' && result.user) {
                const authUser = {
                    id: result.user.id,
                    name: `${result.user.christian_name} ${result.user.family_name}`,
                    christian_name: result.user.christian_name,
                    family_name: result.user.family_name,
                    email: result.user.email,
                    phone: result.user.phone,
                    role: result.user.role,
                    unit_id: result.user.unit_id,
                    zone_id: result.user.zone_id,
                };

                // Use unified login function
                login(authUser);
                
                // Redirect to leaders dashboard
                window.location.href = '/koabiga/leaders/dashboard';
            } else {
                setGeneralError(result.message || 'Login failed');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setGeneralError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="Leaders Login - Koabiga" />
            
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <img 
                                src="/logo.png" 
                                alt="Koabiga Logo" 
                                className="h-20 w-20 rounded-xl object-cover shadow-xl border-4 border-white dark:border-gray-800"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Koabiga Leaders
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Unit Management Portal
                        </p>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                            Leaders Login
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {generalError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                                    {generalError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                                        placeholder="Enter your phone number"
                                    />
                                    {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
                                </div>

                                <div>
                                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        PIN
                                    </label>
                                    <input
                                        id="pin"
                                        name="pin"
                                        type="password"
                                        required
                                        value={data.pin}
                                        onChange={e => setData('pin', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                                        placeholder="Enter your PIN"
                                    />
                                    {errors.pin && <div className="text-red-600 text-sm mt-1">{errors.pin}</div>}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || processing}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? 'Logging in...' : 'Login as Leader'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <a
                                    href="/"
                                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                                >
                                    Back to Member Login
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 