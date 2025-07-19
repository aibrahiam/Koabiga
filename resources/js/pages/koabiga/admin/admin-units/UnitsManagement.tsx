import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2,
    Building2,
    MapPin,
    Users,
    Phone,
    Calendar,
    ArrowUpDown,
    Grid3X3,
    List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';

interface Unit {
    id: number;
    name: string;
    code: string;
    zone_id: number;
    leader_id?: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    zone: {
        id: number;
        name: string;
        code: string;
    };
    leader?: {
        id: number;
        christian_name: string;
        family_name: string;
        phone: string;
        secondary_phone?: string;
    };
}

interface Zone {
    id: number;
    name: string;
    code: string;
}

interface Leader {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
    secondary_phone?: string;
}

interface UnitsManagementProps {
    units: Unit[];
    zones: Zone[];
    leaders: Leader[];
}

export default function UnitsManagement({ units, zones, leaders }: UnitsManagementProps) {
    // Debug: Log the received data
    console.log('UnitsManagement received:', { units, zones, leaders });
    
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
    const [sortField, setSortField] = useState<keyof Unit>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Filter and sort units
    const filteredAndSortedUnits = units
        .filter(unit => {
            const searchLower = search.toLowerCase();
            return (
                unit.name.toLowerCase().includes(searchLower) ||
                unit.code.toLowerCase().includes(searchLower) ||
                unit.zone.name.toLowerCase().includes(searchLower) ||
                (unit.leader && (
                    unit.leader.christian_name.toLowerCase().includes(searchLower) ||
                    unit.leader.family_name.toLowerCase().includes(searchLower) ||
                    unit.leader.phone.includes(searchLower)
                ))
            );
        })
        .sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            // Handle nested object sorting
            if (sortField === 'zone') {
                aValue = a.zone.name;
                bValue = b.zone.name;
            } else if (sortField === 'leader') {
                aValue = a.leader ? `${a.leader.christian_name} ${a.leader.family_name}` : '';
                bValue = b.leader ? `${b.leader.christian_name} ${b.leader.family_name}` : '';
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const handleSort = (field: keyof Unit) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = async () => {
        if (!deletingUnit) return;

        try {
            await router.delete(`/koabiga/admin/admin-units/${deletingUnit.id}`, {
                onSuccess: () => {
                    setDeletingUnit(null);
                },
                onError: (errors) => {
                    console.error('Error deleting unit:', errors);
                }
            });
        } catch (error) {
            console.error('Error deleting unit:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/koabiga/admin' },
            { title: 'Units Management', href: '/koabiga/admin/admin-units' }
        ]}>
            <Head title="Units Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Units Management</h1>
                        <p className="text-green-600 dark:text-green-300 mt-1">
                            Manage agricultural units and their assignments
                        </p>
                    </div>
                    <Button 
                        onClick={() => router.visit('/koabiga/admin/admin-units/create')}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Unit
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Units</CardTitle>
                            <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{units.length}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                All units
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Units</CardTitle>
                            <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {units.filter(u => u.status === 'active').length}
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Units with Leaders</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {units.filter(u => u.leader_id).length}
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Have assigned leaders
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Zones</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{zones.length}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Available zones
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="units-search"
                                        name="units-search"
                                        type="search"
                                        placeholder="Search units by name, code, zone, or leader..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                        autoComplete="off"
                                        aria-label="Search units"
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Units List/Grid */}
                {viewMode === 'table' ? (
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="text-green-800 dark:text-green-200">Units</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-green-200 dark:border-green-800">
                                            <th className="text-left p-4 font-medium text-green-700 dark:text-green-300">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('name')}
                                                    className="flex items-center gap-1 hover:text-green-600"
                                                    aria-label={`Sort by unit name ${sortField === 'name' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'ascending'}`}
                                                >
                                                    Unit Name
                                                    <ArrowUpDown className="w-3 h-3" />
                                                </button>
                                            </th>
                                            <th className="text-left p-4 font-medium text-green-700 dark:text-green-300">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('code')}
                                                    className="flex items-center gap-1 hover:text-green-600"
                                                    aria-label={`Sort by code ${sortField === 'code' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'ascending'}`}
                                                >
                                                    Code
                                                    <ArrowUpDown className="w-3 h-3" />
                                                </button>
                                            </th>
                                            <th className="text-left p-4 font-medium text-green-700 dark:text-green-300">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('zone')}
                                                    className="flex items-center gap-1 hover:text-green-600"
                                                    aria-label={`Sort by zone ${sortField === 'zone' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'ascending'}`}
                                                >
                                                    Zone
                                                    <ArrowUpDown className="w-3 h-3" />
                                                </button>
                                            </th>
                                            <th className="text-left p-4 font-medium text-green-700 dark:text-green-300">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('leader')}
                                                    className="flex items-center gap-1 hover:text-green-600"
                                                    aria-label={`Sort by leader ${sortField === 'leader' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'ascending'}`}
                                                >
                                                    Leader
                                                    <ArrowUpDown className="w-3 h-3" />
                                                </button>
                                            </th>
                                            <th className="text-left p-4 font-medium text-green-700 dark:text-green-300">Status</th>
                                            <th className="text-left p-4 font-medium text-green-700 dark:text-green-300">Created</th>
                                            <th className="text-right p-4 font-medium text-green-700 dark:text-green-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAndSortedUnits.map((unit) => (
                                            <tr key={unit.id} className="border-b border-green-100 dark:border-green-900 hover:bg-green-50 dark:hover:bg-green-950/50">
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                {unit.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-green-800 dark:text-green-200">{unit.name}</div>
                                                            <div className="text-sm text-green-600 dark:text-green-400">ID: {unit.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="font-mono">{unit.code}</Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-green-600" />
                                                        <span className="text-green-800 dark:text-green-200">{unit.zone.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {unit.leader ? (
                                                        <div className="flex items-center space-x-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                    {unit.leader.christian_name[0]}{unit.leader.family_name[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                                                                    {unit.leader.christian_name} {unit.leader.family_name}
                                                                </div>
                                                                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                                    <Phone className="w-3 h-3" />
                                                                    {unit.leader.phone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">No leader assigned</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(unit.status)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(unit.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.visit(`/koabiga/admin/admin-units/${unit.id}/view`)}
                                                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                            title="View Unit"
                                                            aria-label={`View unit ${unit.name}`}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.visit(`/koabiga/admin/admin-units/${unit.id}/edit-unit`)}
                                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                                                            title="Edit Unit"
                                                            aria-label={`Edit unit ${unit.name}`}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeletingUnit(unit)}
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                            title="Delete Unit"
                                                            aria-label={`Delete unit ${unit.name}`}
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
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAndSortedUnits.map((unit) => (
                            <Card key={unit.id} className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    {unit.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-green-800 dark:text-green-200">{unit.name}</CardTitle>
                                                <Badge variant="outline" className="font-mono text-xs">{unit.code}</Badge>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    aria-label={`More options for unit ${unit.name}`}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.visit(`/koabiga/admin/admin-units/${unit.id}/view`)}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.visit(`/koabiga/admin/admin-units/${unit.id}/edit-unit`)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => setDeletingUnit(unit)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-800 dark:text-green-200">{unit.zone.name}</span>
                                    </div>
                                    
                                    {unit.leader ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Leader</span>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-6">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {unit.leader.christian_name[0]}{unit.leader.family_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-sm font-medium text-green-800 dark:text-green-200">
                                                        {unit.leader.christian_name} {unit.leader.family_name}
                                                    </div>
                                                    <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {unit.leader.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500">No leader assigned</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between">
                                        {getStatusBadge(unit.status)}
                                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(unit.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}



                {/* Delete Confirmation Modal */}
                <Dialog open={!!deletingUnit} onOpenChange={() => setDeletingUnit(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Unit</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{deletingUnit?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setDeletingUnit(null)}
                                aria-label="Cancel delete unit"
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDelete}
                                aria-label={`Confirm delete unit ${deletingUnit?.name}`}
                            >
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
} 