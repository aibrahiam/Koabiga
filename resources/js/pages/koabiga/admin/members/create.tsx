import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

export default function CreateMember() {
    const { data, setData, post, processing, errors, reset } = useForm({
        christianName: '',
        familyName: '',
        idPassport: '',
        role: '',
        status: 'active',
        pin: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/koabiga/admin/members'); // Adjust endpoint as needed
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Members', href: '/koabiga/admin/members' },
            { title: 'Add Member', href: '/koabiga/admin/members/create' },
        ]}>
            <Head title="Add Member - Koabiga Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 items-center">
                <Card className="w-full max-w-md sm:max-w-lg">
                    <CardHeader>
                        <CardTitle>Add New Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block mb-1 font-medium">Christian Name</label>
                                <Input
                                    value={data.christianName}
                                    onChange={e => setData('christianName', e.target.value)}
                                    placeholder="Christian Name"
                                    required
                                />
                                {errors.christianName && <div className="text-red-600 text-sm mt-1">{errors.christianName}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Family Name</label>
                                <Input
                                    value={data.familyName}
                                    onChange={e => setData('familyName', e.target.value)}
                                    placeholder="Family Name"
                                    required
                                />
                                {errors.familyName && <div className="text-red-600 text-sm mt-1">{errors.familyName}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">ID/Passport</label>
                                <Input
                                    value={data.idPassport}
                                    onChange={e => setData('idPassport', e.target.value)}
                                    placeholder="ID or Passport Number"
                                    required
                                />
                                {errors.idPassport && <div className="text-red-600 text-sm mt-1">{errors.idPassport}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Role</label>
                                <Select value={data.role} onValueChange={value => setData('role', value)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <div className="text-red-600 text-sm mt-1">{errors.role}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Status</label>
                                <Select value={data.status} onValueChange={value => setData('status', value)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <div className="text-red-600 text-sm mt-1">{errors.status}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">PIN/Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.pin}
                                        onChange={e => setData('pin', e.target.value)}
                                        placeholder="PIN or Password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((v) => !v)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.pin && <div className="text-red-600 text-sm mt-1">{errors.pin}</div>}
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Link href="/koabiga/admin/members">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Add Member</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 