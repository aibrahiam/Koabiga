import { Head } from '@inertiajs/react';
import { 
    FileText, 
    Search, 
    Filter, 
    Download,
    Eye,
    Calendar,
    TrendingUp,
    BarChart3
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
        title: 'Reports',
        href: '/koabiga/admin/reports',
    },
];

export default function AdminReports() {
    // Mock data for demonstration
    const reports = [
        {
            id: 1,
            title: 'Monthly Production Report - Unit A',
            type: 'production',
            unit: 'Unit A',
            submittedBy: 'Sarah Smith',
            status: 'pending',
            submittedDate: '2024-06-25',
            priority: 'high',
        },
        {
            id: 2,
            title: 'Land Utilization Report - Unit B',
            type: 'land',
            unit: 'Unit B',
            submittedBy: 'David Wilson',
            status: 'approved',
            submittedDate: '2024-06-24',
            priority: 'medium',
        },
        {
            id: 3,
            title: 'Crop Health Assessment - Unit C',
            type: 'crop',
            unit: 'Unit C',
            submittedBy: 'Emily Davis',
            status: 'rejected',
            submittedDate: '2024-06-23',
            priority: 'high',
        },
        {
            id: 4,
            title: 'Financial Summary - Unit A',
            type: 'financial',
            unit: 'Unit A',
            submittedBy: 'John Doe',
            status: 'pending',
            submittedDate: '2024-06-22',
            priority: 'low',
        },
        {
            id: 5,
            title: 'Equipment Maintenance Report - Unit D',
            type: 'equipment',
            unit: 'Unit D',
            submittedBy: 'Mike Johnson',
            status: 'approved',
            submittedDate: '2024-06-21',
            priority: 'medium',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'approved':
                return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'production':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Production</Badge>;
            case 'land':
                return <Badge variant="outline" className="border-green-200 text-green-700">Land</Badge>;
            case 'crop':
                return <Badge variant="outline" className="border-orange-200 text-orange-700">Crop</Badge>;
            case 'financial':
                return <Badge variant="outline" className="border-purple-200 text-purple-700">Financial</Badge>;
            case 'equipment':
                return <Badge variant="outline" className="border-gray-200 text-gray-700">Equipment</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge variant="destructive">High</Badge>;
            case 'medium':
                return <Badge variant="default" className="bg-orange-100 text-orange-800">Medium</Badge>;
            case 'low':
                return <Badge variant="secondary">Low</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Review and manage submitted reports</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                        <Button>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Generate Report
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.length}</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {reports.filter(r => r.status === 'pending').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {reports.filter(r => r.status === 'approved').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {reports.filter(r => r.status === 'rejected').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Needs revision
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-1 items-center space-x-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search reports..."
                                        className="pl-8"
                                    />
                                </div>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="production">Production</SelectItem>
                                        <SelectItem value="land">Land</SelectItem>
                                        <SelectItem value="crop">Crop</SelectItem>
                                        <SelectItem value="financial">Financial</SelectItem>
                                        <SelectItem value="equipment">Equipment</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
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
                        <CardDescription>Review and manage submitted reports from all units</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Report</th>
                                        <th className="text-left p-4 font-medium">Type</th>
                                        <th className="text-left p-4 font-medium">Unit</th>
                                        <th className="text-left p-4 font-medium">Submitted By</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Priority</th>
                                        <th className="text-left p-4 font-medium">Date</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="p-4">
                                                <div className="font-medium">{report.title}</div>
                                            </td>
                                            <td className="p-4">
                                                {getTypeBadge(report.type)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{report.unit}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{report.submittedBy}</span>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(report.status)}
                                            </td>
                                            <td className="p-4">
                                                {getPriorityBadge(report.priority)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{report.submittedDate}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    {report.status === 'pending' && (
                                                        <>
                                                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                                                Approve
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
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