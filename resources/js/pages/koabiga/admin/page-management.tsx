import { Head } from '@inertiajs/react';
import { 
    FileText, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Users,
    Building2,
    Settings,
    Save,
    X
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/koabiga/admin/dashboard',
    },
    {
        title: 'Page Management',
        href: '/koabiga/admin/page-management',
    },
];

export default function AdminPageManagement() {
    const [editingPage, setEditingPage] = useState<any>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Mock data for demonstration
    const pages = [
        {
            id: 1,
            title: 'Unit Leader Dashboard',
            path: '/koabiga/unit-leader/dashboard',
            role: 'unit_leader',
            status: 'active',
            lastModified: '2024-06-25',
            description: 'Main dashboard for unit leaders to manage their agricultural units',
            features: ['Member management', 'Land tracking', 'Crop monitoring', 'Reports'],
            createdBy: 'System Admin',
        },
        {
            id: 2,
            title: 'Unit Leader Members',
            path: '/koabiga/unit-leader/members',
            role: 'unit_leader',
            status: 'active',
            lastModified: '2024-06-24',
            description: 'Manage unit members and their activities',
            features: ['Member list', 'Activity tracking', 'Performance metrics'],
            createdBy: 'Admin User',
        },
        {
            id: 3,
            title: 'Member Dashboard',
            path: '/koabiga/member/dashboard',
            role: 'member',
            status: 'active',
            lastModified: '2024-06-23',
            description: 'Personal dashboard for individual members',
            features: ['Personal stats', 'Task tracking', 'Crop progress'],
            createdBy: 'System Admin',
        },
        {
            id: 4,
            title: 'Member Land',
            path: '/koabiga/member/land',
            role: 'member',
            status: 'active',
            lastModified: '2024-06-22',
            description: 'Manage assigned land plots and their status',
            features: ['Land overview', 'Maintenance tracking', 'Area management'],
            createdBy: 'Admin User',
        },
        {
            id: 5,
            title: 'Member Crops',
            path: '/koabiga/member/crops',
            role: 'member',
            status: 'draft',
            lastModified: '2024-06-21',
            description: 'Track crop progress and health',
            features: ['Crop monitoring', 'Health tracking', 'Harvest planning'],
            createdBy: 'System Admin',
        },
        {
            id: 6,
            title: 'Member Produce',
            path: '/koabiga/member/produce',
            role: 'member',
            status: 'inactive',
            lastModified: '2024-06-20',
            description: 'Monitor produce output and sales',
            features: ['Production tracking', 'Sales monitoring', 'Inventory'],
            createdBy: 'Admin User',
        },
        {
            id: 7,
            title: 'Member Reports',
            path: '/koabiga/member/reports',
            role: 'member',
            status: 'active',
            lastModified: '2024-06-19',
            description: 'Submit and view personal reports',
            features: ['Report submission', 'History view', 'Status tracking'],
            createdBy: 'System Admin',
        },
        {
            id: 8,
            title: 'Member Forms',
            path: '/koabiga/member/forms',
            role: 'member',
            status: 'active',
            lastModified: '2024-06-18',
            description: 'Access and submit various forms',
            features: ['Form access', 'Submission tracking', 'Status updates'],
            createdBy: 'Admin User',
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

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'unit_leader':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Unit Leader</Badge>;
            case 'member':
                return <Badge variant="outline" className="border-green-200 text-green-700">Member</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const handleEditPage = (page: any) => {
        setEditingPage({ ...page });
        setIsEditDialogOpen(true);
    };

    const handleSavePage = () => {
        // Here you would save the changes to the backend
        console.log('Saving page:', editingPage);
        setIsEditDialogOpen(false);
        setEditingPage(null);
    };

    const handleDeletePage = (pageId: number) => {
        // Here you would delete the page from the backend
        console.log('Deleting page:', pageId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Page Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Page Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage pages for different user roles</p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Page
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pages.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Managed pages
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Pages</CardTitle>
                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pages.filter(p => p.status === 'active').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unit Leader Pages</CardTitle>
                            <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pages.filter(p => p.role === 'unit_leader').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Unit leader pages
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Member Pages</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pages.filter(p => p.role === 'member').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Member pages
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
                                        placeholder="Search pages..."
                                        className="pl-8"
                                    />
                                </div>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
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

                {/* Pages Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Pages</CardTitle>
                        <CardDescription>Manage pages for different user roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Page</th>
                                        <th className="text-left p-4 font-medium">Role</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Last Modified</th>
                                        <th className="text-left p-4 font-medium">Created By</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map((page) => (
                                        <tr key={page.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">{page.title}</div>
                                                    <div className="text-sm text-muted-foreground">{page.path}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">{page.description}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getRoleBadge(page.role)}
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(page.status)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{page.lastModified}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{page.createdBy}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleEditPage(page)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeletePage(page.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

                {/* Edit Page Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Page</DialogTitle>
                            <DialogDescription>
                                Modify page settings and configuration
                            </DialogDescription>
                        </DialogHeader>
                        {editingPage && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Page Title</Label>
                                        <Input
                                            id="title"
                                            value={editingPage.title}
                                            onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="path">Page Path</Label>
                                        <Input
                                            id="path"
                                            value={editingPage.path}
                                            onChange={(e) => setEditingPage({...editingPage, path: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select 
                                            value={editingPage.role} 
                                            onValueChange={(value) => setEditingPage({...editingPage, role: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select 
                                            value={editingPage.status} 
                                            onValueChange={(value) => setEditingPage({...editingPage, status: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={editingPage.description}
                                        onChange={(e) => setEditingPage({...editingPage, description: e.target.value})}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSavePage}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
} 