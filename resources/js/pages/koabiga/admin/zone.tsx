import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

export default function CreateZone() {
    const { data, setData, post, processing, errors } = useForm({
        zoneName: '',
        leaderChristianName: '',
        leaderFamilyName: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // post('/koabiga/admin/zone'); // Uncomment and adjust for real backend
        alert('Zone created! (mock)');
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Zone', href: '/koabiga/admin/zone' },
        ]}>
            <Head title="Create Zone - Koabiga Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 items-center">
                <Card className="w-full max-w-md sm:max-w-lg">
                    <CardHeader>
                        <CardTitle>Create New Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block mb-1 font-medium">Zone Name</label>
                                <Input
                                    value={data.zoneName}
                                    onChange={e => setData('zoneName', e.target.value)}
                                    placeholder="Zone Name"
                                    required
                                />
                                {errors.zoneName && <div className="text-red-600 text-sm mt-1">{errors.zoneName}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Zone Leader Christian Name</label>
                                <Input
                                    value={data.leaderChristianName}
                                    onChange={e => setData('leaderChristianName', e.target.value)}
                                    placeholder="Leader Christian Name"
                                    required
                                />
                                {errors.leaderChristianName && <div className="text-red-600 text-sm mt-1">{errors.leaderChristianName}</div>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Zone Leader Family Name</label>
                                <Input
                                    value={data.leaderFamilyName}
                                    onChange={e => setData('leaderFamilyName', e.target.value)}
                                    placeholder="Leader Family Name"
                                    required
                                />
                                {errors.leaderFamilyName && <div className="text-red-600 text-sm mt-1">{errors.leaderFamilyName}</div>}
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Link href="/koabiga/admin/dashboard">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Create Zone</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 