import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemLogs() {
    return (
        <>
            <Head title="System Logs - Koabiga Admin" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Logs</h1>
                    <p className="text-gray-600 dark:text-gray-400">View system logs and monitoring</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>System Logs Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                            System logs functionality will be implemented here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 