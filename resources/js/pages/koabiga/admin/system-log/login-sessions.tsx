import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginSessions() {
    return (
        <>
            <Head title="Login Sessions - Koabiga Admin" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Login Sessions</h1>
                    <p className="text-gray-600 dark:text-gray-400">Monitor active user sessions and login activity</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Login Sessions Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                            Login sessions functionality will be implemented here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 