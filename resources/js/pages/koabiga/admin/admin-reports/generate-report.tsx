import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GenerateReport() {
    return (
        <>
            <Head title="Generate Report - Koabiga Admin" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Generate Report</h1>
                    <p className="text-gray-600 dark:text-gray-400">Create and generate custom reports</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Report Generator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                            Report generation functionality will be implemented here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 