import { Head, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Edit, 
    MapPin, 
    Users, 
    Building2, 
    Calendar,
    Mail,
    Phone,
    TrendingUp,
    CheckCircle,
    X,
    AlertCircle,
    Plus,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ZoneUnit {
    id: number;
    name: string;
    code: string;
    member_count: number;
    leader: {
        id: number;
        name: string;
    } | null;
}

interface Zone {
    id: number;
    name: string;
    code: string;
    leader: {
        id: number;
        name: string;
        email: string;
        phone: string;
    } | null;
    member_count: number;
    unit_count: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    description?: string;
    location?: string;
    performance_score?: number;
    last_activity?: string;
    units: ZoneUnit[];
}

interface ViewZoneProps {
    zone: Zone;
}

export default function ViewZone({ zone }: ViewZoneProps) {
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

    return (
        <>
            <Head title={`${zone.name} - Zone Details - Koabiga Admin`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit('/koabiga/admin/zones')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Zones
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{zone.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Zone Code: {zone.code} • {zone.location || 'Location not specified'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(zone.status)}>
                            {getStatusIcon(zone.status)}
                            <span className="ml-1">{zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}</span>
                        </Badge>
                        <Button
                            onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}/edit`)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Zone
                        </Button>
                    </div>
                </div>

                {/* Zone Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Units</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{zone.unit_count}</p>
                                </div>
                                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Members</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{zone.member_count}</p>
                                </div>
                                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Performance</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                        {zone.performance_score || 0}%
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Last Activity</p>
                                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                        {zone.last_activity || 'N/A'}
                                    </p>
                                </div>
                                <Calendar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Zone Details Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="units">Units ({zone.unit_count})</TabsTrigger>
                        <TabsTrigger value="leader">Leadership</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Zone Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                        <span>Zone Information</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Zone Name</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{zone.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Zone Code</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{zone.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                                            <Badge className={getStatusColor(zone.status)}>
                                                {getStatusIcon(zone.status)}
                                                <span className="ml-1">{zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}</span>
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {zone.location || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>

                                    {zone.description && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</p>
                                                <p className="text-gray-700 dark:text-gray-300">{zone.description}</p>
                                            </div>
                                        </>
                                    )}

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {new Date(zone.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {new Date(zone.updated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button 
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}/edit`)}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Zone Details
                                    </Button>
                                    
                                    <Button 
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => router.visit(`/koabiga/admin/units/create_unit`)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New Unit
                                    </Button>
                                    
                                    <Button 
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => router.visit('/koabiga/admin/reports/generate-report')}
                                    >
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Generate Zone Report
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="units" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Zone Units</CardTitle>
                                    <Button
                                        onClick={() => router.visit(`/koabiga/admin/units/create_unit`)}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Unit
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {zone.units.length > 0 ? (
                                    <div className="space-y-4">
                                        {zone.units.map((unit) => (
                                            <div key={unit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {unit.name} ({unit.code})
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {unit.member_count} members
                                                            {unit.leader && ` • Leader: ${unit.leader.name}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.visit(`/koabiga/admin/units/${unit.id}`)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            No units found
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                            This zone doesn't have any units yet. Create the first unit to get started.
                                        </p>
                                        <Button
                                            onClick={() => router.visit(`/koabiga/admin/units/create_unit`)}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add First Unit
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="leader" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                    <span>Zone Leadership</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {zone.leader ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                                                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                    {zone.leader.name}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400">Zone Leader</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}/edit`)}
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Change Leader
                                            </Button>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-3">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                                        <p className="text-gray-900 dark:text-gray-100">{zone.leader.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                                                        <p className="text-gray-900 dark:text-gray-100">{zone.leader.phone}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Zone Performance</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div 
                                                                className="bg-emerald-600 h-2 rounded-full"
                                                                style={{ width: `${zone.performance_score || 0}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {zone.performance_score || 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            No leader assigned
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                            This zone doesn't have a leader assigned yet. Assign a leader to improve zone management.
                                        </p>
                                        <Button
                                            onClick={() => router.visit(`/koabiga/admin/zones/${zone.id}/edit`)}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Assign Leader
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
} 