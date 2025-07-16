import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorLogs() {
    return (
        <>
            <Head title="Error Logs - Koabiga Admin" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Logs</h1>
                    <p className="text-gray-600 dark:text-gray-400">View system error logs and debugging information</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Error Logs Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                            Error logs functionality will be implemented here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 