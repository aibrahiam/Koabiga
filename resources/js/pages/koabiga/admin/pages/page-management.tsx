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
    RefreshCw
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
    unit_id?: number;
    zone_id?: number;
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
}

export default function AdminPageManagement() {
    // Page Management State
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // User Management State
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isUserEditDialogOpen, setIsUserEditDialogOpen] = useState(false);
    const [savingUser, setSavingUser] = useState(false);
    const [units, setUnits] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);

    // Filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // User filters
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [userTotalItems, setUserTotalItems] = useState(0);

    // Real-time updates
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    // Fetch pages
    const fetchPages = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching pages with params:', {
                page,
                searchTerm,
                roleFilter,
                statusFilter
            });
            
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: '15',
                search: searchTerm,
                role: roleFilter,
                status: statusFilter,
                sort_by: 'sort_order',
                sort_order: 'asc'
            });
            
            console.log('Making API call to:', `/api/admin/pages?${params}`);
            
            const response = await axios.get(`/api/admin/pages?${params}`);
            
            console.log('Pages API response:', response.data);
            
            if (response.data.success) {
                setPages(response.data.data.data || []);
                setCurrentPage(response.data.data.current_page);
                setTotalPages(response.data.data.last_page);
                setTotalItems(response.data.data.total);
                console.log('Pages loaded successfully:', response.data.data.data?.length || 0, 'pages');
            } else {
                console.error('API returned error:', response.data.message);
                setError(response.data.message || 'Failed to fetch pages');
            }
        } catch (err: any) {
            console.error('Error fetching pages:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            if (err.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            } else if (err.response?.status === 403) {
                setError('Access denied. You do not have permission to view pages.');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Failed to load pages. Please try again.');
            }
            setPages([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch users
    const fetchUsers = async (page = 1) => {
        try {
            setUsersLoading(true);
            
            console.log('Fetching users with params:', {
                page,
                userSearchTerm,
                userRoleFilter,
                userStatusFilter
            });
            
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: '15',
                search: userSearchTerm,
                role: userRoleFilter,
                status: userStatusFilter,
                sort_by: 'name',
                sort_order: 'asc'
            });
            
            console.log('Making API call to:', `/api/admin/members?${params}`);
            
            const response = await axios.get(`/api/admin/members?${params}`);
            
            console.log('Users API response:', response.data);
            
            if (response.data.success) {
                setUsers(response.data.data.data || []);
                setUserCurrentPage(response.data.data.current_page);
                setUserTotalPages(response.data.data.last_page);
                setUserTotalItems(response.data.data.total);
                console.log('Users loaded successfully:', response.data.data.data?.length || 0, 'users');
            } else {
                console.error('API returned error:', response.data.message);
                setError(response.data.message || 'Failed to fetch users');
            }
        } catch (err: any) {
            console.error('Error fetching users:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            if (err.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            } else if (err.response?.status === 403) {
                setError('Access denied. You do not have permission to view users.');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Failed to load users. Please try again.');
            }
            setUsers([]);
        } finally {
            setUsersLoading(false);
        }
    };

    // Fetch units and zones for user editing
    const fetchUnitsAndZones = async () => {
        try {
            console.log('Fetching units and zones...');
            
            const [unitsResponse, zonesResponse] = await Promise.all([
                axios.get('/api/admin/units'),
                axios.get('/api/admin/zones')
            ]);
            
            console.log('Units response:', unitsResponse.data);
            console.log('Zones response:', zonesResponse.data);
            
            if (unitsResponse.data.success) {
                setUnits(unitsResponse.data.data || []);
                console.log('Units loaded:', unitsResponse.data.data?.length || 0);
            }
            
            if (zonesResponse.data.success) {
                setZones(zonesResponse.data.data || []);
                console.log('Zones loaded:', zonesResponse.data.data?.length || 0);
            }
        } catch (err) {
            console.error('Error fetching units and zones:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
        }
    };

    // Real-time data sync
    const syncData = async () => {
        await Promise.all([fetchPages(currentPage), fetchUsers(userCurrentPage)]);
        setLastUpdate(new Date());
    };

    useEffect(() => {
        // Test authentication first
        const testAuth = async () => {
            try {
                console.log('Testing authentication...');
                const authResponse = await axios.get('/api/debug-admin');
                console.log('Auth test response:', authResponse.data);
            } catch (err: any) {
                console.error('Auth test failed:', err.response?.data);
                console.error('Auth test status:', err.response?.status);
            }
        };
        
        testAuth();
        fetchPages();
        fetchUsers();
        fetchUnitsAndZones();
    }, []);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchPages(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, roleFilter, statusFilter]);

    useEffect(() => {
        // Debounce user search
        const timeoutId = setTimeout(() => {
            fetchUsers(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [userSearchTerm, userRoleFilter, userStatusFilter]);

    // Auto-refresh every 30 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(syncData, 30000);
        return () => clearInterval(interval);
    }, [currentPage, userCurrentPage]);

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
                const response = await axios.put(`/api/admin/pages/${editingPage.id}`, editingPage);
                if (response.data.success) {
                    setSuccess('Page updated successfully');
                    setIsCreateDialogOpen(false);
                    setEditingPage(null);
                    fetchPages(currentPage);
                } else {
                    setError(response.data.message || 'Failed to update page');
                }
            } else {
                // Create new page
                const response = await axios.post('/api/admin/pages', editingPage);
                if (response.data.success) {
                    setSuccess('Page created successfully');
                    setIsCreateDialogOpen(false);
                    setEditingPage(null);
                    fetchPages(1);
                } else {
                    setError(response.data.message || 'Failed to create page');
                }
            }
        } catch (err: any) {
            console.error('Error saving page:', err);
            setError(err.response?.data?.message || 'Failed to save page. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleting(true);
            setError(null);

            const response = await axios.delete(`/api/admin/pages/${pageToDelete?.id}`);
            if (response.data.success) {
                setSuccess('Page deleted successfully');
                setIsDeleteDialogOpen(false);
                setPageToDelete(null);
                fetchPages(currentPage);
            } else {
                setError(response.data.message || 'Failed to delete page');
            }
        } catch (err: any) {
            console.error('Error deleting page:', err);
            setError(err.response?.data?.message || 'Failed to delete page. Please try again.');
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
                const response = await axios.put(`/api/admin/members/${editingUser.id}`, editingUser);
                if (response.data.success) {
                    setSuccess('User updated successfully');
                    setIsUserEditDialogOpen(false);
                    setEditingUser(null);
                    fetchUsers(userCurrentPage);
                } else {
                    setError(response.data.message || 'Failed to update user');
                }
            }
        } catch (err: any) {
            console.error('Error saving user:', err);
            setError(err.response?.data?.message || 'Failed to save user. Please try again.');
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



                {/* Tabs */}
                <Tabs defaultValue="pages" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pages" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Pages ({totalItems})
                        </TabsTrigger>
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Users ({userTotalItems})
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
                                    <div className="text-2xl font-bold">{totalItems}</div>
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
                                        
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="text-sm text-muted-foreground">
                                                    Showing {((currentPage - 1) * 15) + 1} to {Math.min(currentPage * 15, totalItems)} of {totalItems} results
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={currentPage === 1}
                                                        onClick={() => fetchPages(currentPage - 1)}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <span className="text-sm">
                                                        Page {currentPage} of {totalPages}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={currentPage === totalPages}
                                                        onClick={() => fetchPages(currentPage + 1)}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
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
                                    <div className="text-2xl font-bold">{userTotalItems}</div>
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
                                        {users.filter(u => u.status === 'active').length}
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
                                        {users.filter(u => u.role === 'unit_leader').length}
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
                                        {users.filter(u => u.role === 'member').length}
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
                                                {users.map((user) => (
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
                                        
                                        {/* User Pagination */}
                                        {userTotalPages > 1 && (
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="text-sm text-muted-foreground">
                                                    Showing {((userCurrentPage - 1) * 15) + 1} to {Math.min(userCurrentPage * 15, userTotalItems)} of {userTotalItems} results
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={userCurrentPage === 1}
                                                        onClick={() => fetchUsers(userCurrentPage - 1)}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <span className="text-sm">
                                                        Page {userCurrentPage} of {userTotalPages}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={userCurrentPage === userTotalPages}
                                                        onClick={() => fetchUsers(userCurrentPage + 1)}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
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