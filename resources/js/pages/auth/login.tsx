import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type MemberLoginForm = {
    phone: string;
    pin: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPin: boolean;
}

export default function Login({ status, canResetPin }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<MemberLoginForm>>({
        phone: '',
        pin: '',
        remember: false,
    });
    const [showPin, setShowPin] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('pin'),
        });
    };

    return (
        <AuthLayout title="Welcome to Koabiga" description="Log in to your agriculture platform account">
            <Head title="Login - Koabiga" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            pattern="[0-9]{10,15}"
                            maxLength={15}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Enter your phone number"
                        />
                        <InputError message={errors.phone} />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="pin">5-digit PIN</Label>
                            <TextLink href={route('pin.request')} className="ml-auto text-sm" tabIndex={5}>
                                Forgot PIN?
                            </TextLink>
                        </div>
                        <div className="relative">
                            <Input
                                id="pin"
                                type={showPin ? 'text' : 'password'}
                                pattern="[0-9]{5}"
                                maxLength={5}
                                required
                                tabIndex={2}
                                autoComplete="off"
                                value={data.pin}
                                onChange={(e) => setData('pin', e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                                placeholder="Enter your 5-digit PIN"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                tabIndex={-1}
                                onClick={() => setShowPin((v) => !v)}
                            >
                                {showPin ? '🙈' : '👁️'}
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
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>
                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in to Koabiga
                    </Button>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
