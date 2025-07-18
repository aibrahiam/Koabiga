import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    Filter, 
    Calendar, 
    User, 
    Activity, 
    AlertTriangle,
    Info,
    CheckCircle,
    Clock,
    Trash2
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface ActivityLog {
    id: number;
    user_id?: number;
    user?: {
        id: number;
        christian_name: string;
        family_name: string;
        email: string;
        role: string;
    };
    action: string;
    description: string;
    ip_address?: string;
    user_agent?: string;
    metadata?: any;
    created_at: string;
}

interface ActivityLogsProps {
    activityLogs: ActivityLog[];
    stats: {
        total_logs: number;
        today_logs: number;
        this_week_logs: number;
        this_month_logs: number;
        unique_users: number;
    };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
        case 'login':
            return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Login</Badge>;
        case 'logout':
            return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Logout</Badge>;
        case 'create':
            return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Create</Badge>;
        case 'update':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Update</Badge>;
        case 'delete':
            return <Badge variant="destructive">Delete</Badge>;
        case 'error':
            return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Error</Badge>;
        default:
            return <Badge variant="outline">{action}</Badge>;
    }
};

const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
        case 'login':
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'logout':
            return <Clock className="h-4 w-4 text-gray-600" />;
        case 'create':
            return <Activity className="h-4 w-4 text-blue-600" />;
        case 'update':
            return <Info className="h-4 w-4 text-yellow-600" />;
        case 'delete':
            return <Trash2 className="h-4 w-4 text-red-600" />;
        case 'error':
            return <AlertTriangle className="h-4 w-4 text-red-600" />;
        default:
            return <Activity className="h-4 w-4 text-gray-600" />;
    }
};

export default function ActivityLogs({ activityLogs, stats, pagination }: ActivityLogsProps) {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');

    const filteredLogs = activityLogs.filter(log => {
        const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase()) ||
                            log.action.toLowerCase().includes(search.toLowerCase()) ||
                            (log.user && (
                                log.user.christian_name.toLowerCase().includes(search.toLowerCase()) ||
                                log.user.family_name.toLowerCase().includes(search.toLowerCase()) ||
                                log.user.email.toLowerCase().includes(search.toLowerCase())
                            ));
        
        const matchesAction = actionFilter === 'all' || log.action.toLowerCase() === actionFilter;
        const matchesUser = userFilter === 'all' || (log.user && log.user.role === userFilter);
        
        return matchesSearch && matchesAction && matchesUser;
    });

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'System Logs', href: '/koabiga/admin/logs' },
            { title: 'Activity Logs', href: '/koabiga/admin/activity-logs' },
        ]}>
            <Head title="Activity Logs - Koabiga Admin" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
                    <p className="text-gray-600 dark:text-gray-400">Monitor user activities and system events</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                            <Activity className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_logs}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today</CardTitle>
                            <Calendar className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.today_logs}</div>
                            <p className="text-xs text-muted-foreground">Today's activities</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.this_week_logs}</div>
                            <p className="text-xs text-muted-foreground">Weekly activities</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.this_month_logs}</div>
                            <p className="text-xs text-muted-foreground">Monthly activities</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <User className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.unique_users}</div>
                            <p className="text-xs text-muted-foreground">Unique users</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter activity logs by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search activities, users, or descriptions..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="login">Login</SelectItem>
                                    <SelectItem value="logout">Logout</SelectItem>
                                    <SelectItem value="create">Create</SelectItem>
                                    <SelectItem value="update">Update</SelectItem>
                                    <SelectItem value="delete">Delete</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={userFilter} onValueChange={setUserFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="User Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                    <SelectItem value="zone_leader">Zone Leader</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity Logs</CardTitle>
                        <CardDescription>Recent system activities and user actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IP Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                {activityLogs.length === 0 ? 'No activity logs found.' : 'No logs match your filters.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {log.user ? (
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8">
                                                                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {log.user.christian_name} {log.user.family_name}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {log.user.email}
                                                                </div>
                                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                                    {log.user.role}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">System</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                            {getActionIcon(log.action)}
                                                        </div>
                                                        <div className="ml-3">
                                                            {getActionBadge(log.action)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-white">{log.description}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {log.ip_address || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Info */}
                        {pagination.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                                <div>
                                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                                </div>
                                <div>
                                    Page {pagination.current_page} of {pagination.last_page}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 