import { Head, useForm, router } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { clearSessionOnLoginPage } from '@/lib/session-manager';

type AdminLoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface AdminLoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function AdminLogin({ status, canResetPassword }: AdminLoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<AdminLoginForm>>({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassport, setShowPassport] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    // Auto-clear session on visiting login page
    useEffect(() => {
        clearSessionOnLoginPage();
    }, []);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setGeneralError(null);
        setIsLoading(true);
        
        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Use Laravel session authentication
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    remember: data.remember,
                }),
                credentials: 'include', // Include cookies for session
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success && result.user) {
                    // Create unified user data
                    const authUser = {
                        id: result.user.id,
                        name: `${result.user.christian_name} ${result.user.family_name}`,
                        email: result.user.email,
                        role: result.user.role,
                        avatar: result.user.avatar || null,
                        christian_name: result.user.christian_name,
                        family_name: result.user.family_name,
                        phone: result.user.phone,
                    };
                    
                    // Use unified login function
                    login(authUser);
                    
                    // Use full page reload to ensure cookies are sent
                    window.location.href = '/koabiga/admin/dashboard';
                } else {
                    setGeneralError(result.message || 'Login failed');
                }
            } else {
                const errorData = await response.json();
                setGeneralError(errorData.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setGeneralError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="Admin Login - Koabiga" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6 text-gray-800 dark:from-green-950 dark:to-emerald-900 dark:text-gray-100">
                <div className="w-full max-w-md rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-emerald-700 dark:bg-gray-900/80 dark:border-emerald-800">
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <img src="/logo.png" alt="Koabiga Logo" className="h-12 w-12 rounded-lg shadow-lg" />
                        </div>
                    </div>
                    <h2 className="mb-6 text-center text-xl font-semibold text-gray-700 dark:text-gray-200">Admin Login</h2>
                    <form className="flex flex-col gap-4" onSubmit={submit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full rounded-lg border border-emerald-700 px-3 py-2 text-base shadow-sm focus:border-emerald-800 focus:ring-2 focus:ring-emerald-200 dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-800"
                                placeholder="Enter your email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div>
                            <div className="flex items-center mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassport ? 'text' : 'password'}
                                    required
                                    className="w-full rounded-lg border border-emerald-700 px-3 py-2 text-base shadow-sm focus:border-emerald-800 focus:ring-2 focus:ring-emerald-200 dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-800"
                                    placeholder="Enter your password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    tabIndex={-1}
                                    onClick={() => setShowPassport((v) => !v)}
                                >
                                    {showPassport ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                                className="border-emerald-700 data-[state=checked]:bg-emerald-800 data-[state=checked]:border-emerald-800 dark:border-emerald-700 dark:data-[state=checked]:bg-emerald-400 dark:data-[state=checked]:border-emerald-400"
                            />
                            <Label htmlFor="remember" className="text-gray-700 dark:text-gray-200">Remember me</Label>
                        </div>
                        {generalError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="mt-2 w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-200"
                            disabled={isLoading}
                        >
                            {isLoading && <LoaderCircle className="h-4 w-4 animate-spin mr-2 inline" />}
                            Login as Admin
                        </button>
                    </form>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm text-emerald-700 hover:text-emerald-900 transition-colors dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go back to home
                        </Link>
                    </div>
                    {status && <div className="mt-4 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">{status}</div>}
                </div>
            </div>
        </>
    );
} 