import { Head } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Unit Leader Dashboard', href: '/koabiga/unit-leader/dashboard' },
    { title: 'Land Management', href: '/koabiga/unit-leader/land' },
];

export default function UnitLeaderLand() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Land Management - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Land Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage unit land plots and assignments</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Land Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Your land management interface will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 