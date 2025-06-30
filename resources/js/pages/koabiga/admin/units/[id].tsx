import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Building2, 
    Users, 
    MapPin, 
    TrendingUp, 
    Calendar,
    Phone,
    Edit,
    Trash2,
    ArrowLeft
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function ViewUnit() {
    // Mock data - replace with API call in production
    const unit = {
        id: 1,
        name: 'Unit A',
        code: 'UA001',
        leader: 'Sarah Smith',
        leaderPhone: '0723456789',
        leaderId: 'ID001',
        leaderFamilyName: 'Smith',
        leaderChristianName: 'Sarah',
        totalMembers: 12,
        totalLand: 180,
        status: 'active',
        location: 'North Region',
        establishedDate: '2024-01-15',
        performance: 85,
        avatar: null,
        description: 'A highly productive agricultural unit specializing in maize and bean cultivation.',
        zone: 'North Zone',
        crops: ['Maize', 'Beans', 'Potatoes'],
        equipment: ['Tractor', 'Irrigation System', 'Storage Facility'],
        achievements: [
            'Best performing unit 2023',
            'Exceeded production targets by 15%',
            'Zero safety incidents'
        ]
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'suspended':
                return <Badge variant="destructive">Suspended</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPerformanceBadge = (performance: number) => {
        if (performance >= 90) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
        } else if (performance >= 80) {
            return <Badge variant="default" className="bg-blue-100 text-blue-800">Good</Badge>;
        } else if (performance >= 70) {
            return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Average</Badge>;
        } else {
            return <Badge variant="destructive">Poor</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Units', href: '/koabiga/admin/units' },
            { title: unit.name, href: `/koabiga/admin/units/${unit.id}` },
        ]}>
            <Head title={`${unit.name} - Unit Details`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/koabiga/admin/units">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Units
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{unit.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">Unit Code: {unit.code}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/koabiga/admin/units/${unit.id}/edit`}>
                            <Button className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Unit
                            </Button>
                        </Link>
                        <Link href={`/koabiga/admin/units/${unit.id}/members`}>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                View Members
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{unit.totalMembers}</div>
                            <p className="text-xs text-muted-foreground">Active members</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Land Area</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{unit.totalLand} ha</div>
                            <p className="text-xs text-muted-foreground">Under cultivation</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Performance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{unit.performance}%</div>
                            <p className="text-xs text-muted-foreground">Efficiency rating</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(unit.status)}
                            </div>
                            <p className="text-xs text-muted-foreground">Unit status</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Unit Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Unit Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Avatar>
                                    <AvatarImage src={unit.avatar || undefined} />
                                    <AvatarFallback>
                                        {unit.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{unit.name}</div>
                                    <div className="text-sm text-muted-foreground">{unit.code}</div>
                                </div>
                            </div>
                            
                            <div className="grid gap-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Zone:</span>
                                    <span className="text-sm">{unit.zone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Location:</span>
                                    <span className="text-sm">{unit.location}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Established:</span>
                                    <span className="text-sm">{unit.establishedDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Performance:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{unit.performance}%</span>
                                        {getPerformanceBadge(unit.performance)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unit Leader */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Unit Leader</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Avatar>
                                    <AvatarFallback>
                                        {unit.leader.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{unit.leader}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {unit.leaderPhone}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid gap-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">ID:</span>
                                    <span className="text-sm">{unit.leaderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Christian Name:</span>
                                    <span className="text-sm">{unit.leaderChristianName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Family Name:</span>
                                    <span className="text-sm">{unit.leaderFamilyName}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Crops & Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Crops & Equipment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Crops Cultivated</h4>
                                <div className="flex flex-wrap gap-2">
                                    {unit.crops.map((crop, index) => (
                                        <Badge key={index} variant="outline">{crop}</Badge>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Equipment Available</h4>
                                <div className="flex flex-wrap gap-2">
                                    {unit.equipment.map((item, index) => (
                                        <Badge key={index} variant="secondary">{item}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Achievements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {unit.achievements.map((achievement, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-sm">{achievement}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{unit.description}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 