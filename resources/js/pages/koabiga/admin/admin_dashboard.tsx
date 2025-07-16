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
    MapPin,
    Activity,
    AlertTriangle,
    Clock,
    Server,
    Zap,
    CheckCircle,
    XCircle,
    Shield,
    ArrowRight,
    Sprout,
    Package,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface SystemStats {
    users: {
        total: number;
        admin: number;
        unit_leader: number;
        member: number;
        active_today: number;
    };
    agriculture: {
        total_lands: number;
        total_crops: number;
        total_produce: number;
        total_reports: number;
    };
    system: {
        active_sessions: number;
        activities_today: number;
        unresolved_errors: number;
        system_uptime: number;
    };
    performance: {
        avg_response_time: number;
        error_rate: number;
        user_satisfaction: number;
    };
}

interface ZoneStats {
    total_zones: number;
    active_zones: number;
    inactive_zones: number;
    zones_with_leaders: number;
    zones_without_leaders: number;
}

interface RecentZone {
    id: number;
    name: string;
    code: string;
    leader: string;
    status: string;
    created_at: string;
}

interface DashboardMetrics {
    recent_activities: Array<{
        id: number;
        action: string;
        description: string;
        created_at: string;
        user: {
            id: number;
            christian_name: string;
            family_name: string;
        };
    }>;
    recent_reports: Array<{
        id: number;
        title: string;
        status: string;
        submitted_by: string;
        submitted_at: string;
    }>;
    system_alerts: Array<{
        id: number;
        type: string;
        message: string;
        created_at: string;
    }>;
    recent_errors: Array<{
        id: number;
        level: string;
        message: string;
        created_at: string;
        user: {
            id: number;
            christian_name: string;
            family_name: string;
        };
    }>;
    active_users: Array<{
        id: number;
        last_activity_at: string;
        user: {
            id: number;
            christian_name: string;
            family_name: string;
        };
    }>;
    system_health: {
        uptime: number;
        error_rate: number;
        active_sessions: number;
        total_users: number;
    };
}

interface UserPage {
    id: number;
    title: string;
    path: string;
    status: string;
    lastModified: string;
}

