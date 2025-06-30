import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

export default function CreateUnit() {
    // Mock zones data - replace with API call in production
    const zones = [
        { id: 1, name: 'North Zone' },
        { id: 2, name: 'South Zone' },
        { id: 3, name: 'East Zone' },
        { id: 4, name: 'West Zone' },
        { id: 5, name: 'Central Zone' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        leaderChristianName: '',
        leaderFamilyName: '',
        location: '',
        status: 'active',
        totalLand: '',
        zoneId: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // post('/koabiga/admin/units'); // Uncomment and adjust for real backend
        alert('Unit created! (mock)');
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Units', href: '/koabiga/admin/units' },
            { title: 'Create New Unit', href: '/koabiga/admin/units/create_unit' },
        ]}>
            <Head title="Create New Unit - Koabiga Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 items-center">
                <Card className="w-full max-w-md sm:max-w-lg">
                    <CardHeader>
                        <CardTitle>Create New Unit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block mb-1 font-medium">Unit Name</label>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Unit Name"
                                    required
                                />
                                {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Zone</label>
                                <Select value={data.zoneId} onValueChange={value => setData('zoneId', value)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {zones.map((zone) => (
                                            <SelectItem key={zone.id} value={zone.id.toString()}>
                                                {zone.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.zoneId && <div className="text-red-600 text-sm mt-1">{errors.zoneId}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Unit Code</label>
                                <Input
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value)}
                                    placeholder="Unit Code"
                                    required
                                />
                                {errors.code && <div className="text-red-600 text-sm mt-1">{errors.code}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Unit Leader</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        value={data.leaderChristianName}
                                        onChange={e => setData('leaderChristianName', e.target.value)}
                                        placeholder="Christian Name"
                                        required
                                    />
                                    <Input
                                        value={data.leaderFamilyName}
                                        onChange={e => setData('leaderFamilyName', e.target.value)}
                                        placeholder="Family Name"
                                        required
                                    />
                                </div>
                                {(errors.leaderChristianName || errors.leaderFamilyName) && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.leaderChristianName || errors.leaderFamilyName}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Location</label>
                                <Input
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    placeholder="Location"
                                    required
                                />
                                {errors.location && <div className="text-red-600 text-sm mt-1">{errors.location}</div>}
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
                                <label className="block mb-1 font-medium">Total Land (ha)</label>
                                <Input
                                    type="number"
                                    value={data.totalLand}
                                    onChange={e => setData('totalLand', e.target.value.replace(/[^0-9.]/g, ''))}
                                    placeholder="Total Land in hectares"
                                    required
                                />
                                {errors.totalLand && <div className="text-red-600 text-sm mt-1">{errors.totalLand}</div>}
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Link href="/koabiga/admin/units">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Create Unit</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 