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
    Sun,
    Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

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
        href: '/koabiga/members/dashboard',
    },
    {
        title: 'My Land',
        href: '/koabiga/members/land',
    },
];

interface LandFee {
    id: number;
    title: string;
    amount: number;
    status: string;
    dueDate: string;
    fee_rule?: {
        name: string;
        type: string;
    };
}

interface UnitInfo {
    id: number;
    name: string;
    leader?: {
        christian_name: string;
        family_name: string;
        phone_number: string;
    };
}

export default function MemberLand() {
    const [landPlots, setLandPlots] = useState<any[]>([]);
    const [landFees, setLandFees] = useState<LandFee[]>([]);
    const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLandData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch land data
                const landResponse = await axios.get('/member/land');
                if (landResponse.data.success) {
                    setLandPlots(landResponse.data.data);
                }

                // Fetch fees data
                const feesResponse = await axios.get('/member/fees');
                if (feesResponse.data.success) {
                    setLandFees(feesResponse.data.data);
                }

                // Fetch unit information (assuming the first land has unit info)
                if (landResponse.data.success && landResponse.data.data.length > 0) {
                    const firstLand = landResponse.data.data[0];
                    if (firstLand.unit_id) {
                        // You might need to create a separate API endpoint for unit info
                        // For now, we'll use the unit info from the land data
                        setUnitInfo({
                            id: firstLand.unit_id,
                            name: firstLand.unit || 'Unknown Unit',
                            leader: {
                                christian_name: 'John', // This should come from backend
                                family_name: 'Doe',
                                phone_number: '+250 788 123 456'
                            }
                        });
                    }
                }

            } catch (err: any) {
                console.error('Error fetching land data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load land data');
            } finally {
                setLoading(false);
            }
        };

        fetchLandData();
    }, []);

    const totalArea = landPlots.reduce((sum, plot) => sum + (plot.area || 0), 0);
    const totalLandFees = landFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="My Land - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading land data...</span>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="My Land - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

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
                            <CardTitle className="text-sm font-medium">Land Fees</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalLandFees.toLocaleString()} RWF</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unit Info</CardTitle>
                            <Sun className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">{unitInfo?.name || 'No Unit Assigned'}</div>
                            <p className="text-xs text-muted-foreground">
                                Leader: {unitInfo?.leader ? `${unitInfo.leader.christian_name} ${unitInfo.leader.family_name}` : 'Not Assigned'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {unitInfo?.leader?.phone_number || 'No Phone'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Koabiga Contact</CardTitle>
                            <Droplets className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">Sarah Manager</div>
                            <p className="text-xs text-muted-foreground">
                                Contact Person
                            </p>
                            <p className="text-xs text-muted-foreground">
                                +250 789 987 654
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
                                        disabled={landPlots.length === 0}
                                    />
                                </div>
                                <Select disabled={landPlots.length === 0}>
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
                                <Select disabled={landPlots.length === 0}>
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
                    {landPlots.length > 0 ? (
                        landPlots.map((plot) => (
                            <Card key={plot.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{plot.land_number || `Land ${plot.id}`}</CardTitle>
                                            <CardDescription>{plot.zone || 'Unknown Zone'}</CardDescription>
                                        </div>
                                        <Badge variant="outline">Active</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Area</p>
                                            <p className="font-medium">{plot.area || 0} hectares</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Unit</p>
                                            <p className="font-medium">{plot.unit || 'Not Assigned'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Zone</p>
                                            <p className="font-medium">{plot.zone || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Land Number</p>
                                            <p className="font-medium">{plot.land_number || 'N/A'}</p>
                                        </div>
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
                        ))
                    ) : (
                        /* Placeholder for empty state */
                        <Card className="col-span-2 text-center py-12">
                            <CardContent>
                                <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">No Land Assigned</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">You currently have no land plots assigned. Please contact your unit leader or request new land.</p>
                                <Button className="mx-auto" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Request Land
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
} 