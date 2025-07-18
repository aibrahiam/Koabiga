import { Head } from '@inertiajs/react';
import { 
    FileText, 
    Activity,
    AlertTriangle,
    Users,
    Clock,
    ArrowRight,
    BarChart3,
    Shield,
    Database,
    Server
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';

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

interface LogStats {
    total_activity_logs: number;
    total_error_logs: number;
    total_login_sessions: number;
    today_activity_logs: number;
    today_error_logs: number;
    today_login_sessions: number;
    unique_users: number;
    system_health: 'good' | 'warning' | 'error';
}

interface LogsProps {
    stats: LogStats;
}

export default function AdminLogs({ stats }: LogsProps) {
    const logCategories = [
        {
            title: 'Activity Logs',
            description: 'Monitor user activities and system events',
            href: '/koabiga/admin/activity-logs',
            icon: Activity,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            stats: {
                total: stats.total_activity_logs,
                today: stats.today_activity_logs,
                label: 'Total Activities'
            }
        },
        {
            title: 'Error Logs',
            description: 'Track system errors and exceptions',
            href: '/koabiga/admin/error-logs',
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-200 dark:border-red-800',
            stats: {
                total: stats.total_error_logs,
                today: stats.today_error_logs,
                label: 'Total Errors'
            }
        },
        {
            title: 'Login Sessions',
            description: 'Monitor user authentication and sessions',
            href: '/koabiga/admin/login-sessions',
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-800',
            stats: {
                total: stats.total_login_sessions,
                today: stats.today_login_sessions,
                label: 'Total Sessions'
            }
        }
    ];

    const getSystemHealthBadge = (health: string) => {
        switch (health) {
            case 'good':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Good</Badge>;
            case 'warning':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Warning</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
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
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">System Health:</span>
                        {getSystemHealthBadge(stats.system_health)}
                    </div>
                </div>

                {/* System Overview Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                            <Activity className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_activity_logs}</div>
                            <p className="text-xs text-muted-foreground">+{stats.today_activity_logs} today</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Errors</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.total_error_logs}</div>
                            <p className="text-xs text-muted-foreground">+{stats.today_error_logs} today</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Login Sessions</CardTitle>
                            <Users className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.total_login_sessions}</div>
                            <p className="text-xs text-muted-foreground">+{stats.today_login_sessions} today</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.unique_users}</div>
                            <p className="text-xs text-muted-foreground">Unique users</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Log Categories */}
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                    {logCategories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                            <Card key={category.title} className={`border-2 ${category.borderColor} hover:shadow-lg transition-shadow`}>
                                <CardHeader className={`${category.bgColor} rounded-t-lg`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
                                                <IconComponent className={`h-6 w-6 ${category.color}`} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{category.title}</CardTitle>
                                                <CardDescription>{category.description}</CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-2xl font-bold">{category.stats.total}</div>
                                            <div className="text-sm text-muted-foreground">{category.stats.label}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-green-600">+{category.stats.today}</div>
                                            <div className="text-xs text-muted-foreground">Today</div>
                                        </div>
                                    </div>
                                    <Button asChild className="w-full" variant="outline">
                                        <Link href={category.href}>
                                            View Details
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common system monitoring tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                                <BarChart3 className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">System Analytics</div>
                                    <div className="text-sm text-muted-foreground">View detailed analytics</div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                                <Shield className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">Security Audit</div>
                                    <div className="text-sm text-muted-foreground">Review security logs</div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                                <Database className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">Database Health</div>
                                    <div className="text-sm text-muted-foreground">Check database status</div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 