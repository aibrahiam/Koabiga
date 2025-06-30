import { Head } from '@inertiajs/react';
import { 
    MapPin, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Eye,
    Calendar,
    TrendingUp,
    Droplets,
    Sun
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Member Dashboard',
        href: '/koabiga/member/dashboard',
    },
    {
        title: 'My Land',
        href: '/koabiga/member/land',
    },
];

export default function MemberLand() {
    // Mock data for demonstration
    const landPlots = [
        {
            id: 1,
            name: 'Field A',
            area: 8,
            location: 'North Section',
            soilType: 'Loamy',
            status: 'active',
            currentCrop: 'Corn',
            irrigationStatus: 'good',
            lastMaintenance: '2024-06-20',
            nextMaintenance: '2024-07-05',
            productivity: 85,
            coordinates: '40.7128° N, 74.0060° W',
        },
        {
            id: 2,
            name: 'Field B',
            area: 5,
            location: 'South Section',
            soilType: 'Clay',
            status: 'active',
            currentCrop: 'Wheat',
            irrigationStatus: 'needs_attention',
            lastMaintenance: '2024-06-15',
            nextMaintenance: '2024-06-30',
            productivity: 72,
            coordinates: '40.7125° N, 74.0055° W',
        },
        {
            id: 3,
            name: 'Field C',
            area: 3,
            location: 'East Section',
            soilType: 'Sandy',
            status: 'fallow',
            currentCrop: null,
            irrigationStatus: 'good',
            lastMaintenance: '2024-06-10',
            nextMaintenance: '2024-07-15',
            productivity: 0,
            coordinates: '40.7130° N, 74.0065° W',
        },
        {
            id: 4,
            name: 'Field D',
            area: 4,
            location: 'West Section',
            soilType: 'Loamy',
            status: 'active',
            currentCrop: 'Soybeans',
            irrigationStatus: 'excellent',
            lastMaintenance: '2024-06-18',
            nextMaintenance: '2024-07-08',
            productivity: 92,
            coordinates: '40.7120° N, 74.0050° W',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'fallow':
                return <Badge variant="secondary">Fallow</Badge>;
            case 'maintenance':
                return <Badge variant="outline">Under Maintenance</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getIrrigationBadge = (status: string) => {
        switch (status) {
            case 'excellent':
                return <Badge variant="default" className="bg-blue-100 text-blue-800">Excellent</Badge>;
            case 'good':
                return <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>;
            case 'needs_attention':
                return <Badge variant="destructive">Needs Attention</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const totalArea = landPlots.reduce((sum, plot) => sum + plot.area, 0);
    const activePlots = landPlots.filter(plot => plot.status === 'active').length;
    const averageProductivity = landPlots.length > 0 
        ? Math.round(landPlots.reduce((sum, plot) => sum + plot.productivity, 0) / landPlots.length)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Land - Koabiga" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Land</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your assigned land plots and track their status</p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Request New Land
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Land Area</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalArea} ha</div>
                            <p className="text-xs text-muted-foreground">
                                Under your management
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Plots</CardTitle>
                            <Sun className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activePlots}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently cultivated
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Productivity</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageProductivity}%</div>
                            <p className="text-xs text-muted-foreground">
                                This season
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Irrigation Status</CardTitle>
                            <Droplets className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {landPlots.filter(plot => plot.irrigationStatus === 'excellent' || plot.irrigationStatus === 'good').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Good condition
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
                                        placeholder="Search land plots..."
                                        className="pl-8"
                                    />
                                </div>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="fallow">Fallow</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by soil type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Soil Types</SelectItem>
                                        <SelectItem value="loamy">Loamy</SelectItem>
                                        <SelectItem value="clay">Clay</SelectItem>
                                        <SelectItem value="sandy">Sandy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Land Plots Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {landPlots.map((plot) => (
                        <Card key={plot.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl">{plot.name}</CardTitle>
                                        <CardDescription>{plot.location}</CardDescription>
                                    </div>
                                    {getStatusBadge(plot.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Area</p>
                                        <p className="font-medium">{plot.area} hectares</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Soil Type</p>
                                        <p className="font-medium">{plot.soilType}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Current Crop</p>
                                        <p className="font-medium">{plot.currentCrop || 'None'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Irrigation</p>
                                        {getIrrigationBadge(plot.irrigationStatus)}
                                    </div>
                                </div>

                                {plot.status === 'active' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Productivity</span>
                                            <span>{plot.productivity}%</span>
                                        </div>
                                        <Progress value={plot.productivity} className="h-2" />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Last Maintenance</p>
                                        <p className="font-medium">{plot.lastMaintenance}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Next Maintenance</p>
                                        <p className="font-medium">{plot.nextMaintenance}</p>
                                    </div>
                                </div>

                                <div className="text-sm">
                                    <p className="text-muted-foreground">Coordinates</p>
                                    <p className="font-medium font-mono text-xs">{plot.coordinates}</p>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Button variant="ghost" size="sm" className="flex-1">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                    </Button>
                                    <Button variant="ghost" size="sm" className="flex-1">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Update Status
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Calendar className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
} 