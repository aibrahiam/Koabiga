import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Member Dashboard', href: '/koabiga/member/dashboard' },
    { title: 'My Reports', href: '/koabiga/member/reports' },
];

export default function MemberReports() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Reports - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400">Submit and view your reports</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Report Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Your report management interface will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 