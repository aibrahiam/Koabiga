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
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        leader: string;
        search: string;
    };
}

export default function ZoneManagement({ 
    zones = [], 
    stats = {
        total_zones: 0,
        active_zones: 0,
        inactive_zones: 0,
        total_members: 0,
        total_units: 0,
        average_performance: 0
    },
    filters = { status: '', leader: '', search: '' }
}: ZoneManagementProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [leaderFilter, setLeaderFilter] = useState(filters.leader);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get unique leaders for filter
    const uniqueLeaders = Array.from(new Set(zones.map(zone => zone.leader.name)));

    const filteredZones = zones.filter(zone => {
        const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             zone.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             zone.leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             zone.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || zone.status === statusFilter;
        const matchesLeader = !leaderFilter || zone.leader.name === leaderFilter;
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
        router.get('/koabiga/admin/zones', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleDeleteZone = (zone: Zone) => {
        setIsLoading(true);
        router.delete(`/api/admin/zones/${zone.id}`, {
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
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
        <>
            <Head title="Zone Management - Koabiga Admin" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Zone Management</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage zones, leaders, and member distribution across the platform
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.reload()}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => router.visit('/koabiga/admin/zones/create')}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Zone
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Zones</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total_zones}</p>
                                </div>
                                <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Zones</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active_zones}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Members</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.total_members}</p>
                                </div>
                                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Performance</p>
                                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                        {stats.average_performance}%
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                            <div className="flex-1 w-full lg:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search zones, codes, leaders, or locations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={leaderFilter} onValueChange={setLeaderFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Leader" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Leaders</SelectItem>
                                        {uniqueLeaders.map((leader) => (
                                            <SelectItem key={leader} value={leader}>
                                                {leader}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button variant="outline" onClick={handleSearch}>
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>

                                {(searchTerm || statusFilter || leaderFilter) && (
                                    <Button variant="ghost" onClick={handleClearFilters}>
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
                        >
                            Grid
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredZones.length} zone{filteredZones.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {/* Zones Display */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredZones.map((zone) => (
                            <Card key={zone.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg flex items-center space-x-2">
                                                <span>{zone.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {zone.code}
                                                </Badge>
                                            </CardTitle>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Performance</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {zone.performance_score || 0}%
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Leader</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {zone.leader.name}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                {zone.leader.email}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {zone.member_count}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                {zone.unit_count} units
                                            </p>
                                        </div>
                                    </div>

                                    {zone.description && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                                    {zone.description}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            <span>Created {new Date(zone.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}`)}
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}/edit`)}
                                            >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredZones.map((zone) => (
                            <Card key={zone.id} className="hover:shadow-md transition-all duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                                    <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                        {zone.name}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {zone.code}
                                                    </Badge>
                                                    <Badge className={getStatusColor(zone.status)}>
                                                        {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {zone.location || 'Location not specified'}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="flex items-center space-x-1">
                                                        <Users className="w-4 h-4" />
                                                        <span>{zone.member_count} members</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{zone.unit_count} units</span>
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
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {zone.leader.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {zone.leader.email}
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
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredZones.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No zones found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {searchTerm || statusFilter || leaderFilter 
                                    ? 'Try adjusting your filters or search terms.'
                                    : 'Get started by creating your first zone.'
                                }
                            </p>
                            <Button 
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => router.visit('/koabiga/admin/zones/create')}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Zone
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}