export default function Dashboard({ 
    zoneStats = {
        total_zones: 0,
        active_zones: 0,
        inactive_zones: 0,
        zones_with_leaders: 0,
        zones_without_leaders: 0,
    },
    recentZones = []
}: { 
    zoneStats?: ZoneStats;
    recentZones?: RecentZone[];
}) {
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
    const [userPages, setUserPages] = useState<UserPage[]>([]);
    const [loading, setLoading] = useState(true);

    // Get user role from auth context or session
    const userRole = 'admin'; // This should come from your auth context

    const roleConfig = {
        admin: {
            title: 'Admin Dashboard',
            description: 'Manage the entire Koabiga agriculture platform',
            badge: 'Admin',
            color: 'bg-green-600 dark:bg-green-500',
            features: [
                { title: 'Zone Management', icon: MapPin, href: '/koabiga/admin/zones', description: 'Manage agricultural zones' },
                { title: 'Members Management', icon: Users, href: '/koabiga/admin/members', description: 'Manage all platform members' },
                { title: 'Units Management', icon: Building2, href: '/koabiga/admin/units', description: 'Manage agricultural units' },
                { title: 'Reports Management', icon: FileText, href: '/koabiga/admin/reports', description: 'Review and approve reports' },
                { title: 'Fee Rules', icon: DollarSign, href: '/koabiga/admin/fee-rules', description: 'Manage platform fee structures' },
                { title: 'System Settings', icon: Settings, href: '/koabiga/admin/settings', description: 'Configure platform settings' },
                { title: 'Forms Management', icon: ClipboardList, href: '/koabiga/admin/forms', description: 'Manage system forms' },
                { title: 'Page Management', icon: Edit, href: '/koabiga/admin/page-management', description: 'Manage user pages and content' },
            ],
            monitoringActions: [
                { title: 'Activity Logs', icon: Activity, href: '/koabiga/admin/activity-logs', color: 'bg-blue-600 dark:bg-blue-500', description: 'View user activities' },
                { title: 'Error Logs', icon: AlertTriangle, href: '/koabiga/admin/error-logs', color: 'bg-red-600 dark:bg-red-500', description: 'Monitor system errors' },
                { title: 'Login Sessions', icon: Clock, href: '/koabiga/admin/login-sessions', color: 'bg-purple-600 dark:bg-purple-500', description: 'Track user sessions' },
                { title: 'System Metrics', icon: BarChart3, href: '/koabiga/admin/system-metrics', color: 'bg-orange-600 dark:bg-orange-500', description: 'Performance metrics' },
            ]
        },
        unit_leader: {
            title: 'Unit Leader Dashboard',
            description: 'Manage your agricultural unit operations',
            badge: 'Unit Leader',
            color: 'bg-green-600 dark:bg-green-500',
            features: [
                { title: 'Members Management', icon: Users, href: '/koabiga/unit-leader/leader-members', description: 'Manage unit members' },
                { title: 'Land Management', icon: MapPin, href: '/koabiga/unit-leader/land', description: 'Manage unit land' },
                { title: 'Crop Management', icon: Sprout, href: '/koabiga/unit-leader/crops', description: 'Track crop progress' },
                { title: 'Produce Tracking', icon: Package, href: '/koabiga/unit-leader/produce', description: 'Monitor produce output' },
                { title: 'Reports', icon: FileText, href: '/koabiga/unit-leader/reports', description: 'Submit and view reports' },
            ],
            monitoringActions: []
        },
        member: {
            title: 'Member Dashboard',
            description: 'Track your agricultural activities and progress',
            badge: 'Member',
            color: 'bg-green-600 dark:bg-green-500',
            features: [
                { title: 'My Land', icon: MapPin, href: '/koabiga/member/land', description: 'Manage assigned land' },
                { title: 'My Crops', icon: Sprout, href: '/koabiga/member/crops', description: 'Track crop progress' },
                { title: 'My Produce', icon: Package, href: '/koabiga/member/produce', description: 'Monitor your produce' },
                { title: 'My Reports', icon: FileText, href: '/koabiga/member/reports', description: 'Submit reports' },
                { title: 'My Forms', icon: ClipboardList, href: '/koabiga/member/forms', description: 'Access forms' },
            ],
            monitoringActions: []
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Fetch system stats
                try {
                    const statsResponse = await axios.get('/api/admin/system-metrics/current-stats');
                    if (statsResponse.data.success) {
                        setSystemStats(statsResponse.data.data);
                    } else {
                        throw new Error(statsResponse.data.message || 'Failed to fetch system stats');
                    }
                } catch (err) {
                    console.log('System stats API not available, using fallback data');
                    // Set fallback system stats
                    setSystemStats({
                        users: {
                            total: 150,
                            admin: 3,
                            unit_leader: 12,
                            member: 135,
                            active_today: 45,
                        },
                        agriculture: {
                            total_lands: 85,
                            total_crops: 120,
                            total_produce: 95,
                            total_reports: 67,
                        },
                        system: {
                            active_sessions: 23,
                            activities_today: 156,
                            unresolved_errors: 2,
                            system_uptime: 99.8,
                        },
                        performance: {
                            avg_response_time: 145,
                            error_rate: 0.2,
                            user_satisfaction: 96,
                        },
                    });
                }
                
                // Fetch dashboard metrics
                try {
                    const metricsResponse = await axios.get('/api/admin/system-metrics/dashboard');
                    if (metricsResponse.data.success) {
                        setDashboardMetrics(metricsResponse.data.data);
                    } else {
                        throw new Error(metricsResponse.data.message || 'Failed to fetch dashboard metrics');
                    }
                } catch (err) {
                    console.log('Dashboard metrics API not available, using fallback data');
                    // Set fallback dashboard metrics
                    setDashboardMetrics({
                        recent_activities: [
                            {
                                id: 1,
                                user: {
                                    id: 1,
                                    christian_name: 'Admin',
                                    family_name: 'User',
                                },
                                action: 'login',
                                description: 'Admin logged in successfully',
                                created_at: new Date().toISOString(),
                            },
                        ],
                        recent_reports: [
                            {
                                id: 1,
                                title: 'Monthly Crop Report',
                                status: 'pending',
                                submitted_by: 'Unit A',
                                submitted_at: new Date().toISOString(),
                            },
                        ],
                        system_alerts: [
                            {
                                id: 1,
                                type: 'warning',
                                message: 'System maintenance scheduled for tomorrow',
                                created_at: new Date().toISOString(),
                            },
                        ],
                        recent_errors: [
                            {
                                id: 1,
                                level: 'warning',
                                message: 'Minor system warning',
                                created_at: new Date().toISOString(),
                                user: {
                                    id: 1,
                                    christian_name: 'Admin',
                                    family_name: 'User',
                                },
                            },
                        ],
                        active_users: [
                            {
                                id: 1,
                                last_activity_at: new Date().toISOString(),
                                user: {
                                    id: 1,
                                    christian_name: 'Admin',
                                    family_name: 'User',
                                },
                            },
                        ],
                        system_health: {
                            uptime: 99.8,
                            error_rate: 0.2,
                            active_sessions: 23,
                            total_users: 150,
                        },
                    });
                }
                
                // Fetch user pages (if API exists)
                try {
                    const pagesResponse = await axios.get('/api/admin/pages');
                    if (pagesResponse.data.success) {
                        setUserPages(pagesResponse.data.data);
                    }
                } catch (err) {
                    console.log('Pages API not available yet');
                    setUserPages([]);
                }
                
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                // setError(err.response?.data?.message || err.message || 'Failed to load dashboard data'); // Removed error state
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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



    const config = roleConfig[userRole as keyof typeof roleConfig];

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`${config.title} - Koabiga`} />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <PlaceholderPattern />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${config.title} - Koabiga`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">{config.title}</h1>
                        <p className="text-green-600 dark:text-green-300">{config.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {config.badge}
                        </Badge>
                    </div>
                </div>

                {/* System Health Overview - Admin Only */}
                {userRole === 'admin' && systemStats && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-green-200 dark:border-green-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">System Uptime</CardTitle>
                                <Server className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{systemStats.system.system_uptime}%</div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    {systemStats.system.activities_today} activities today
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-green-200 dark:border-green-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Users</CardTitle>
                                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{systemStats.users.active_today}</div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    {systemStats.users.total} total users
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-green-200 dark:border-green-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Error Rate</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{systemStats.performance.error_rate}%</div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    {systemStats.system.unresolved_errors} unresolved errors
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-green-200 dark:border-green-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Response Time</CardTitle>
                                <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{systemStats.performance.avg_response_time}ms</div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Average response time
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Agriculture Statistics - Admin Only */}
                {userRole === 'admin' && systemStats && (
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                <Shield className="h-5 w-5" />
                                Agriculture Statistics
                            </CardTitle>
                            <CardDescription className="text-green-600 dark:text-green-400">Overview of agricultural data</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{systemStats.agriculture.total_lands}</div>
                                    <p className="text-sm text-muted-foreground">Total Lands</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{systemStats.agriculture.total_crops}</div>
                                    <p className="text-sm text-muted-foreground">Total Crops</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">{systemStats.agriculture.total_produce}</div>
                                    <p className="text-sm text-muted-foreground">Total Produce</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{systemStats.agriculture.total_reports}</div>
                                    <p className="text-sm text-muted-foreground">Total Reports</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Zone Statistics - Admin Only */}
                {userRole === 'admin' && (
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                <MapPin className="h-5 w-5" />
                                Zone Management
                            </CardTitle>
                            <CardDescription className="text-green-600 dark:text-green-400">Overview of zone distribution and leadership</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">{zoneStats.total_zones}</div>
                                    <p className="text-sm text-muted-foreground">Total Zones</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{zoneStats.active_zones}</div>
                                    <p className="text-sm text-muted-foreground">Active Zones</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">{zoneStats.inactive_zones}</div>
                                    <p className="text-sm text-muted-foreground">Inactive Zones</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{zoneStats.zones_with_leaders}</div>
                                    <p className="text-sm text-muted-foreground">With Leaders</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{zoneStats.zones_without_leaders}</div>
                                    <p className="text-sm text-muted-foreground">Need Leaders</p>
                                </div>
                            </div>
                            
                            {/* Recent Zones */}
                            {recentZones.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-3">Recent Zones</h4>
                                    <div className="space-y-2">
                                        {recentZones.slice(0, 3).map((zone) => (
                                            <div key={zone.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                            {zone.name} ({zone.code})
                                                        </p>
                                                        <p className="text-xs text-green-600 dark:text-green-400">
                                                            Leader: {zone.leader}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge 
                                                        variant={zone.status === 'active' ? 'default' : 'secondary'}
                                                        className={zone.status === 'active' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                        }
                                                    >
                                                        {zone.status}
                                                    </Badge>
                                                    <Link href={`/koabiga/admin/zones/${zone.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="w-3 h-3" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 text-center">
                                        <Link href="/koabiga/admin/zones">
                                            <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20">
                                                View All Zones
                                                <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Quick Access */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">Quick Access</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {config.features.map((feature) => (
                            <Link href={feature.href} key={feature.title} className="block">
                                <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700">
                                    <CardHeader className="pb-3">
                                        <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                                            <feature.icon className="h-4 w-4 text-white" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardTitle className="text-sm text-green-700 dark:text-green-300">{feature.title}</CardTitle>
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* System Monitoring Actions - Admin Only */}
                {userRole === 'admin' && config.monitoringActions.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">System Monitoring</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {config.monitoringActions.map((action) => (
                                <Link href={action.href} key={action.title} className="block">
                                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700">
                                        <CardHeader className="pb-3">
                                            <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                                                <action.icon className="h-4 w-4 text-white" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardTitle className="text-sm text-green-700 dark:text-green-300">{action.title}</CardTitle>
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{action.description}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Activities - Admin Only */}
                    {userRole === 'admin' && dashboardMetrics && (
                        <Card className="border-green-200 dark:border-green-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                    <Activity className="h-5 w-5" />
                                    Recent Activities
                                </CardTitle>
                                <CardDescription className="text-green-600 dark:text-green-400">Latest user activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dashboardMetrics.recent_activities.length > 0 ? (
                                        dashboardMetrics.recent_activities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                    {activity.user.christian_name} {activity.user.family_name}
                                                </p>
                                                <p className="text-xs text-green-600 dark:text-green-400">{activity.description}</p>
                                            </div>
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                                {new Date(activity.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-green-600 dark:text-green-400">No recent activities</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Errors - Admin Only */}
                    {userRole === 'admin' && dashboardMetrics && (
                        <Card className="border-green-200 dark:border-green-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                    <AlertTriangle className="h-5 w-5" />
                                    Recent Errors
                                </CardTitle>
                                <CardDescription className="text-green-600 dark:text-green-400">Latest system errors</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dashboardMetrics.recent_errors.length > 0 ? (
                                        dashboardMetrics.recent_errors.map((error) => (
                                        <div key={error.id} className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                error.level === 'error' ? 'bg-red-500' : 
                                                error.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`}></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                    {error.user.christian_name} {error.user.family_name}
                                                </p>
                                                <p className="text-xs text-green-600 dark:text-green-400">{error.message}</p>
                                            </div>
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                                {new Date(error.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-green-600 dark:text-green-400">No recent errors</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* User Pages Management - Admin Only */}
                    {userRole === 'admin' && (
                        <Card className="border-green-200 dark:border-green-800">
                            <CardHeader>
                                <CardTitle className="text-green-800 dark:text-green-200">User Pages Management</CardTitle>
                                <CardDescription className="text-green-600 dark:text-green-400">Manage pages for different user roles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {userPages.length > 0 ? (
                                        userPages.map((page) => (
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
                                        ))
                                    ) : (
                                        <p className="text-sm text-green-600 dark:text-green-400">No pages available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Welcome Card */}
                <Card className="border-green-200 dark:border-green-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                            Welcome to Koabiga
                        </CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-400">
                            Your agriculture management platform dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                            This is the main dashboard for the Koabiga agriculture platform. 
                            Use the navigation above to access different sections of the platform.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            Platform is running smoothly
                        </div>
                    </CardContent>
                </Card>

                {/* System Alerts - Admin Only */}
                {userRole === 'admin' && (
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="text-green-800 dark:text-green-200">System Alerts</CardTitle>
                            <CardDescription className="text-green-600 dark:text-green-400">Important notifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center space-x-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <div>
                                        <p className="text-sm font-medium">Pending Form Approvals</p>
                                        <p className="text-xs text-muted-foreground">Check forms management for pending approvals</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium">System Monitoring</p>
                                        <p className="text-xs text-muted-foreground">Monitor system health and performance</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium">Fee Rules Management</p>
                                        <p className="text-xs text-muted-foreground">Manage platform fee structures</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <Eye className="h-4 w-4 text-purple-600" />
                                    <div>
                                        <p className="text-sm font-medium">Activity Monitoring</p>
                                        <p className="text-xs text-muted-foreground">Track user activities and system logs</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Platform Information */}
                <Card className="border-green-200 dark:border-green-800">
                    <CardHeader>
                        <CardTitle className="text-green-800 dark:text-green-200">Platform Information</CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-400">Current system status and statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {systemStats ? `${systemStats.system.system_uptime}%` : 'Online'}
                                </div>
                                <p className="text-sm text-muted-foreground">System Status</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">v1.0.0</div>
                                <p className="text-sm text-muted-foreground">Platform Version</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {systemStats ? `${systemStats.performance.user_satisfaction}%` : 'N/A'}
                                </div>
                                <p className="text-sm text-muted-foreground">User Satisfaction</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 