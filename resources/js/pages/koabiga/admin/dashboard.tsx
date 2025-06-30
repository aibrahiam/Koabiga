import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    FileText, 
    Settings, 
    ClipboardList, 
    TrendingUp, 
    BarChart3,
    Calendar,
    AlertCircle,
    Building2,
    DollarSign,
    Eye,
    Edit,
    Trash2,
    Plus,
    MapPin
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/koabiga/admin/dashboard',
    },
];

export default function AdminDashboard() {
    // Mock data for demonstration
    const stats = {
        totalMembers: 156,
        totalUnits: 12,
        activeReports: 8,
        pendingForms: 23,
        monthlyGrowth: 12.5,
        totalLandArea: 2450,
        totalRevenue: 12500,
        activeFeeRules: 8,
    };

    const recentActivities = [
        { id: 1, action: 'New member registered', user: 'John Doe', time: '2 hours ago', type: 'member' },
        { id: 2, action: 'Report submitted', user: 'Unit A', time: '4 hours ago', type: 'report' },
        { id: 3, action: 'Form approved', user: 'Sarah Smith', time: '6 hours ago', type: 'form' },
        { id: 4, action: 'Land allocation updated', user: 'Unit B', time: '1 day ago', type: 'land' },
    ];

    const quickActions = [
        { title: 'Zone Management', icon: MapPin, href: '/koabiga/admin/zone', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'Manage Members', icon: Users, href: '/koabiga/admin/members', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'Manage Units', icon: Building2, href: '/koabiga/admin/units', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'View Reports', icon: FileText, href: '/koabiga/admin/reports', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'Fee Rules', icon: DollarSign, href: '/koabiga/admin/fee-rules', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'System Settings', icon: Settings, href: '/koabiga/admin/settings', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'Form Management', icon: ClipboardList, href: '/koabiga/admin/forms', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'System Logs', icon: Eye, href: '/koabiga/admin/logs', color: 'bg-green-600 dark:bg-green-500' },
        { title: 'Page Management', icon: Edit, href: '/koabiga/admin/page-management', color: 'bg-green-600 dark:bg-green-500' },
    ];

    const userPages = [
        { id: 1, title: 'Unit Leader Dashboard', path: '/koabiga/unit-leader/dashboard', status: 'active', lastModified: '2024-06-25' },
        { id: 2, title: 'Unit Leader Members', path: '/koabiga/unit-leader/members', status: 'active', lastModified: '2024-06-24' },
        { id: 3, title: 'Member Dashboard', path: '/koabiga/member/dashboard', status: 'active', lastModified: '2024-06-23' },
        { id: 4, title: 'Member Land', path: '/koabiga/member/land', status: 'active', lastModified: '2024-06-22' },
        { id: 5, title: 'Member Crops', path: '/koabiga/member/crops', status: 'draft', lastModified: '2024-06-21' },
        { id: 6, title: 'Member Produce', path: '/koabiga/member/produce', status: 'inactive', lastModified: '2024-06-20' },
    ];

    const members = [
        { id: 1, name: 'John Doe', phone: '0712345678', role: 'member', unit: 'Unit A', status: 'active', joinDate: '2024-01-15', avatar: null },
        { id: 2, name: 'Sarah Smith', phone: '0723456789', role: 'unit_leader', unit: 'Unit B', status: 'active', joinDate: '2024-02-20', avatar: null },
        { id: 3, name: 'Mike Johnson', phone: '0734567890', role: 'member', unit: 'Unit A', status: 'inactive', joinDate: '2024-03-10', avatar: null },
        { id: 4, name: 'Emily Davis', phone: '0745678901', role: 'member', unit: 'Unit C', status: 'active', joinDate: '2024-01-30', avatar: null },
        { id: 5, name: 'David Wilson', phone: '0756789012', role: 'unit_leader', unit: 'Unit D', status: 'active', joinDate: '2024-02-05', avatar: null },
    ];
    const currentMembers = members.length;
    const previousMembers = 4; // Mock previous value, replace with real data if available
    const percentIncrease = previousMembers > 0 ? (((currentMembers - previousMembers) / previousMembers) * 100).toFixed(1) : '0';

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
            case 'draft':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Draft</Badge>;
            case 'inactive':
                return <Badge variant="outline" className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard - Koabiga" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Admin Dashboard</h1>
                        <p className="text-green-600 dark:text-green-300">Manage your agriculture platform</p>
                    </div>
                    <Badge variant="secondary" className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Admin Role
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/koabiga/admin/members" className="block">
                        <Card className="border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg hover:border-green-400 transition">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Members</CardTitle>
                                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{currentMembers}</div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    +{percentIncrease}% from last month
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/koabiga/admin/units" className="block">
                        <Card className="border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg hover:border-green-400 transition">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Units</CardTitle>
                                <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.totalUnits}</div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Active agricultural units
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/koabiga/admin/reports" className="block">
                        <Card className="border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg hover:border-green-400 transition">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Reports</CardTitle>
                                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.activeReports}</div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Pending review
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/koabiga/admin/fee-rules" className="block">
                        <Card className="border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg hover:border-green-400 transition">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">${stats.totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    This month
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map((action) => (
                        <Link href={action.href} key={action.title} className="block">
                            <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700">
                                <CardHeader className="pb-3">
                                    <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                                        <action.icon className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-sm text-green-700 dark:text-green-300">{action.title}</CardTitle>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Activities */}
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="text-green-800 dark:text-green-200">Recent Activities</CardTitle>
                            <CardDescription className="text-green-600 dark:text-green-400">Latest platform activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-center space-x-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">{activity.action}</p>
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                by {activity.user} • {activity.time}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                                            {activity.type}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Pages Management */}
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="text-green-800 dark:text-green-200">User Pages Management</CardTitle>
                            <CardDescription className="text-green-600 dark:text-green-400">Manage pages for different user roles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {userPages.map((page) => (
                                    <div key={page.id} className="flex items-center justify-between p-3 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex-1">
                                            <Link href={page.path} className="block">
                                                <h4 className="font-medium text-green-800 dark:text-green-200 hover:text-green-600 dark:hover:text-green-300 cursor-pointer">{page.title}</h4>
                                            </Link>
                                            <p className="text-sm text-green-600 dark:text-green-400">{page.path}</p>
                                            <p className="text-xs text-green-500 dark:text-green-400">Modified: {page.lastModified}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusBadge(page.status)}
                                            <Link href={page.path}>
                                                <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900">
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Alerts</CardTitle>
                        <CardDescription>Important notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center space-x-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium">Pending Form Approvals</p>
                                    <p className="text-xs text-muted-foreground">23 forms require review</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">Monthly Report Due</p>
                                    <p className="text-xs text-muted-foreground">Due in 3 days</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">Fee Rules Updated</p>
                                    <p className="text-xs text-muted-foreground">8 active fee rules</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Eye className="h-4 w-4 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium">System Logs</p>
                                    <p className="text-xs text-muted-foreground">156 logs today</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 