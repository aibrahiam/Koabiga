import { Head, router } from '@inertiajs/react';
import { 
    BarChart3, 
    FileText, 
    Download, 
    Calendar,
    Users,
    TrendingUp,
    TrendingDown,
    Filter,
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    LoaderCircle,
    Building2,
    DollarSign,
    MapPin,
    Sprout,
    Package
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from '@/lib/axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/koabiga/admin/dashboard',
    },
    {
        title: 'Reports Management',
        href: '/koabiga/admin/admin-reports',
    },
];

interface Report {
    id: number;
    title: string;
    type: string;
    category: string;
    description: string;
    status: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    last_generated?: string;
    schedule?: string;
}

export default function AdminReports() {
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (categoryFilter !== 'all') params.append('category', categoryFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            // Fetch reports from API
            const response = await axios.get(`/api/admin/reports?${params}`);
            
            if (response.data.success) {
                setReports(response.data.data);
            } else {
                setError('Failed to fetch reports');
            }
        } catch (err: any) {
            console.error('Error fetching reports:', err);
            setError('Failed to fetch reports. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [searchTerm, typeFilter, categoryFilter, statusFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>;
            case 'inactive':
                return <Badge variant="outline">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'activity':
                return <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">Activity</Badge>;
            case 'financial':
                return <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">Financial</Badge>;
            case 'production':
                return <Badge variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">Production</Badge>;
            case 'performance':
                return <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">Performance</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'member':
                return <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">Member</Badge>;
            case 'financial':
                return <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">Financial</Badge>;
            case 'crop':
                return <Badge variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">Crop</Badge>;
            case 'unit':
                return <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">Unit</Badge>;
            default:
                return <Badge variant="outline">{category}</Badge>;
        }
    };

    const handleGenerateReport = async (reportId: number) => {
        try {
            setError(null);
            // Simulate report generation
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccess(`Report ${reportId} generated successfully!`);
        } catch (err) {
            setError('Failed to generate report. Please try again.');
        }
    };

    const handleScheduleReport = async (reportId: number) => {
        try {
            setError(null);
            // Simulate scheduling
            await new Promise(resolve => setTimeout(resolve, 500));
            setSuccess(`Report ${reportId} scheduled successfully!`);
        } catch (err) {
            setError('Failed to schedule report. Please try again.');
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            report.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || report.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        
        return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });

    const stats = {
        totalReports: reports.length,
        activeReports: reports.filter(r => r.status === 'active').length,
        draftReports: reports.filter(r => r.status === 'draft').length,
        scheduledReports: reports.filter(r => r.schedule).length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Generate and manage system reports</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={fetchReports} 
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button 
                            className="flex items-center gap-2"
                            onClick={() => router.visit('/koabiga/admin/admin-reports/generate-report')}
                        >
                            <Plus className="h-4 w-4" />
                            Create New Report
                        </Button>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                    </Alert>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading reports...</span>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalReports}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Created reports
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.activeReports}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Currently active
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Draft Reports</CardTitle>
                                    <FileText className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.draftReports}</div>
                                    <p className="text-xs text-muted-foreground">
                                        In development
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
                                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.scheduledReports}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Auto-generated
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-1 items-center space-x-2">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search reports..."
                                                className="pl-8"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="activity">Activity</SelectItem>
                                                <SelectItem value="financial">Financial</SelectItem>
                                                <SelectItem value="production">Production</SelectItem>
                                                <SelectItem value="performance">Performance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="financial">Financial</SelectItem>
                                                <SelectItem value="crop">Crop</SelectItem>
                                                <SelectItem value="unit">Unit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reports Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Reports</CardTitle>
                                <CardDescription>Manage and generate system reports</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-4 font-medium">Report</th>
                                                <th className="text-left p-4 font-medium">Type</th>
                                                <th className="text-left p-4 font-medium">Category</th>
                                                <th className="text-left p-4 font-medium">Status</th>
                                                <th className="text-left p-4 font-medium">Last Generated</th>
                                                <th className="text-left p-4 font-medium">Schedule</th>
                                                <th className="text-left p-4 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReports.map((report) => (
                                                <tr key={report.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-4">
                                                        <div>
                                                            <div className="font-medium">{report.title}</div>
                                                            <div className="text-sm text-muted-foreground">{report.description}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Created by {report.created_by}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {getTypeBadge(report.type)}
                                                    </td>
                                                    <td className="p-4">
                                                        {getCategoryBadge(report.category)}
                                                    </td>
                                                    <td className="p-4">
                                                        {getStatusBadge(report.status)}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm">
                                                            {report.last_generated 
                                                                ? new Date(report.last_generated).toLocaleDateString()
                                                                : 'Never'
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm">
                                                            {report.schedule ? report.schedule : 'Manual'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => handleGenerateReport(report.id)}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => handleScheduleReport(report.id)}
                                                            >
                                                                <Calendar className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => router.visit(`/koabiga/admin/admin-reports/${report.id}`)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => router.visit(`/koabiga/admin/admin-reports/${report.id}/edit`)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    
                                    {filteredReports.length === 0 && !loading && (
                                        <div className="text-center py-8">
                                            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">No reports found</p>
                                            <Button 
                                                onClick={() => router.visit('/koabiga/admin/admin-reports/generate-report')} 
                                                className="mt-4"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create First Report
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Common report-related tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Button variant="outline" className="justify-start">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        View Report History
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Manage Schedules
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export All Reports
                                    </Button>
                                    <Button variant="outline" className="justify-start">
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        View Analytics
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
} 