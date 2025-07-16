import MemberSidebarLayout from '@/layouts/member-sidebar-layout';
import MemberBottomNavbar from '@/components/member-bottom-navbar';
import { Head } from '@inertiajs/react';
import { 
    Package, 
    Calendar,
    TrendingUp,
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
        title: 'My Produce',
        href: '/koabiga/members/produce',
    },
];

interface Produce {
    id: number;
    crop_id: number;
    quantity: number;
    unit_of_measure: string;
    harvest_date: string;
    crop?: {
        name: string;
        variety: string;
    };
}

interface ProduceStats {
    totalProduce: number;
    totalQuantity: number;
    thisMonthQuantity: number;
    averagePerHarvest: number;
}

export default function MemberProduce() {
    const [produce, setProduce] = useState<Produce[]>([]);
    const [stats, setStats] = useState<ProduceStats>({
        totalProduce: 0,
        totalQuantity: 0,
        thisMonthQuantity: 0,
        averagePerHarvest: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduceData = async () => {
            try {
                setLoading(true);
                setError(null);

                const produceResponse = await axios.get('/member/produce');
                if (produceResponse.data.success) {
                    const produceData = produceResponse.data.data;
                    setProduce(produceData);

                    // Calculate stats
                    const totalQuantity = produceData.reduce((sum: number, item: Produce) => sum + item.quantity, 0);
                    const thisMonth = new Date().getMonth();
                    const thisYear = new Date().getFullYear();
                    const thisMonthQuantity = produceData.filter((item: Produce) => {
                        const harvestDate = new Date(item.harvest_date);
                        return harvestDate.getMonth() === thisMonth && harvestDate.getFullYear() === thisYear;
                    }).reduce((sum: number, item: Produce) => sum + item.quantity, 0);

                    setStats({
                        totalProduce: produceData.length,
                        totalQuantity: totalQuantity,
                        thisMonthQuantity: thisMonthQuantity,
                        averagePerHarvest: produceData.length > 0 ? totalQuantity / produceData.length : 0,
                    });
                }

            } catch (err: any) {
                console.error('Error fetching produce data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load produce data');
            } finally {
                setLoading(false);
            }
        };

        fetchProduceData();
    }, []);

    if (loading) {
        return (
            <MemberSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="My Produce - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading produce...</span>
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
                <Head title="My Produce - Koabiga" />
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
            <Head title="My Produce - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Produce</h1>
                        <p className="text-gray-600 dark:text-gray-400">Monitor your produce output and harvest records</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Harvests</CardTitle>
                            <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalProduce}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Quantity</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalQuantity.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">kg harvested</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">This Month</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.thisMonthQuantity.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">kg this month</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Average/Harvest</CardTitle>
                            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.averagePerHarvest.toFixed(1)}</div>
                            <p className="text-xs text-muted-foreground">kg average</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Produce List */}
                <Card className="rounded-lg shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-base">Harvest Records</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Your produce harvest history and details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 sm:space-y-4">
                            {produce.length > 0 ? (
                                produce.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900">
                                                <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm sm:text-base font-medium">
                                                    {item.crop ? `${item.crop.name} - ${item.crop.variety}` : 'Unknown Crop'}
                                                </p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    Harvest Date: {new Date(item.harvest_date).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Quantity: {item.quantity.toLocaleString()} {item.unit_of_measure}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="text-xs sm:text-sm">
                                                {item.quantity.toLocaleString()} {item.unit_of_measure}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No produce records</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">You don't have any produce records yet.</p>
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