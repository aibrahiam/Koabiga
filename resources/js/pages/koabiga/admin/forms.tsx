import { Head } from '@inertiajs/react';
import { 
    ClipboardList, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Eye,
    Download,
    Calendar,
    Users,
    FileText
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
        title: 'Forms Management',
        href: '/koabiga/admin/forms',
    },
];

export default function AdminForms() {
    // Mock data for demonstration
    const forms = [
        {
            id: 1,
            title: 'Land Allocation Request',
            type: 'request',
            category: 'land',
            status: 'active',
            submissions: 45,
            lastUpdated: '2024-06-25',
            createdBy: 'System Admin',
            description: 'Form for requesting new land allocation',
        },
        {
            id: 2,
            title: 'Crop Registration Form',
            type: 'registration',
            category: 'crop',
            status: 'active',
            submissions: 128,
            lastUpdated: '2024-06-24',
            createdBy: 'System Admin',
            description: 'Register new crops and their details',
        },
        {
            id: 3,
            title: 'Equipment Maintenance Report',
            type: 'report',
            category: 'equipment',
            status: 'draft',
            submissions: 0,
            lastUpdated: '2024-06-23',
            createdBy: 'Admin User',
            description: 'Report equipment maintenance activities',
        },
        {
            id: 4,
            title: 'Member Registration Form',
            type: 'registration',
            category: 'member',
            status: 'active',
            submissions: 89,
            lastUpdated: '2024-06-22',
            createdBy: 'System Admin',
            description: 'Register new platform members',
        },
        {
            id: 5,
            title: 'Harvest Report Form',
            type: 'report',
            category: 'harvest',
            status: 'active',
            submissions: 67,
            lastUpdated: '2024-06-21',
            createdBy: 'Admin User',
            description: 'Report harvest activities and yields',
        },
        {
            id: 6,
            title: 'Financial Statement Form',
            type: 'report',
            category: 'financial',
            status: 'inactive',
            submissions: 23,
            lastUpdated: '2024-06-20',
            createdBy: 'System Admin',
            description: 'Submit financial statements and reports',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
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
            case 'request':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Request</Badge>;
            case 'registration':
                return <Badge variant="outline" className="border-green-200 text-green-700">Registration</Badge>;
            case 'report':
                return <Badge variant="outline" className="border-orange-200 text-orange-700">Report</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'land':
                return <Badge variant="outline" className="border-purple-200 text-purple-700">Land</Badge>;
            case 'crop':
                return <Badge variant="outline" className="border-green-200 text-green-700">Crop</Badge>;
            case 'equipment':
                return <Badge variant="outline" className="border-gray-200 text-gray-700">Equipment</Badge>;
            case 'member':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Member</Badge>;
            case 'harvest':
                return <Badge variant="outline" className="border-orange-200 text-orange-700">Harvest</Badge>;
            case 'financial':
                return <Badge variant="outline" className="border-red-200 text-red-700">Financial</Badge>;
            default:
                return <Badge variant="outline">{category}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Forms Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forms Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Create and manage platform forms</p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Form
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                            <ClipboardList className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{forms.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Created forms
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {forms.filter(f => f.status === 'active').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {forms.reduce((sum, f) => sum + f.submissions, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft Forms</CardTitle>
                            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {forms.filter(f => f.status === 'draft').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                In development
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
                                        placeholder="Search forms..."
                                        className="pl-8"
                                    />
                                </div>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="request">Request</SelectItem>
                                        <SelectItem value="registration">Registration</SelectItem>
                                        <SelectItem value="report">Report</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select>
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

                {/* Forms Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Forms</CardTitle>
                        <CardDescription>Manage platform forms and their configurations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Form</th>
                                        <th className="text-left p-4 font-medium">Type</th>
                                        <th className="text-left p-4 font-medium">Category</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Submissions</th>
                                        <th className="text-left p-4 font-medium">Last Updated</th>
                                        <th className="text-left p-4 font-medium">Created By</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {forms.map((form) => (
                                        <tr key={form.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">{form.title}</div>
                                                    <div className="text-sm text-muted-foreground">{form.description}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getTypeBadge(form.type)}
                                            </td>
                                            <td className="p-4">
                                                {getCategoryBadge(form.category)}
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(form.status)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-medium">{form.submissions}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{form.lastUpdated}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{form.createdBy}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Users className="h-4 w-4" />
                                                    </Button>
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