import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Building2, 
    Users, 
    MapPin, 
    TrendingUp, 
    Calendar,
    Phone,
    Edit,
    Trash2,
    ArrowLeft
} from 'lucide-react';
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
    members?: Array<{
        id: number;
        christian_name: string;
        family_name: string;
        phone: string;
        status: string;
        landArea?: number; // Added for total land calculation
    }>;
}

interface ViewUnitProps {
    unit: Unit;
}

export default function ViewUnit({ unit }: ViewUnitProps) {
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

    // Calculate derived data
    const totalMembers = unit.members?.length || 0;
    const activeMembers = unit.members?.filter(m => m.status === 'active').length || 0;
    const totalLand = unit.members?.reduce((sum, m) => sum + (m.landArea || 0), 0) || 0;
    const performance = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Units', href: '/koabiga/admin/admin-units' },
            { title: unit.name, href: `/koabiga/admin/admin-units/${unit.id}` },
        ]}>
            <Head title={`${unit.name} - Unit Details`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/koabiga/admin/admin-units">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Units
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{unit.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">Unit Code: {unit.code} • Zone: {unit.zone.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/koabiga/admin/admin-units/${unit.id}/edit-unit`}>
                            <Button className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Unit
                            </Button>
                        </Link>
                        <Link href={`/koabiga/admin/admin-units/${unit.id}/members`}>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                View Members
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalMembers}</div>
                            <p className="text-xs text-muted-foreground">All members</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeMembers}</div>
                            <p className="text-xs text-muted-foreground">Currently active</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Performance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{performance}%</div>
                            <p className="text-xs text-muted-foreground">Efficiency rating</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(unit.status)}
                            </div>
                            <p className="text-xs text-muted-foreground">Unit status</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Unit Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Unit Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Avatar>
                                    <AvatarFallback>
                                        {unit.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{unit.name}</div>
                                    <div className="text-sm text-muted-foreground">{unit.code}</div>
                                </div>
                            </div>
                            
                            <div className="grid gap-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Zone:</span>
                                    <span className="text-sm">{unit.zone.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Status:</span>
                                    <span className="text-sm">{getStatusBadge(unit.status)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Created:</span>
                                    <span className="text-sm">{new Date(unit.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Performance:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{performance}%</span>
                                        {getPerformanceBadge(performance)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unit Leader */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Unit Leader</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {unit.leader ? (
                                <>
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {unit.leader.christian_name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{unit.leader.christian_name} {unit.leader.family_name}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {unit.leader.phone}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">ID:</span>
                                            <span className="text-sm">{unit.leader.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Christian Name:</span>
                                            <span className="text-sm">{unit.leader.christian_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Family Name:</span>
                                            <span className="text-sm">{unit.leader.family_name}</span>
                                        </div>
                                        {unit.leader.secondary_phone && (
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium">Secondary Phone:</span>
                                                <span className="text-sm">{unit.leader.secondary_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">No leader assigned to this unit</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Unit Members Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Unit Members</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total Members:</span>
                                <span className="text-sm font-bold">{totalMembers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Active Members:</span>
                                <span className="text-sm">{activeMembers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Inactive Members:</span>
                                <span className="text-sm">{totalMembers - activeMembers}</span>
                            </div>
                            {totalMembers > 0 && (
                                <div className="pt-4">
                                    <Link href={`/koabiga/admin/admin-units/${unit.id}/members`}>
                                        <Button variant="outline" className="w-full">
                                            <Users className="h-4 w-4 mr-2" />
                                            View All Members
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Unit Zone Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Zone Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Avatar>
                                    <AvatarFallback className="bg-blue-100 text-blue-800">
                                        {unit.zone.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{unit.zone.name}</div>
                                    <div className="text-sm text-muted-foreground">{unit.zone.code}</div>
                                </div>
                            </div>
                            
                            <div className="grid gap-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Zone ID:</span>
                                    <span className="text-sm">{unit.zone.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Zone Code:</span>
                                    <span className="text-sm">{unit.zone.code}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 