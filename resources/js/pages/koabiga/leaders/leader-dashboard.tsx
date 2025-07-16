import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    MapPin, 
    Sprout, 
    Package, 
    FileText, 
    TrendingUp, 
    Calendar,
    AlertCircle,
    Building2,
    Plus,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    ArrowRight,
    DollarSign,
    BarChart3,
    Eye,
    Edit
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

import UnitLeaderLayout from '@/layouts/unit-leader-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/leaders/dashboard',
    },
];

interface UnitStats {
    totalMembers: number;
    activeMembers: number;
    totalLandArea: number;
    activeCrops: number;
    monthlyProduce: number;
    pendingReports: number;
    upcomingTasks: number;
    unitName: string;
    unitCode: string;
}

interface RecentActivity {
    id: number;
    action: string;
    description: string;
    created_at: string;
    user: {
        id: number;
        christian_name: string;
        family_name: string;
    };
}

interface UpcomingTask {
    id: number;
    title: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    assignedTo: string;
    type: string;
}

interface UnitMember {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
    status: string;
    assignedLand: number;
    completedTasks: number;
    lastActivity: string;
}

export default function UnitLeaderDashboard() {
    const [unitStats, setUnitStats] = useState<UnitStats | null>(null);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
    const [unitMembers, setUnitMembers] = useState<UnitMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch unit statistics
            const statsResponse = await axios.get('/api/leaders/stats');
            if (statsResponse.data.success) {
                setUnitStats(statsResponse.data.data);
            }

            // Fetch recent activities
            const activitiesResponse = await axios.get('/api/leaders/activities');
            if (activitiesResponse.data.success) {
                setRecentActivities(activitiesResponse.data.data);
            }

            // Fetch upcoming tasks
            const tasksResponse = await axios.get('/api/leaders/tasks');
            if (tasksResponse.data.success) {
                setUpcomingTasks(tasksResponse.data.data);
            }

            // Fetch unit members
            const membersResponse = await axios.get('/api/leaders/members');
            if (membersResponse.data.success) {
                setUnitMembers(membersResponse.data.data);
            }

        } catch (err: any) {
            console.error('Error fetching dashboard data:', err);
            if (err.response?.status === 401) {
                setError('Authentication required. Please login as unit leader.');
            } else {
                setError(err.response?.data?.message || 'Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge variant="destructive">High</Badge>;
            case 'medium':
                return <Badge variant="default">Medium</Badge>;
            case 'low':
                return <Badge variant="secondary">Low</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
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

    const quickActions = [
        { 
            title: 'Manage Members', 
            icon: Users, 
            href: '/koabiga/leaders/leader-members', 
            color: 'bg-blue-600 dark:bg-blue-500',
            description: 'Add and manage unit members'
        },
        { 
            title: 'Land Management', 
            icon: MapPin, 
            href: '/koabiga/leaders/land', 
            color: 'bg-green-600 dark:bg-green-500',
            description: 'Manage land assignments'
        },
        { 
            title: 'Crop Management', 
            icon: Sprout, 
            href: '/koabiga/leaders/crops', 
            color: 'bg-orange-600 dark:bg-orange-500',
            description: 'Track crop progress'
        },
        { 
            title: 'Produce Tracking', 
            icon: Package, 
            href: '/koabiga/leaders/produce', 
            color: 'bg-purple-600 dark:bg-purple-500',
            description: 'Monitor produce output'
        },
        { 
            title: 'Reports', 
            icon: FileText, 
            href: '/koabiga/leaders/reports', 
            color: 'bg-indigo-600 dark:bg-indigo-500',
            description: 'Submit and view reports'
        },
        { 
            title: 'Forms', 
            icon: FileText, 
            href: '/koabiga/leaders/forms', 
            color: 'bg-teal-600 dark:bg-teal-500',
            description: 'Access unit forms'
        },

    ];

    if (loading) {
        return (
            <UnitLeaderLayout breadcrumbs={breadcrumbs}>
                <Head title="Unit Leader Dashboard - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="grid gap-4 md:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-24 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </UnitLeaderLayout>
        );
    }

    if (error) {
        return (
            <UnitLeaderLayout breadcrumbs={breadcrumbs}>
                <Head title="Unit Leader Dashboard - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <Card>
                        <CardContent className="flex items-center justify-center p-6">
                            <div className="text-center">
                                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                                <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
                                <p className="text-muted-foreground">{error}</p>
                                <Button onClick={fetchDashboardData} className="mt-4">
                                    Retry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </UnitLeaderLayout>
        );
    }

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit Leader Dashboard - Koabiga" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaders Dashboard</h1>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        Unit Leader
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Unit Members</CardTitle>
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{unitStats?.totalMembers || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {unitStats?.activeMembers || 0} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Land Area</CardTitle>
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{unitStats?.totalLandArea || 0} ha</div>
                            <p className="text-xs text-muted-foreground">
                                Under cultivation
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Active Crops</CardTitle>
                            <Sprout className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{unitStats?.activeCrops || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently growing
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Monthly Produce</CardTitle>
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{unitStats?.monthlyProduce || 0} kg</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Member Button */}
                <div className="flex justify-center">
                    <Link href="/koabiga/leaders/forms/member-creation">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Member
                        </Button>
                    </Link>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks for unit management</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                            {quickActions.map((action) => {
                                const IconComponent = action.icon;
                                return (
                                    <Link key={action.title} href={action.href} className="contents">
                                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                            <CardContent className="p-3 sm:p-4 md:p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${action.color} flex items-center justify-center mx-auto sm:mx-0`}>
                                                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 text-center sm:text-left sm:pl-2">
                                                        <h3 className="font-medium text-xs sm:text-sm">{action.title}</h3>
                                                        <p className="text-xs text-muted-foreground hidden sm:block">{action.description}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Content Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Activities */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activities</CardTitle>
                            <CardDescription>Latest unit activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-center space-x-4">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium">{activity.action}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    by {activity.user.christian_name} {activity.user.family_name} • {new Date(activity.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No recent activities</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Tasks */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Tasks</CardTitle>
                            <CardDescription>Tasks due this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingTasks.length > 0 ? (
                                    upcomingTasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{task.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Due: {task.dueDate} • Assigned to: {task.assignedTo}
                                                </p>
                                            </div>
                                            {getPriorityBadge(task.priority)}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Unit Members Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Unit Members Overview</CardTitle>
                        <CardDescription>Active members and their status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {unitMembers.slice(0, 6).map((member) => (
                                <Card key={member.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium">
                                                    {member.christian_name[0]}{member.family_name[0]}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{member.christian_name} {member.family_name}</h4>
                                                <p className="text-xs text-muted-foreground">{member.phone}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getStatusBadge(member.status)}
                                                    <span className="text-xs text-muted-foreground">
                                                        {member.assignedLand} ha
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {unitMembers.length > 6 && (
                            <div className="mt-4 text-center">
                                <Link href="/koabiga/leaders/leader-members">
                                    <Button variant="outline" size="sm">
                                        View All Members ({unitMembers.length})
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Alerts and Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Unit Alerts</CardTitle>
                        <CardDescription>Important notifications for your unit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center space-x-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium">Pending Reports</p>
                                    <p className="text-xs text-muted-foreground">{unitStats?.pendingReports || 0} reports need submission</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">Upcoming Tasks</p>
                                    <p className="text-xs text-muted-foreground">{unitStats?.upcomingTasks || 0} tasks due this week</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


            </div>
        </UnitLeaderLayout>
    );
} 