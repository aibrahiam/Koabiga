import { Head, router } from '@inertiajs/react';
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
    X,
    LoaderCircle,
    AlertTriangle,
    CheckCircle,
    User,
    Phone,
    Mail,
    MapPin,
    Shield,
    Activity,
    RefreshCw,
    ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface User {
    id: number;
    christian_name: string;
    family_name: string;
    id_passport?: string;
    phone: string;
    role: string;
    status: string;
    join_date: string;
    unit?: string;
    zone?: string;
    unit_id?: number | null;
    zone_id?: number | null;
}

interface Page {
    id: number;
    title: string;
    path: string;
    role: string;
    status: string;
    lastModified: string;
    description: string;
    createdBy: string;
    icon?: string;
    sort_order: number;
    is_public: boolean;
    features?: string[];
}

interface PageManagementProps {
    pages: Page[];
    users: User[];
    units: any[];
    zones: any[];
    pageStats: {
        admin: any;
        unit_leader: any;
        member: any;
        overall: any;
    };
}

export default function AdminPageManagement({ pages: initialPages, users: initialUsers, units, zones, pageStats }: PageManagementProps) {
    // Page Management State
    const [pages, setPages] = useState<Page[]>(initialPages);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // User Management State
    const [usersLoading, setUsersLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isUserEditDialogOpen, setIsUserEditDialogOpen] = useState(false);
    const [savingUser, setSavingUser] = useState(false);

    // Filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // User filters
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');

    // Real-time updates
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    // Filter pages based on search and filters
    const filteredPages = pages.filter(page => {
        const matchesSearch = !searchTerm || 
            page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
            page.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'all' || page.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Filter users based on search and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch = !userSearchTerm || 
            user.christian_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.family_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.phone.includes(userSearchTerm) ||
            (user.id_passport && user.id_passport.includes(userSearchTerm));
        
        const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
        const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Real-time data sync
    const syncData = async () => {
        try {
            setLoading(true);
            // Refresh the page to get updated data
            router.reload();
            setLastUpdate(new Date());
        } catch (err: any) {
            console.error('Error syncing data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh every 30 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(syncData, 30000);
        return () => clearInterval(interval);
    }, []);

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

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'unit_leader':
                return <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">Unit Leader</Badge>;
            case 'member':
                return <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">Member</Badge>;
            case 'admin':
                return <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">Admin</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const getUserStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
            case 'inactive':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Page Management Functions
    const handleCreatePage = () => {
        setEditingPage({
            id: 0,
            title: '',
            path: '',
            role: 'member',
            status: 'active',
            description: '',
            features: [],
            icon: '',
            sort_order: 0,
            is_public: false,
            lastModified: '',
            createdBy: ''
        });
        setIsCreateDialogOpen(true);
    };

    const handleDeletePage = (page: Page) => {
        setPageToDelete(page);
        setIsDeleteDialogOpen(true);
    };

    const handleSavePage = async () => {
        try {
            setSaving(true);
            setError(null);

            if (editingPage?.id) {
                // Update existing page
                await router.put(`/koabiga/admin/pages/${editingPage.id}`, editingPage, {
                    onSuccess: () => {
                        setSuccess('Page updated successfully');
                        setIsCreateDialogOpen(false);
                        setEditingPage(null);
                        router.reload();
                    },
                    onError: (errors) => {
                        setError('Failed to update page');
                        console.error('Validation errors:', errors);
                    }
                });
            } else {
                // Create new page
                await router.post('/koabiga/admin/pages', editingPage, {
                    onSuccess: () => {
                        setSuccess('Page created successfully');
                        setIsCreateDialogOpen(false);
                        setEditingPage(null);
                        router.reload();
                    },
                    onError: (errors) => {
                        setError('Failed to create page');
                        console.error('Validation errors:', errors);
                    }
                });
            }
        } catch (err: any) {
            console.error('Error saving page:', err);
            setError('Failed to save page. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleting(true);
            setError(null);

            await router.delete(`/koabiga/admin/pages/${pageToDelete?.id}`, {
                onSuccess: () => {
                    setSuccess('Page deleted successfully');
                    setIsDeleteDialogOpen(false);
                    setPageToDelete(null);
                    router.reload();
                },
                onError: (errors) => {
                    setError('Failed to delete page');
                    console.error('Validation errors:', errors);
                }
            });
        } catch (err: any) {
            console.error('Error deleting page:', err);
            setError('Failed to delete page. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    // User Management Functions
    const handleEditUser = (user: User) => {
        setEditingUser({ ...user });
        setIsUserEditDialogOpen(true);
    };

    const handleSaveUser = async () => {
        try {
            setSavingUser(true);
            setError(null);

            if (editingUser) {
                await router.put(`/koabiga/admin/members/${editingUser.id}`, editingUser, {
                    onSuccess: () => {
                        setSuccess('User updated successfully');
                        setIsUserEditDialogOpen(false);
                        setEditingUser(null);
                        router.reload();
                    },
                    onError: (errors) => {
                        setError('Failed to update user');
                        console.error('Validation errors:', errors);
                    }
                });
            }
        } catch (err: any) {
            console.error('Error saving user:', err);
            setError('Failed to save user. Please try again.');
        } finally {
            setSavingUser(false);
        }
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Page Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage pages and users for the platform</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={syncData} className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        <span className="text-xs text-gray-500">
                            Last updated: {lastUpdate.toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            {success}
                        </AlertDescription>
                        <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
                            <X className="h-4 w-4" />
                        </Button>
                    </Alert>
                )}

                {error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                            {error}
                        </AlertDescription>
                        <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
                            <X className="h-4 w-4" />
                        </Button>
                    </Alert>
                )}

                {/* Tabs */}
                <Tabs defaultValue="pages" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pages" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Pages ({filteredPages.length})
                        </TabsTrigger>
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Users ({filteredUsers.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Pages Tab */}
                    <TabsContent value="pages" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pageStats.overall.total}</div>
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
                                    <div className="text-2xl font-bold">{pageStats.overall.active}</div>
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
                                    <div className="text-2xl font-bold">{pageStats.unit_leader.total}</div>
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
                                    <div className="text-2xl font-bold">{pageStats.member.total}</div>
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
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Roles</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
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
                                    <Button onClick={handleCreatePage} className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create New Page
                                    </Button>
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
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
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
                                                {filteredPages.map((page) => (
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
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => router.visit(`/koabiga/admin/pages/${page.id}/edit`)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => router.visit(page.path)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    className="text-red-600 hover:text-red-700"
                                                                    onClick={() => handleDeletePage(page)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        {filteredPages.length === 0 && (
                                            <div className="text-center py-8">
                                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500">No pages found</p>
                                                <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                        {/* User Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{filteredUsers.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        All users
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                    <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {filteredUsers.filter(u => u.status === 'active').length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Currently active
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Unit Leaders</CardTitle>
                                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {filteredUsers.filter(u => u.role === 'unit_leader').length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Unit leaders
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Members</CardTitle>
                                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {filteredUsers.filter(u => u.role === 'member').length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Regular members
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User Filters */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-1 items-center space-x-2">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search users..."
                                                className="pl-8"
                                                value={userSearchTerm}
                                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Roles</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Users Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Users</CardTitle>
                                <CardDescription>Manage all users in the system</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {usersLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-4 font-medium">User</th>
                                                    <th className="text-left p-4 font-medium">Contact</th>
                                                    <th className="text-left p-4 font-medium">Role</th>
                                                    <th className="text-left p-4 font-medium">Status</th>
                                                    <th className="text-left p-4 font-medium">Location</th>
                                                    <th className="text-left p-4 font-medium">Join Date</th>
                                                    <th className="text-left p-4 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map((user) => (
                                                    <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-4">
                                                            <div>
                                                                <div className="font-medium">
                                                                    {user.christian_name} {user.family_name}
                                                                </div>
                                                                {user.id_passport && (
                                                                    <div className="text-sm text-muted-foreground">
                                                                        ID: {user.id_passport}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm">{user.phone}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            {getRoleBadge(user.role)}
                                                        </td>
                                                        <td className="p-4">
                                                            {getUserStatusBadge(user.status)}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-sm">
                                                                {user.unit && <div>Unit: {user.unit}</div>}
                                                                {user.zone && <div>Zone: {user.zone}</div>}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-sm">
                                                                {new Date(user.join_date).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => handleEditUser(user)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => router.visit(`/koabiga/admin/members/${user.id}/edit`)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        {filteredUsers.length === 0 && (
                                            <div className="text-center py-8">
                                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500">No users found</p>
                                                <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Create Page Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Page</DialogTitle>
                            <DialogDescription>
                                Create a new page for users
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
                                                <SelectItem value="admin">Admin</SelectItem>
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
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_public"
                                        checked={editingPage.is_public}
                                        onCheckedChange={(checked) => setEditingPage({...editingPage, is_public: checked})}
                                    />
                                    <Label htmlFor="is_public">Public Page</Label>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSavePage} disabled={saving}>
                                        {saving ? (
                                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Create Page
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={isUserEditDialogOpen} onOpenChange={setIsUserEditDialogOpen}>
                    <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Update user information
                            </DialogDescription>
                        </DialogHeader>
                        {editingUser && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="christian_name">Christian Name</Label>
                                        <Input
                                            id="christian_name"
                                            value={editingUser.christian_name}
                                            onChange={(e) => setEditingUser({...editingUser, christian_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="family_name">Family Name</Label>
                                        <Input
                                            id="family_name"
                                            value={editingUser.family_name}
                                            onChange={(e) => setEditingUser({...editingUser, family_name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={editingUser.phone}
                                            onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="id_passport">ID/Passport</Label>
                                        <Input
                                            id="id_passport"
                                            value={editingUser.id_passport || ''}
                                            onChange={(e) => setEditingUser({...editingUser, id_passport: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select 
                                            value={editingUser.role} 
                                            onValueChange={(value) => setEditingUser({...editingUser, role: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select 
                                            value={editingUser.status} 
                                            onValueChange={(value) => setEditingUser({...editingUser, status: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="zone_id">Zone</Label>
                                        <Select 
                                            value={editingUser.zone_id?.toString() || 'none'} 
                                            onValueChange={(value) => setEditingUser({...editingUser, zone_id: value === 'none' ? null : parseInt(value)})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Zone</SelectItem>
                                                {zones.map((zone) => (
                                                    <SelectItem key={zone.id} value={zone.id.toString()}>
                                                        {zone.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="unit_id">Unit</Label>
                                        <Select 
                                            value={editingUser.unit_id?.toString() || 'none'} 
                                            onValueChange={(value) => setEditingUser({...editingUser, unit_id: value === 'none' ? null : parseInt(value)})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Unit</SelectItem>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                                        {unit.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsUserEditDialogOpen(false)}>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveUser} disabled={savingUser}>
                                        {savingUser ? (
                                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="w-[90vw] max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-red-800 dark:text-red-200">Delete Page</DialogTitle>
                            <DialogDescription className="text-red-600 dark:text-red-400">
                                Are you sure you want to delete "{pageToDelete?.title}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Delete Page
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
} 