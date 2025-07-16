import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit, 
    Trash2, 
    Eye, 
    Users, 
    MapPin, 
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    X,
    RefreshCw,
    Building2,
    Activity,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';

interface Zone {
    id: number;
    name: string;
    code: string;
    leader: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    member_count: number;
    unit_count: number;
    status: 'active' | 'inactive' | 'pending';
    created_at: string;
    updated_at: string;
    description?: string;
    location?: string;
    performance_score?: number;
    last_activity?: string;
}

interface ZoneStats {
    total_zones: number;
    active_zones: number;
    inactive_zones: number;
    total_members: number;
    total_units: number;
    average_performance: number;
}

interface ZoneManagementProps {
    zones: Zone[];
    stats: ZoneStats;
    filters: {
        status: string;
        search: string;
        leader?: string;
    };
}

export default function ZoneManagement({ zones: initialZones, stats: initialStats, filters }: ZoneManagementProps) {
    const [zones, setZones] = useState<Zone[]>(initialZones || []);
    const [stats, setStats] = useState<ZoneStats>(initialStats || {
        total_zones: 0,
        active_zones: 0,
        inactive_zones: 0,
        total_members: 0,
        total_units: 0,
        average_performance: 0
    });
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [leaderFilter, setLeaderFilter] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Get unique leaders for filter
    const uniqueLeaders = Array.from(new Set(
        zones
            .filter(zone => zone && zone.id)
            .map(zone => zone.leader?.name || 'No Leader')
            .filter(Boolean)
    ));

    const filteredZones = zones.filter(zone => {
        if (!zone || !zone.id) return false;
        
        const matchesSearch = (zone.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (zone.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (zone.leader?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (zone.location || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || statusFilter === 'all' || zone.status === statusFilter;
        const matchesLeader = !leaderFilter || leaderFilter === 'all' || zone.leader?.name === leaderFilter;
        return matchesSearch && matchesStatus && matchesLeader;
    });

    const handleSearch = () => {
        router.get('/koabiga/admin/zones', {
            search: searchTerm,
            status: statusFilter,
            leader: leaderFilter
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setLeaderFilter('');
        setError(null);
        setSuccessMessage(null);
        router.get('/koabiga/admin/zones', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleDeleteZone = (zone: Zone) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        router.delete(`/koabiga/admin/zones/${zone.id}`, {
            onSuccess: () => {
                setIsLoading(false);
                try {
                    // Update local state immediately
                    setZones(prevZones => prevZones.filter(z => z && z.id !== zone.id));
                    
                    // Update stats safely
                    setStats(prevStats => {
                        const newStats = { ...prevStats };
                        newStats.total_zones = Math.max(0, prevStats.total_zones - 1);
                        
                        if (zone.status === 'active') {
                            newStats.active_zones = Math.max(0, prevStats.active_zones - 1);
                        } else if (zone.status === 'inactive') {
                            newStats.inactive_zones = Math.max(0, prevStats.inactive_zones - 1);
                        }
                        
                        newStats.total_members = Math.max(0, prevStats.total_members - (zone.member_count || 0));
                        newStats.total_units = Math.max(0, prevStats.total_units - (zone.unit_count || 0));
                        
                        return newStats;
                    });
                    
                    // Show success message
                    setSuccessMessage(`Zone "${zone.name || 'Zone'}" deleted successfully`);
                    
                    // Clear success message after 3 seconds
                    setTimeout(() => setSuccessMessage(null), 3000);
                } catch (error) {
                    console.error('Error updating local state after deletion:', error);
                    // If local state update fails, refresh the page to get fresh data
                    router.visit('/koabiga/admin/zones', { preserveScroll: true });
                }
            },
            onError: (errors) => {
                setIsLoading(false);
                setError('Failed to delete zone. Please try again.');
                console.error('Error deleting zone:', errors);
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'inactive': return <X className="w-4 h-4" />;
            case 'pending': return <AlertCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/koabiga/admin' },
            { title: 'Zone Management', href: '/koabiga/admin/zones' }
        ]}>
            <Head title="Zone Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                            <p className="text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                            <p className="text-green-800">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">Loading zones...</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Zone Management</h1>
                        <p className="text-green-600 dark:text-green-300">
                            Manage zones, leaders, and member distribution across the platform
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Admin
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsLoading(true);
                                router.visit('/koabiga/admin/zones', { 
                                    preserveScroll: true,
                                    onFinish: () => setIsLoading(false)
                                });
                            }}
                            disabled={isLoading}
                            className="border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => router.visit('/koabiga/admin/zones/create')}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Zone
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Zones</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.total_zones}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                {stats.active_zones} active zones
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Zones</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.active_zones}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                {stats.inactive_zones} inactive zones
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.total_members}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                {stats.total_units} total units
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Avg Performance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.average_performance}%</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Average zone performance
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">Quick Actions</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div 
                            className="cursor-pointer"
                            onClick={() => router.visit('/koabiga/admin/zones/create')}
                        >
                            <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700">
                                <CardHeader className="pb-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-600 dark:bg-green-500 flex items-center justify-center">
                                        <Plus className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-sm text-green-700 dark:text-green-300">Create Zone</CardTitle>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Add a new agricultural zone</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div 
                            className="cursor-pointer"
                            onClick={() => router.visit('/koabiga/admin/units')}
                        >
                            <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700">
                                <CardHeader className="pb-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-sm text-green-700 dark:text-green-300">Manage Units</CardTitle>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">View and manage units</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div 
                            className="cursor-pointer"
                            onClick={() => router.visit('/koabiga/admin/members')}
                        >
                            <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700">
                                <CardHeader className="pb-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-sm text-green-700 dark:text-green-300">Manage Members</CardTitle>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">View and manage members</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div 
                            className="cursor-pointer"
                            onClick={() => router.visit('/koabiga/admin/reports')}
                        >
                            <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700">
                                <CardHeader className="pb-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-600 dark:bg-orange-500 flex items-center justify-center">
                                        <Activity className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-sm text-green-700 dark:text-green-300">View Reports</CardTitle>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Generate zone reports</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-green-200 dark:border-green-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <Filter className="h-5 w-5" />
                            Search & Filter Zones
                        </CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-400">
                            Find specific zones by name, code, leader, or location
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                            <div className="flex-1 w-full lg:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search zones, codes, leaders, or locations..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            // Clear messages when user starts typing
                                            setError(null);
                                            setSuccessMessage(null);
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10 border-green-200 dark:border-green-800 focus:border-green-300 dark:focus:border-green-700"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40 border-green-200 dark:border-green-800">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={leaderFilter} onValueChange={setLeaderFilter}>
                                    <SelectTrigger className="w-48 border-green-200 dark:border-green-800">
                                        <SelectValue placeholder="Select Leader" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Leaders</SelectItem>
                                        {uniqueLeaders
                                            .filter(leader => leader && leader.trim() !== '')
                                            .map((leader) => (
                                            <SelectItem key={leader} value={leader}>
                                                {leader}
                                            </SelectItem>
                                        ))}
                                        {uniqueLeaders.filter(leader => leader && leader.trim() !== '').length === 0 && (
                                            <SelectItem value="none" disabled>
                                                No leaders available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>

                                <Button 
                                    variant="outline" 
                                    onClick={handleSearch}
                                    className="border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>

                                {(searchTerm || statusFilter || leaderFilter) && (
                                    <Button 
                                        variant="ghost" 
                                        onClick={handleClearFilters}
                                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* View Mode Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={viewMode === 'grid' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700'}
                        >
                            Grid
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700'}
                        >
                            List
                        </Button>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                        {filteredZones.length} zone{filteredZones.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {/* Zones Display */}
                {!isLoading && viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredZones.map((zone) => (
                            zone && (
                            <Card key={zone.id} className="hover:shadow-lg transition-all duration-200 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg flex items-center space-x-2 text-green-800 dark:text-green-200">
                                                <span>{zone.name || 'Unnamed Zone'}</span>
                                                <Badge variant="outline" className="text-xs border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                                                    {zone.code || 'N/A'}
                                                </Badge>
                                            </CardTitle>
                                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                                {zone.location || 'Location not specified'}
                                            </p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}`)}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}/edit`)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Zone
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete Zone
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Zone</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{zone.name}"? This action cannot be undone and will remove all associated data.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteZone(zone)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(zone.status)}
                                            <Badge className={getStatusColor(zone.status)}>
                                                {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-green-600 dark:text-green-400">Performance</p>
                                            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                                                {zone.performance_score || 0}%
                                            </p>
                                        </div>
                                    </div>

                                    <Separator className="bg-green-200 dark:bg-green-800" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-green-600 dark:text-green-400">Leader</p>
                                            <p className="font-medium text-green-800 dark:text-green-200">
                                                {zone.leader?.name || 'No Leader Assigned'}
                                            </p>
                                            <p className="text-xs text-green-500 dark:text-green-400">
                                                {zone.leader?.email || 'No email'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-600 dark:text-green-400">Members</p>
                                            <p className="font-medium text-green-800 dark:text-green-200">
                                                {zone.member_count || 0}
                                            </p>
                                            <p className="text-xs text-green-500 dark:text-green-400">
                                                {zone.unit_count || 0} units
                                            </p>
                                        </div>
                                    </div>

                                    {zone.description && (
                                        <>
                                            <Separator className="bg-green-200 dark:bg-green-800" />
                                            <div>
                                                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Description</p>
                                                <p className="text-sm text-green-700 dark:text-green-300 line-clamp-2">
                                                    {zone.description}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center space-x-1 text-xs text-green-500 dark:text-green-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>Created {new Date(zone.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}`)}
                                                className="border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}/edit`)}
                                                className="border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                                            >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            )
                        ))}
                    </div>
                ) : !isLoading ? (
                    <div className="space-y-4">
                        {filteredZones.map((zone) => (
                            zone && (
                            <Card key={zone.id} className="hover:shadow-md transition-all duration-200 border-green-200 dark:border-green-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                                    <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                                                        {zone.name || 'Unnamed Zone'}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                                                        {zone.code || 'N/A'}
                                                    </Badge>
                                                    <Badge className={getStatusColor(zone.status)}>
                                                        {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-green-600 dark:text-green-400">
                                                    {zone.location || 'Location not specified'}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-green-600 dark:text-green-400">
                                                    <span className="flex items-center space-x-1">
                                                        <Users className="w-4 h-4" />
                                                        <span>{zone.member_count || 0} members</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <Building2 className="w-4 h-4" />
                                                        <span>{zone.unit_count || 0} units</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>{zone.performance_score || 0}% performance</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="text-right mr-4">
                                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                    {zone.leader?.name || 'No Leader'}
                                                </p>
                                                <p className="text-xs text-green-500 dark:text-green-400">
                                                    {zone.leader?.email || 'No email'}
                                                </p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}`)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}/edit`)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Zone
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete Zone
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Zone</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{zone.name}"? This action cannot be undone and will remove all associated data.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteZone(zone)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            )
                        ))}
                    </div>
                ) : null}

                {/* Empty State */}
                {!isLoading && filteredZones.length === 0 && (
                    <Card className="border-green-200 dark:border-green-800">
                        <CardContent className="p-12 text-center">
                            <MapPin className="w-16 h-16 text-green-300 dark:text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                                No zones found
                            </h3>
                            <p className="text-green-600 dark:text-green-400 mb-6">
                                {searchTerm || statusFilter || leaderFilter 
                                    ? 'Try adjusting your filters or search terms.'
                                    : 'Get started by creating your first zone.'
                                }
                            </p>
                            <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => router.visit('/koabiga/admin/zones/create')}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Zone
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}