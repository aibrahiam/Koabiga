import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    Filter, 
    AlertTriangle,
    Info,
    XCircle,
    CheckCircle,
    Clock,
    User,
    FileText,
    Eye,
    CheckSquare,
    Trash2,
    Download
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

interface ErrorLog {
    id: number;
    user_id?: number;
    user?: {
        id: number;
        christian_name: string;
        family_name: string;
        email: string;
    };
    level: 'error' | 'warning' | 'info';
    message: string;
    stack_trace?: string;
    file?: string;
    line?: number;
    context?: any;
    resolved: boolean;
    resolved_at?: string;
    resolved_by?: number;
    created_at: string;
}

interface ErrorLogsProps {
    errorLogs: ErrorLog[];
    stats: {
        total_errors: number;
        errors_today: number;
        errors_this_week: number;
        errors_this_month: number;
        unresolved_errors: number;
        error_levels: {
            error: number;
            warning: number;
            info: number;
        };
    };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        level?: string;
        resolved?: string;
        search?: string;
    };
}

const getLevelBadge = (level: string) => {
    switch (level) {
        case 'error':
            return <Badge variant="destructive">Error</Badge>;
        case 'warning':
            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Warning</Badge>;
        case 'info':
            return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Info</Badge>;
        default:
            return <Badge variant="outline">{level}</Badge>;
    }
};

const getLevelIcon = (level: string) => {
    switch (level) {
        case 'error':
            return <XCircle className="h-4 w-4 text-red-600" />;
        case 'warning':
            return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
        case 'info':
            return <Info className="h-4 w-4 text-blue-600" />;
        default:
            return <Info className="h-4 w-4 text-gray-600" />;
    }
};

export default function ErrorLogs({ errorLogs, stats, pagination, filters }: ErrorLogsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [levelFilter, setLevelFilter] = useState(filters.level || 'all');
    const [resolvedFilter, setResolvedFilter] = useState(filters.resolved || 'all');

    const filteredLogs = errorLogs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
                            (log.file && log.file.toLowerCase().includes(search.toLowerCase()));
        
        const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
        const matchesResolved = resolvedFilter === 'all' || 
                               (resolvedFilter === 'true' && log.resolved) ||
                               (resolvedFilter === 'false' && !log.resolved);
        
        return matchesSearch && matchesLevel && matchesResolved;
    });

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'System Logs', href: '/koabiga/admin/logs' },
            { title: 'Error Logs', href: '/koabiga/admin/error-logs' },
        ]}>
            <Head title="Error Logs - Koabiga Admin" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Error Logs</h1>
                        <p className="text-gray-600 dark:text-gray-400">Monitor system errors and exceptions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Old
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
                            <FileText className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.total_errors}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today</CardTitle>
                            <Clock className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.errors_today}</div>
                            <p className="text-xs text-muted-foreground">Today's errors</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.errors_this_week}</div>
                            <p className="text-xs text-muted-foreground">Weekly errors</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.errors_this_month}</div>
                            <p className="text-xs text-muted-foreground">Monthly errors</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.unresolved_errors}</div>
                            <p className="text-xs text-muted-foreground">Pending resolution</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.total_errors - stats.unresolved_errors}</div>
                            <p className="text-xs text-muted-foreground">Fixed issues</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter error logs by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search error messages or files..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={levelFilter} onValueChange={setLevelFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="false">Unresolved</SelectItem>
                                    <SelectItem value="true">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Error Logs</CardTitle>
                        <CardDescription>System errors and exceptions with detailed information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Message</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                {errorLogs.length === 0 ? 'No error logs found.' : 'No logs match your filters.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                            {getLevelIcon(log.level)}
                                                        </div>
                                                        <div className="ml-3">
                                                            {getLevelBadge(log.level)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {log.message.length > 100 ? log.message.substring(0, 100) + '...' : log.message}
                                                    </div>
                                                </td>
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
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">System</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {log.file ? (
                                                        <div>
                                                            <div className="font-medium">{log.file.split('/').pop()}</div>
                                                            {log.line && <div className="text-xs">Line {log.line}</div>}
                                                        </div>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {log.resolved ? (
                                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Resolved
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Unresolved</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Button asChild variant="ghost" size="sm">
                                                            <Link href={`/koabiga/admin/error-logs/${log.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        {!log.resolved && (
                                                            <Button variant="ghost" size="sm">
                                                                <CheckSquare className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
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