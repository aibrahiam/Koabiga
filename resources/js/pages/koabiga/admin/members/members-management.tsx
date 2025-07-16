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
    User, 
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    X,
    RefreshCw,
    Building2,
    Activity,
    Settings,
    Download,
    Mail,
    Phone,
    MapPin
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

interface Member {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
    secondary_phone?: string;
    national_id: string;
    gender: 'male' | 'female';
    role: 'member' | 'unit_leader' | 'zone_leader';
    status: 'active' | 'inactive';
    unit?: {
        id: number;
        name: string;
        code: string;
    };
    zone?: {
        id: number;
        name: string;
        code: string;
    };
    created_at: string;
    updated_at: string;
}

interface Unit {
    id: number;
    name: string;
    code: string;
}

interface Zone {
    id: number;
    name: string;
    code: string;
}

interface MemberStats {
    total_members: number;
    active_members: number;
    inactive_members: number;
    unit_leaders: number;
    zone_leaders: number;
}

interface MembersManagementProps {
    members: {
        data: Member[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    units: Unit[];
    zones: Zone[];
    stats: MemberStats;
    filters: {
        search?: string;
        role?: string;
        status?: string;
        zone_id?: string;
        unit_id?: string;
    };
}

export default function MembersManagement({ 
    members: initialMembers, 
    units, 
    zones, 
    stats: initialStats, 
    filters 
}: MembersManagementProps) {
    const [members, setMembers] = useState(initialMembers);
    const [stats, setStats] = useState(initialStats);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [zoneFilter, setZoneFilter] = useState(filters?.zone_id || '');
    const [unitFilter, setUnitFilter] = useState(filters?.unit_id || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSearch = () => {
        router.get('/koabiga/admin/members', {
            search: searchTerm,
            role: roleFilter,
            status: statusFilter,
            zone_id: zoneFilter,
            unit_id: unitFilter
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusFilter('');
        setZoneFilter('');
        setUnitFilter('');
        setError(null);
        setSuccessMessage(null);
        router.get('/koabiga/admin/members', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleDeleteMember = (member: Member) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        router.delete(`/koabiga/admin/members/${member.id}`, {
            onSuccess: () => {
                setIsLoading(false);
                try {
                    // Update local state immediately
                    setMembers(prev => ({
                        ...prev,
                        data: prev.data.filter(m => m.id !== member.id),
                        total: prev.total - 1
                    }));
                    
                    // Update stats safely
                    setStats(prevStats => {
                        const newStats = { ...prevStats };
                        newStats.total_members = Math.max(0, prevStats.total_members - 1);
                        
                        if (member.status === 'active') {
                            newStats.active_members = Math.max(0, prevStats.active_members - 1);
                        } else {
                            newStats.inactive_members = Math.max(0, prevStats.inactive_members - 1);
                        }
                        
                        if (member.role === 'unit_leader') {
                            newStats.unit_leaders = Math.max(0, prevStats.unit_leaders - 1);
                        } else if (member.role === 'zone_leader') {
                            newStats.zone_leaders = Math.max(0, prevStats.zone_leaders - 1);
                        }
                        
                        return newStats;
                    });
                    
                    // Show success message
                    setSuccessMessage(`Member "${member.christian_name} ${member.family_name}" deleted successfully`);
                    
                    // Clear success message after 3 seconds
                    setTimeout(() => setSuccessMessage(null), 3000);
                } catch (error) {
                    console.error('Error updating local state after deletion:', error);
                    // If local state update fails, refresh the page to get fresh data
                    router.visit('/koabiga/admin/members', { preserveScroll: true });
                }
            },
            onError: (errors) => {
                setIsLoading(false);
                setError('Failed to delete member. Please try again.');
                console.error('Error deleting member:', errors);
            }
        });
    };

    const handleExport = () => {
        window.open('/koabiga/admin/members/export', '_blank');
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'zone_leader': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'unit_leader': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'member': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'inactive': return <X className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getGenderIcon = (gender: string) => {
        switch (gender) {
            case 'male': return <User className="w-4 h-4 text-blue-600" />;
            case 'female': return <User className="w-4 h-4 text-pink-600" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/koabiga/admin' },
            { title: 'Members Management', href: '/koabiga/admin/members' }
        ]}>
            <Head title="Members Management - Koabiga Admin" />
            
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
                        <span className="ml-2 text-gray-600">Loading members...</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Members Management</h1>
                        <p className="text-green-600 dark:text-green-300">
                            Manage platform members, leaders, and their assignments
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
                                router.visit('/koabiga/admin/members', { 
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
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            className="border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => router.visit('/koabiga/admin/members/create')}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Member
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.total_members}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                All platform members
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Members</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.active_members}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                {stats.inactive_members} inactive
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Unit Leaders</CardTitle>
                            <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.unit_leaders}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Unit management
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Zone Leaders</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.zone_leaders}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Zone management
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Regular Members</CardTitle>
                            <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {stats.total_members - stats.unit_leaders - stats.zone_leaders}
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Platform users
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-green-200 dark:border-green-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <Filter className="h-5 w-5" />
                            Search & Filter Members
                        </CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-400">
                            Find specific members by name, phone, national ID, role, or status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                            <div className="flex-1 w-full lg:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search by name, phone, or national ID..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setError(null);
                                            setSuccessMessage(null);
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10 border-green-200 dark:border-green-800 focus:border-green-300 dark:focus:border-green-700"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-40 border-green-200 dark:border-green-800">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                        <SelectItem value="zone_leader">Zone Leader</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40 border-green-200 dark:border-green-800">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                                    <SelectTrigger className="w-48 border-green-200 dark:border-green-800">
                                        <SelectValue placeholder="Select Zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Zones</SelectItem>
                                        {zones
                                            .filter(zone => zone && zone.id && zone.name)
                                            .map((zone) => (
                                                <SelectItem key={zone.id} value={String(zone.id)}>
                                                    {zone.name} ({zone.code})
                                                </SelectItem>
                                            ))}
                                        {zones.filter(zone => zone && zone.id && zone.name).length === 0 && (
                                            <SelectItem value="none" disabled>
                                                No zones available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>

                                <Select value={unitFilter} onValueChange={setUnitFilter}>
                                    <SelectTrigger className="w-48 border-green-200 dark:border-green-800">
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Units</SelectItem>
                                        {units
                                            .filter(unit => unit && unit.id && unit.name)
                                            .map((unit) => (
                                                <SelectItem key={unit.id} value={String(unit.id)}>
                                                    {unit.name} ({unit.code})
                                                </SelectItem>
                                            ))}
                                        {units.filter(unit => unit && unit.id && unit.name).length === 0 && (
                                            <SelectItem value="none" disabled>
                                                No units available
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

                                {(searchTerm || roleFilter || statusFilter || zoneFilter || unitFilter) && (
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

                {/* Members Count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-green-600 dark:text-green-400">
                        {members.total} member{members.total !== 1 ? 's' : ''} found
                        {members.total > 0 && (
                            <span className="ml-2">
                                (Page {members.current_page} of {members.last_page})
                            </span>
                        )}
                    </p>
                </div>

                {/* Members Table */}
                {!isLoading && members.data.length > 0 ? (
                    <Card className="border-green-200 dark:border-green-800">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-green-50 dark:bg-green-900/20">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                                                Member
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                                                Assignment
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                                                Role & Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-green-200 dark:divide-green-800">
                                        {members.data.map((member) => (
                                            <tr key={member.id} className="hover:bg-green-50 dark:hover:bg-green-900/10">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                                                {getGenderIcon(member.gender)}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-green-900 dark:text-green-100">
                                                                {member.christian_name} {member.family_name}
                                                            </div>
                                                            <div className="text-sm text-green-600 dark:text-green-400">
                                                                ID: {member.national_id}
                                                            </div>
                                                            <div className="text-xs text-green-500 dark:text-green-400 capitalize">
                                                                {member.gender}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-900 dark:text-green-100">
                                                        <div className="flex items-center space-x-1 mb-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{member.phone}</span>
                                                        </div>
                                                        {member.secondary_phone && (
                                                            <div className="flex items-center space-x-1">
                                                                <Phone className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    {member.secondary_phone}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-900 dark:text-green-100">
                                                        <div className="flex items-center space-x-1 mb-1">
                                                            <Building2 className="w-3 h-3" />
                                                            <span>{member.unit?.name || 'No Unit'}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{member.zone?.name || 'No Zone'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col space-y-2">
                                                        <Badge className={getRoleColor(member.role)}>
                                                            {member.role.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                        <Badge className={getStatusColor(member.status)}>
                                                            {getStatusIcon(member.status)}
                                                            <span className="ml-1">{member.status.charAt(0).toUpperCase() + member.status.slice(1)}</span>
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.visit(`/koabiga/admin/members/${member.id}`)}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                                                            title="View Member"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.visit(`/koabiga/admin/members/${member.id}/edit`)}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                                                            title="Edit Member"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                                                    title="Delete Member"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Member</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{member.christian_name} {member.family_name}"? This action cannot be undone and will remove all associated data.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeleteMember(member)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ) : !isLoading ? (
                    <Card className="border-green-200 dark:border-green-800">
                        <CardContent className="p-12 text-center">
                            <Users className="w-16 h-16 text-green-300 dark:text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                                No members found
                            </h3>
                            <p className="text-green-600 dark:text-green-400 mb-6">
                                {searchTerm || roleFilter || statusFilter || zoneFilter || unitFilter 
                                    ? 'Try adjusting your filters or search terms.'
                                    : 'Get started by creating your first member.'
                                }
                            </p>
                            <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => router.visit('/koabiga/admin/members/create')}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Member
                            </Button>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Pagination */}
                {members.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-green-600 dark:text-green-400">
                            Showing {((members.current_page - 1) * members.per_page) + 1} to {Math.min(members.current_page * members.per_page, members.total)} of {members.total} results
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/koabiga/admin/members', { page: members.current_page - 1, ...filters })}
                                disabled={members.current_page === 1}
                                className="border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-green-600 dark:text-green-400">
                                Page {members.current_page} of {members.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/koabiga/admin/members', { page: members.current_page + 1, ...filters })}
                                disabled={members.current_page === members.last_page}
                                className="border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
} 