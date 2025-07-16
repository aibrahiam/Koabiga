import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ActivityLogs() {
    return (
        <>
            <Head title="Activity Logs - Koabiga Admin" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Activity Logs</h1>
                    <p className="text-gray-600 dark:text-gray-400">Monitor user activities and system events</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity Logs Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                            Activity logs functionality will be implemented here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 