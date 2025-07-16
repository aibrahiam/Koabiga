import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Reports() {
    return (
        <>
            <Head title="Reports - Koabiga Admin" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400">Generate and view system reports</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reports Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                            Reports functionality will be implemented here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 