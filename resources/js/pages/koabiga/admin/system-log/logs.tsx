import { Head } from '@inertiajs/react';
import { 
    FileText, 
    Search, 
    Filter, 
    Download,
    Eye,
    Calendar,
    AlertTriangle,
    Info,
    CheckCircle,
    XCircle
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/koabiga/admin/dashboard',
    },
    {
        title: 'System Logs',
        href: '/koabiga/admin/logs',
    },
];

export default function AdminLogs() {
    // Mock data for demonstration
    const logs = [
        {
            id: 1,
            level: 'info',
            message: 'User login successful',
            user: 'sarah.smith@koabiga.com',
            module: 'authentication',
            timestamp: '2024-06-27 10:30:15',
        },
        {
            id: 2,
            level: 'warning',
            message: 'Failed login attempt',
            user: 'unknown@example.com',
            module: 'authentication',
            timestamp: '2024-06-27 10:25:30',
        },
        {
            id: 3,
            level: 'error',
            message: 'Database connection failed',
            user: 'system',
            module: 'database',
            timestamp: '2024-06-27 10:20:45',
        },
        {
            id: 4,
            level: 'success',
            message: 'Payment processed',
            user: 'emily.davis@koabiga.com',
            module: 'payments',
            timestamp: '2024-06-27 10:15:20',
        },
    ];

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'info':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Info</Badge>;
            case 'warning':
                return <Badge variant="outline" className="border-yellow-200 text-yellow-700">Warning</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            case 'success':
                return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
            default:
                return <Badge variant="outline">{level}</Badge>;
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'info':
                return <Info className="h-4 w-4 text-blue-600" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            default:
                return <Info className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Logs - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Logs</h1>
                        <p className="text-gray-600 dark:text-gray-400">Monitor system activities and events</p>
                    </div>
                    <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Export Logs
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{logs.length}</div>
                            <p className="text-xs text-muted-foreground">Today</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Info</CardTitle>
                            <Info className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {logs.filter(l => l.level === 'info').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Information logs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {logs.filter(l => l.level === 'warning').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Warning logs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Errors</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {logs.filter(l => l.level === 'error').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Error logs</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-1 items-center space-x-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search logs..." className="pl-8" />
                            </div>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Logs</CardTitle>
                        <CardDescription>Detailed system activity logs and events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Level</th>
                                        <th className="text-left p-4 font-medium">Message</th>
                                        <th className="text-left p-4 font-medium">User</th>
                                        <th className="text-left p-4 font-medium">Module</th>
                                        <th className="text-left p-4 font-medium">Timestamp</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    {getLevelIcon(log.level)}
                                                    {getLevelBadge(log.level)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium">{log.message}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{log.user}</span>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline">{log.module}</Badge>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{log.timestamp}</span>
                                            </td>
                                            <td className="p-4">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 