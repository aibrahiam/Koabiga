import { Head } from '@inertiajs/react';
import { Sprout } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Member Dashboard', href: '/koabiga/member/dashboard' },
    { title: 'My Crops', href: '/koabiga/member/crops' },
];

export default function MemberCrops() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Crops - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Crops</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your assigned crop progress</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sprout className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Crop Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Your crop management interface will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 