import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type UnitLeaderLoginForm = {
    phone: string;
    pin: string;
    remember: boolean;
};

interface UnitLeaderLoginProps {
    status?: string;
    canResetPin: boolean;
}

export default function UnitLeaderLogin({ status, canResetPin }: UnitLeaderLoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<UnitLeaderLoginForm>>({
        phone: '',
        pin: '',
        remember: false,
    });
    const [showPin, setShowPin] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            data: { ...data, role: 'unit_leader' },
            onFinish: () => reset('pin'),
        });
    };

    return (
        <>
            <Head title="Unit Leader Login - Koabiga" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6 text-gray-800 dark:from-green-950 dark:to-emerald-900 dark:text-gray-100">
                <div className="w-full max-w-md rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-emerald-500 dark:bg-gray-900/80 dark:border-emerald-700">
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <img 
                                src="/logo.jpg" 
                                alt="Koabiga Logo" 
                                className="h-16 w-16 rounded-lg object-cover shadow-lg"
                            />
                        </div>
                    </div>
                    <h2 className="mb-6 text-center text-xl font-semibold text-gray-700 dark:text-gray-200">Unit Leader Login</h2>
                    <form className="flex flex-col gap-4" onSubmit={submit}>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Phone Number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                pattern="[0-9]{10,15}"
                                maxLength={15}
                                required
                                className="w-full rounded-lg border border-emerald-500 px-3 py-2 text-base shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-emerald-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-800"
                                placeholder="Enter your phone number"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value.replace(/[^0-9]/g, ''))}
                            />
                            <InputError message={errors.phone} />
                        </div>
                        <div>
                            <div className="flex items-center mb-1">
                                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-200">5-digit PIN</label>
                                <Link href={route('pin.request')} className="ml-auto text-sm text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">Forgot PIN?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="pin"
                                    name="pin"
                                    type={showPin ? 'text' : 'password'}
                                    pattern="[0-9]{5}"
                                    maxLength={5}
                                    required
                                    className="w-full rounded-lg border border-emerald-500 px-3 py-2 text-base shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-emerald-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-800"
                                    placeholder="Enter your 5-digit PIN"
                                    value={data.pin}
                                    onChange={(e) => setData('pin', e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    tabIndex={-1}
                                    onClick={() => setShowPin((v) => !v)}
                                >
                                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <InputError message={errors.pin} />
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                                className="border-emerald-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 dark:border-emerald-600 dark:data-[state=checked]:bg-emerald-400 dark:data-[state=checked]:border-emerald-400"
                            />
                            <Label htmlFor="remember" className="text-gray-700 dark:text-gray-200">Remember me</Label>
                        </div>
                        <button
                            type="submit"
                            className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-colors duration-200"
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2 inline" />}
                            Login as Unit Leader
                        </button>
                    </form>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 transition-colors dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go back to home
                        </Link>
                    </div>
                    {status && <div className="mt-4 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">{status}</div>}
                </div>
            </div>
        </>
    );
} 