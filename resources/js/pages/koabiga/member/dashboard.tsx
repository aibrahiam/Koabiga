import { Head } from '@inertiajs/react';
import { 
    MapPin, 
    Sprout, 
    Package, 
    FileText, 
    TrendingUp, 
    Calendar,
    Users,
    Building2
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Member Dashboard',
        href: '/koabiga/member/dashboard',
    },
];

export default function MemberDashboard() {
    // Mock data for demonstration
    const stats = {
        assignedLand: 8,
        activeCrops: 2,
        monthlyProduce: 450,
        completedTasks: 15,
        pendingReports: 1,
        upcomingTasks: 3,
    };

    const recentActivities = [
        { id: 1, action: 'Crop planted', crop: 'Corn', time: '2 hours ago', type: 'crop' },
        { id: 2, action: 'Harvest completed', crop: 'Wheat', time: '1 day ago', type: 'harvest' },
        { id: 3, action: 'Land maintenance', area: 'Field A', time: '3 days ago', type: 'maintenance' },
        { id: 4, action: 'Report submitted', report: 'Weekly Production', time: '1 week ago', type: 'report' },
    ];

    const quickActions = [
        { title: 'My Land', icon: MapPin, href: '/koabiga/member/land', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'My Crops', icon: Sprout, href: '/koabiga/member/crops', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'My Produce', icon: Package, href: '/koabiga/member/produce', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'My Reports', icon: FileText, href: '/koabiga/member/reports', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'My Forms', icon: FileText, href: '/koabiga/member/forms', color: 'bg-green-600 dark:bg-green-500' },
    ];

    const upcomingTasks = [
        { id: 1, title: 'Harvest corn from Field A', dueDate: '2024-06-28', priority: 'high' },
        { id: 2, title: 'Plant new wheat crop', dueDate: '2024-06-30', priority: 'medium' },
        { id: 3, title: 'Submit weekly report', dueDate: '2024-07-01', priority: 'high' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Member Dashboard - Koabiga" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Member Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Track your agricultural activities and progress</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        Member - Unit A
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assigned Land</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.assignedLand} ha</div>
                            <p className="text-xs text-muted-foreground">
                                Under your management
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

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completedTasks}</div>
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
                                <CardTitle className="text-sm">{action.title}</CardTitle>
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
                            <CardDescription>Your latest agricultural activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-center space-x-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium">{activity.action}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {activity.time}
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
                                                Due: {task.dueDate}
                                            </p>
                                        </div>
                                        <Badge 
                                            variant={task.priority === 'high' ? 'destructive' : 'default'}
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

                {/* Additional Info */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Pending Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.pendingReports}</div>
                            <p className="text-xs text-muted-foreground">Need submission</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Upcoming Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.upcomingTasks}</div>
                            <p className="text-xs text-muted-foreground">Due this week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Unit Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Active</div>
                            <p className="text-xs text-muted-foreground">Unit A is operational</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 