import MemberSidebarLayout from '@/layouts/member-sidebar-layout';
import MemberBottomNavbar from '@/components/member-bottom-navbar';
import { Head } from '@inertiajs/react';
import { 
    Sprout, 
    MapPin,
    Calendar,
    Package,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Member Dashboard',
        href: '/koabiga/members/dashboard',
    },
    {
        title: 'My Crops',
        href: '/koabiga/members/crops',
    },
];

interface Crop {
    id: number;
    name: string;
    variety: string;
    status: string;
    land_id: number;
    land?: {
        land_number: string;
        area: number;
    };
}

interface CropStats {
    totalCrops: number;
    activeCrops: number;
    totalArea: number;
    cropTypes: number;
}

export default function MemberCrops() {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [stats, setStats] = useState<CropStats>({
        totalCrops: 0,
        activeCrops: 0,
        totalArea: 0,
        cropTypes: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCropsData = async () => {
            try {
                setLoading(true);
                setError(null);

                const cropsResponse = await axios.get('/member/crops');
                if (cropsResponse.data.success) {
                    const cropsData = cropsResponse.data.data;
                    setCrops(cropsData);

                    // Calculate stats
                    const uniqueCropTypes = new Set(cropsData.map((crop: Crop) => crop.name)).size;
                    const totalArea = cropsData.reduce((sum: number, crop: Crop) => {
                        return sum + (crop.land?.area || 0);
                    }, 0);

                    setStats({
                        totalCrops: cropsData.length,
                        activeCrops: cropsData.filter((crop: Crop) => crop.status === 'active').length,
                        totalArea: totalArea,
                        cropTypes: uniqueCropTypes,
                    });
                }

            } catch (err: any) {
                console.error('Error fetching crops data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load crops data');
            } finally {
                setLoading(false);
            }
        };

        fetchCropsData();
    }, []);

    if (loading) {
        return (
            <MemberSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="My Crops - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading crops...</span>
                        </div>
                    </div>
                </div>
                <MemberBottomNavbar />
            </MemberSidebarLayout>
        );
    }

    if (error) {
        return (
            <MemberSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="My Crops - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
                <MemberBottomNavbar />
            </MemberSidebarLayout>
        );
    }

    return (
        <MemberSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="My Crops - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Crops</h1>
                        <p className="text-gray-600 dark:text-gray-400">Track your assigned crop progress and management</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Crops</CardTitle>
                            <Sprout className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalCrops}</div>
                            <p className="text-xs text-muted-foreground">Assigned to you</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Active Crops</CardTitle>
                            <Sprout className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.activeCrops}</div>
                            <p className="text-xs text-muted-foreground">Currently growing</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Area</CardTitle>
                            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalArea} ha</div>
                            <p className="text-xs text-muted-foreground">Under cultivation</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Crop Types</CardTitle>
                            <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.cropTypes}</div>
                            <p className="text-xs text-muted-foreground">Different varieties</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Crops List */}
                <Card className="rounded-lg shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-base">Crop Details</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Your assigned crops and their current status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 sm:space-y-4">
                            {crops.length > 0 ? (
                                crops.map((crop) => (
                                    <div key={crop.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                                                <Sprout className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm sm:text-base font-medium">{crop.name}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    Variety: {crop.variety}
                                                </p>
                                                {crop.land && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Land: {crop.land.land_number} ({crop.land.area} ha)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="text-xs sm:text-sm">
                                                {crop.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No crops assigned</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">You don't have any crops assigned yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <MemberBottomNavbar />
        </MemberSidebarLayout>
    );
} 