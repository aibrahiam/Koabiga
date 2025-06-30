import { Head } from '@inertiajs/react';
import { 
    Users, 
    MapPin, 
    Sprout, 
    Package, 
    FileText, 
    TrendingUp, 
    Calendar,
    AlertCircle,
    BarChart3,
    Plus
} from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/unit-leader/dashboard',
    },
];

export default function UnitLeaderDashboard() {
    // Mock data for demonstration
    const stats = {
        totalMembers: 12,
        totalLandArea: 180,
        activeCrops: 8,
        monthlyProduce: 2450,
        pendingReports: 3,
        upcomingTasks: 5,
    };

    const recentActivities = [
        { id: 1, action: 'Crop planted', crop: 'Corn', member: 'John Doe', time: '2 hours ago', type: 'crop' },
        { id: 2, action: 'Harvest completed', crop: 'Wheat', member: 'Sarah Smith', time: '4 hours ago', type: 'harvest' },
        { id: 3, action: 'Land maintenance', area: 'Field A', member: 'Mike Johnson', time: '6 hours ago', type: 'maintenance' },
        { id: 4, action: 'Report submitted', report: 'Weekly Production', member: 'Emily Davis', time: '1 day ago', type: 'report' },
    ];

    const quickActions = [
        { title: 'Manage Members', icon: Users, href: '/koabiga/unit-leader/members', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'Land Management', icon: MapPin, href: '/koabiga/unit-leader/land', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'Crop Management', icon: Sprout, href: '/koabiga/unit-leader/crops', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'Produce Tracking', icon: Package, href: '/koabiga/unit-leader/produce', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'Reports', icon: FileText, href: '/koabiga/unit-leader/reports', color: 'bg-green-600 dark:bg-green-500' },
    ];

    const upcomingTasks = [
        { id: 1, title: 'Harvest corn from Field A', dueDate: '2024-06-28', priority: 'high', assignedTo: 'John Doe' },
        { id: 2, title: 'Plant new wheat crop', dueDate: '2024-06-30', priority: 'medium', assignedTo: 'Sarah Smith' },
        { id: 3, title: 'Submit monthly report', dueDate: '2024-07-01', priority: 'high', assignedTo: 'Unit Leader' },
        { id: 4, title: 'Equipment maintenance', dueDate: '2024-07-03', priority: 'low', assignedTo: 'Mike Johnson' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit Leader Dashboard - Koabiga" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unit Leader Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your agricultural unit operations</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        Unit Leader - Unit A
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unit Members</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMembers}</div>
                            <p className="text-xs text-muted-foreground">
                                Active members
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Land Area</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalLandArea} ha</div>
                            <p className="text-xs text-muted-foreground">
                                Under cultivation
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
                            <Sprout className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeCrops}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently growing
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Produce</CardTitle>
                            <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.monthlyProduce} kg</div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {quickActions.map((action) => (
                        <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                                    <action.icon className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-base">{action.title}</CardTitle>
                            </CardContent>
                        </Card>
                    ))}
                </div>

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
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-center space-x-4">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium">{activity.action}</p>
                                            <p className="text-xs text-muted-foreground">
                                                by {activity.member} • {activity.time}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {activity.type}
                                        </Badge>
                                    </div>
                                ))}
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
                                {upcomingTasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{task.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Due: {task.dueDate} • Assigned to: {task.assignedTo}
                                            </p>
                                        </div>
                                        <Badge 
                                            variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {task.priority}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

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
                                    <p className="text-xs text-muted-foreground">{stats.pendingReports} reports need submission</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">Upcoming Tasks</p>
                                    <p className="text-xs text-muted-foreground">{stats.upcomingTasks} tasks due this week</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Link href="/koabiga/admin/members/create">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Member
                    </Button>
                </Link>
            </div>
        </AppLayout>
    );
} 