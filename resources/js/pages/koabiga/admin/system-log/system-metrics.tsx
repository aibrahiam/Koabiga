import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemMetrics() {
    return (
        <>
            <Head title="System Metrics - Koabiga Admin" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Metrics</h1>
                    <p className="text-gray-600 dark:text-gray-400">View system performance metrics and statistics</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>System Metrics Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                            System metrics functionality will be implemented here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 