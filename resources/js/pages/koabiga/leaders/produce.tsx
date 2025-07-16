import { Head } from '@inertiajs/react';
import { Package } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
            { title: 'Unit Leader Dashboard', href: '/koabiga/leaders/dashboard' },
        { title: 'Produce Tracking', href: '/koabiga/leaders/produce' },
];

export default function UnitLeaderProduce() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produce Tracking - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Produce Tracking</h1>
                    <p className="text-gray-600 dark:text-gray-400">Monitor and manage unit produce output</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Produce Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Your produce tracking interface will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 