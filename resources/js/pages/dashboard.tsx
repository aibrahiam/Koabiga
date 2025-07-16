import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    MapPin, 
    Sprout, 
    Package, 
    FileText, 
    Settings,
    ArrowRight,
    Shield,
    TrendingUp,
    Building2,
    DollarSign,
    Eye,
    Edit
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    // Mock user role - in real app this would come from auth context
    const userRole = 'admin'; // Can be 'admin', 'unit_leader', or 'member'

    const roleConfig = {
        admin: {
            title: 'Admin Dashboard',
            description: 'Manage the entire Koabiga agriculture platform',
            badge: 'Admin',
            color: 'bg-green-600 dark:bg-green-500',
            features: [
                { title: 'Members Management', icon: Users, href: '/koabiga/admin/members', description: 'Manage all platform members' },
                { title: 'Units Management', icon: Building2, href: '/koabiga/admin/units', description: 'Manage agricultural units' },
                { title: 'Reports Management', icon: FileText, href: '/koabiga/admin/reports', description: 'Review and approve reports' },
                { title: 'Fee Rules', icon: DollarSign, href: '/koabiga/admin/fee-rules', description: 'Manage platform fee structures' },
                { title: 'System Settings', icon: Settings, href: '/koabiga/admin/settings', description: 'Configure platform settings' },
                { title: 'Forms Management', icon: FileText, href: '/koabiga/admin/forms', description: 'Manage system forms' },
                { title: 'System Logs', icon: Eye, href: '/koabiga/admin/logs', description: 'Monitor system activities' },
                { title: 'Page Management', icon: Edit, href: '/koabiga/admin/page-management', description: 'Manage user pages and content' },
            ]
        },
        unit_leader: {
            title: 'Unit Leader Dashboard',
            description: 'Manage your agricultural unit operations',
            badge: 'Unit Leader',
            color: 'bg-green-600 dark:bg-green-500',
            features: [
                { title: 'Members Management', icon: Users, href: '/koabiga/unit-leader/members', description: 'Manage unit members' },
                { title: 'Land Management', icon: MapPin, href: '/koabiga/unit-leader/land', description: 'Manage unit land' },
                { title: 'Crop Management', icon: Sprout, href: '/koabiga/unit-leader/crops', description: 'Track crop progress' },
                { title: 'Produce Tracking', icon: Package, href: '/koabiga/unit-leader/produce', description: 'Monitor produce output' },
                { title: 'Reports', icon: FileText, href: '/koabiga/unit-leader/reports', description: 'Submit and view reports' },
            ]
        },
        member: {
            title: 'Member Dashboard',
            description: 'Track your agricultural activities and progress',
            badge: 'Member',
            color: 'bg-green-600 dark:bg-green-500',
            features: [
                { title: 'My Land', icon: MapPin, href: '/koabiga/members/land', description: 'Manage assigned land' },
                { title: 'My Crops', icon: Sprout, href: '/koabiga/members/crops', description: 'Track crop progress' },
                { title: 'My Produce', icon: Package, href: '/koabiga/members/produce', description: 'Monitor your produce' },
                { title: 'My Reports', icon: FileText, href: '/koabiga/members/reports', description: 'Submit reports' },
                { title: 'My Forms', icon: FileText, href: '/koabiga/members/forms', description: 'Access forms' },
            ]
        }
    };

    const config = roleConfig[userRole as keyof typeof roleConfig];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${config.title} - Koabiga`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{config.title}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{config.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        {config.badge}
                    </Badge>
                </div>

                {/* Welcome Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                            Welcome to Koabiga
                        </CardTitle>
                        <CardDescription>
                            Your agriculture management platform dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            This is the main dashboard for the Koabiga agriculture platform. 
                            Use the navigation below to access different sections of the platform.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            Platform is running smoothly
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Access */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {config.features.map((feature) => (
                            <Card key={feature.title} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                                        <feature.icon className="h-4 w-4 text-white" />
                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-sm mb-2">{feature.title}</CardTitle>
                                    <CardDescription className="text-xs mb-3">
                                        {feature.description}
                                    </CardDescription>
                                    <Button variant="ghost" size="sm" className="w-full">
                                        Access
                                        <ArrowRight className="h-3 w-3 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Platform Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Information</CardTitle>
                        <CardDescription>Current system status and statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">Online</div>
                                <p className="text-sm text-muted-foreground">System Status</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">v1.0.0</div>
                                <p className="text-sm text-muted-foreground">Platform Version</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">99.9%</div>
                                <p className="text-sm text-muted-foreground">Uptime</p>
                            </div>
                </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
