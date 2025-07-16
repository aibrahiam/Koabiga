import MemberSidebarLayout from '@/layouts/member-sidebar-layout';
import MemberBottomNavbar from '@/components/member-bottom-navbar';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { 
    MapPin, 
    Sprout, 
    Package, 
    FileText, 
    TrendingUp, 
    Calendar,
    Users,
    Building2,
    Loader2
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Member Dashboard',
        href: '/koabiga/member/dashboard',
    },
];

interface DashboardStats {
    assignedLand: number;
    activeCrops: number;
    monthlyProduce: number;
    thisMonthFees: number;
    pendingReports: number;
    upcomingTasks: number;
}

interface RecentActivity {
    id: number;
    action: string;
    crop?: string;
    area?: string;
    report?: string;
    time: string;
    type: string;
}

interface UpcomingFee {
    id: number;
    title: string;
    dueDate: string;
    amount: number;
    status: string;
    fee_rule?: {
        name: string;
        type: string;
    };
}

export default function MemberDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        assignedLand: 0,
        activeCrops: 0,
        monthlyProduce: 0,
        thisMonthFees: 0,
        pendingReports: 0,
        upcomingTasks: 0,
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [upcomingFees, setUpcomingFees] = useState<UpcomingFee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch dashboard statistics
                console.log('Fetching dashboard stats...');
                const statsResponse = await axios.get('/member/dashboard/stats');
                if (statsResponse.data.success) {
                    setStats(statsResponse.data.data);
                }

                // Fetch recent activities
                console.log('Fetching recent activities...');
                const activitiesResponse = await axios.get('/member/dashboard/activities');
                if (activitiesResponse.data.success) {
                    setRecentActivities(activitiesResponse.data.data);
                    }

                // Fetch upcoming fees
                console.log('Fetching upcoming fees...');
                const feesResponse = await axios.get('/member/dashboard/upcoming-fees');
                if (feesResponse.data.success) {
                    setUpcomingFees(feesResponse.data.data);
                }

            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                console.error('Error response:', err.response?.data);
                console.error('Error status:', err.response?.status);
                setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const quickActions = [
        { title: 'My Land', icon: MapPin, href: '/koabiga/member/land', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'My Crops', icon: Sprout, href: '/koabiga/member/crops', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'My Produce', icon: Package, href: '/koabiga/member/produce', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'My Reports', icon: FileText, href: '/koabiga/member/reports', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'My Fees', icon: FileText, href: '/koabiga/member/fees', color: 'bg-green-600 dark:bg-green-500' },
    ];

    if (loading) {
        return (
            <MemberSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Member Dashboard - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading dashboard...</span>
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
                <Head title="Member Dashboard - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
                <MemberBottomNavbar />
            </MemberSidebarLayout>
        );
    }

    return (
        <MemberSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Member Dashboard - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Member Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Track your agricultural activities and progress</p>
                    </div>
                    <Badge variant="secondary" className="text-xs sm:text-sm py-1 px-2 sm:px-3">Member - Unit A</Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Link href="/koabiga/member/land" className="contents">
                        <Card className="rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">Assigned Land</CardTitle>
                                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.assignedLand} ha</div>
                                <p className="text-xs text-muted-foreground">Under your management</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/koabiga/member/crops" className="contents">
                        <Card className="rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">Active Crops</CardTitle>
                                <Sprout className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.activeCrops}</div>
                                <p className="text-xs text-muted-foreground">Currently growing</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/koabiga/member/produce" className="contents">
                        <Card className="rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">Monthly Produce</CardTitle>
                                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.monthlyProduce} kg</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/koabiga/member/fees" className="contents">
                        <Card className="rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">This Month Fees</CardTitle>
                                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">{stats.thisMonthFees.toLocaleString()} RWF</div>
                                <p className="text-xs text-muted-foreground">Fees paid this month</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.title} href={action.href} className="contents">
                            <Card
                                className="cursor-pointer hover:shadow-md transition-shadow rounded-lg flex flex-col items-center justify-center py-3 px-2 sm:py-4 sm:px-3 min-h-[90px] sm:min-h-[110px]"
                            >
                                <div className={`flex flex-col items-center justify-center w-full`}>
                                    <div className={`flex items-center justify-center rounded-full ${action.color} mb-2`} style={{ width: 44, height: 44 }}>
                                        <action.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                    </div>
                                    <span className="block text-xs sm:text-sm font-semibold text-center mt-1">{action.title}</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                    {/* Recent Activities */}
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm sm:text-base">Recent Activities</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Your latest agricultural activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-xs sm:text-sm font-medium">{activity.action}</p>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground">{activity.time}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] sm:text-xs">{activity.type}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No recent activities</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Fees */}
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm sm:text-base">Upcoming Fees</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Fees due soon</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                                {upcomingFees.length > 0 ? (
                                    upcomingFees.map((fee) => (
                                        <div key={fee.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-xs sm:text-sm font-medium">{fee.title}</p>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground">Amount: {fee.amount.toLocaleString()} RWF</p>
                                            </div>
                                            <Badge 
                                                variant={fee.status === 'Paid' ? 'default' : fee.status === 'Overdue' ? 'destructive' : 'secondary'}
                                                className="text-[10px] sm:text-xs"
                                            >
                                                {fee.status}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No upcoming fees</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <Link href="/koabiga/member/reports" className="contents">
                        <Card className="rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xs sm:text-sm">Pending Reports</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.pendingReports}</div>
                                <p className="text-xs text-muted-foreground">Need submission</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/koabiga/member/fees" className="contents">
                        <Card className="rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xs sm:text-sm">Fees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.thisMonthFees.toLocaleString()} RWF</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/koabiga/member/land" className="contents">
                        <Card className="rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xs sm:text-sm">Unit Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-green-600">Active</div>
                                <p className="text-xs text-muted-foreground">Unit A is operational</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
            <MemberBottomNavbar />
        </MemberSidebarLayout>
    );
} 