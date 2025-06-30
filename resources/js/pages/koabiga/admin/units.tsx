import { Head, Link, router } from '@inertiajs/react';
import { 
    Building2, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Trash2,
    Eye,
    Users,
    MapPin,
    TrendingUp
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/koabiga/admin/dashboard',
    },
    {
        title: 'Units Management',
        href: '/koabiga/admin/units',
    },
];

export default function AdminUnits() {
    // Mock data for demonstration
    const units = [
        {
            id: 1,
            name: 'Unit A',
            code: 'UA001',
            leader: 'Sarah Smith',
            leaderPhone: '0723456789',
            leaderId: 'ID001',
            leaderFamilyName: 'Smith',
            leaderChristianName: 'Sarah',
            totalMembers: 12,
            totalLand: 180,
            status: 'active',
            location: 'North Region',
            establishedDate: '2024-01-15',
            performance: 85,
            avatar: null,
        },
        {
            id: 2,
            name: 'Unit B',
            code: 'UB002',
            leader: 'David Wilson',
            leaderPhone: '0756789012',
            leaderId: 'ID002',
            leaderFamilyName: 'Wilson',
            leaderChristianName: 'David',
            totalMembers: 8,
            totalLand: 120,
            status: 'active',
            location: 'South Region',
            establishedDate: '2024-02-20',
            performance: 92,
            avatar: null,
        },
        {
            id: 3,
            name: 'Unit C',
            code: 'UC003',
            leader: 'Emily Davis',
            leaderPhone: '0789012345',
            leaderId: 'ID003',
            leaderFamilyName: 'Davis',
            leaderChristianName: 'Emily',
            totalMembers: 15,
            totalLand: 220,
            status: 'active',
            location: 'East Region',
            establishedDate: '2024-03-10',
            performance: 78,
            avatar: null,
        },
        {
            id: 4,
            name: 'Unit D',
            code: 'UD004',
            leader: 'Mike Johnson',
            leaderPhone: '0712345678',
            leaderId: 'ID004',
            leaderFamilyName: 'Johnson',
            leaderChristianName: 'Mike',
            totalMembers: 10,
            totalLand: 150,
            status: 'inactive',
            location: 'West Region',
            establishedDate: '2024-01-30',
            performance: 65,
            avatar: null,
        },
        {
            id: 5,
            name: 'Unit E',
            code: 'UE005',
            leader: 'John Doe',
            leaderPhone: '0745678901',
            leaderId: 'ID005',
            leaderFamilyName: 'Doe',
            leaderChristianName: 'John',
            totalMembers: 18,
            totalLand: 280,
            status: 'active',
            location: 'Central Region',
            establishedDate: '2024-02-05',
            performance: 88,
            avatar: null,
        },
    ];

    const [search, setSearch] = useState('');
    const [unitsList, setUnitsList] = useState(units);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const filteredUnits = unitsList.filter(unit => {
        const searchLower = search.toLowerCase();
        return (
            unit.leaderPhone.includes(searchLower) ||
            (unit.leaderId && unit.leaderId.toLowerCase().includes(searchLower)) ||
            (unit.leaderFamilyName && unit.leaderFamilyName.toLowerCase().includes(searchLower)) ||
            (unit.leaderChristianName && unit.leaderChristianName.toLowerCase().includes(searchLower))
        );
    });

    const handleViewUnit = (unitId: number) => {
        // Navigate to unit view page
        router.visit(`/koabiga/admin/units/${unitId}`);
    };

    const handleEditUnit = (unitId: number) => {
        // Navigate to unit edit page
        router.visit(`/koabiga/admin/units/${unitId}/edit`);
    };

    const handleViewMembers = (unitId: number) => {
        // Navigate to unit members page
        console.log('Navigating to unit members:', unitId);
        try {
            router.visit(`/koabiga/admin/units/${unitId}/members`);
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback to window.location
            window.location.href = `/koabiga/admin/units/${unitId}/members`;
        }
    };

    const handleDeleteUnit = (unitId: number) => {
        if (deleteConfirmId === unitId) {
            // Confirm delete
            setUnitsList(prev => prev.filter(unit => unit.id !== unitId));
            setDeleteConfirmId(null);
            alert('Unit deleted successfully!');
        } else {
            // Show delete confirmation
            setDeleteConfirmId(unitId);
            setTimeout(() => setDeleteConfirmId(null), 3000); // Auto-hide after 3 seconds
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'suspended':
                return <Badge variant="destructive">Suspended</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPerformanceBadge = (performance: number) => {
        if (performance >= 90) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
        } else if (performance >= 80) {
            return <Badge variant="default" className="bg-blue-100 text-blue-800">Good</Badge>;
        } else if (performance >= 70) {
            return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Average</Badge>;
        } else {
            return <Badge variant="destructive">Poor</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Units Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Units Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage agricultural units and their operations</p>
                    </div>
                    <Link href="/koabiga/admin/units/create_unit">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create New Unit
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                            <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredUnits.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Agricultural units
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Units</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {filteredUnits.filter(u => u.status === 'active').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently operational
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {filteredUnits.reduce((sum, u) => sum + (u.totalMembers || 0), 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all units
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Land Area</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {filteredUnits.reduce((sum, u) => sum + (u.totalLand || 0), 0)} ha
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Under management
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
                                        placeholder="Search unit leaders by phone, ID, family name, or christian name..."
                                        className="pl-8"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Regions</SelectItem>
                                        <SelectItem value="north">North Region</SelectItem>
                                        <SelectItem value="south">South Region</SelectItem>
                                        <SelectItem value="east">East Region</SelectItem>
                                        <SelectItem value="west">West Region</SelectItem>
                                        <SelectItem value="central">Central Region</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Units Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Units</CardTitle>
                        <CardDescription>Manage agricultural units and their leaders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Unit</th>
                                        <th className="text-left p-4 font-medium">Leader</th>
                                        <th className="text-left p-4 font-medium">Members</th>
                                        <th className="text-left p-4 font-medium">Land Area</th>
                                        <th className="text-left p-4 font-medium">Performance</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Location</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUnits.map((unit) => (
                                        <tr key={unit.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarImage src={unit.avatar || undefined} />
                                                        <AvatarFallback>
                                                            {unit.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{unit.name}</div>
                                                        <div className="text-sm text-muted-foreground">{unit.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">{unit.leader}</div>
                                                    <div className="text-xs text-muted-foreground">{unit.leaderPhone}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{unit.totalMembers || 0}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{unit.totalLand} ha</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium">{unit.performance}%</span>
                                                    {getPerformanceBadge(unit.performance)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(unit.status)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{unit.location}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleViewUnit(unit.id)}
                                                        title="View Unit"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleEditUnit(unit.id)}
                                                        title="Edit Unit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Link href={`/koabiga/admin/units/${unit.id}/members`}>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            title="View Unit Members"
                                                        >
                                                            <Users className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className={`${deleteConfirmId === unit.id ? 'bg-red-100 text-red-700' : 'text-red-600 hover:text-red-700'}`}
                                                        onClick={() => handleDeleteUnit(unit.id)}
                                                        title={deleteConfirmId === unit.id ? 'Click again to confirm delete' : 'Delete Unit'}
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
            </div>
        </AppLayout>
    );
} 