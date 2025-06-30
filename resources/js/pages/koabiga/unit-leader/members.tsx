import { Head } from '@inertiajs/react';
import { 
    Users, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Eye,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/unit-leader/dashboard',
    },
    {
        title: 'Members',
        href: '/koabiga/unit-leader/members',
    },
];

export default function UnitLeaderMembers() {
    // Mock data for demonstration
    const members = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@koabiga.com',
            phone: '+1 (555) 123-4567',
            role: 'member',
            status: 'active',
            joinDate: '2024-01-15',
            assignedLand: 15,
            completedTasks: 45,
            avatar: null,
        },
        {
            id: 2,
            name: 'Sarah Smith',
            email: 'sarah.smith@koabiga.com',
            phone: '+1 (555) 234-5678',
            role: 'member',
            status: 'active',
            joinDate: '2024-02-20',
            assignedLand: 12,
            completedTasks: 38,
            avatar: null,
        },
        {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.johnson@koabiga.com',
            phone: '+1 (555) 345-6789',
            role: 'member',
            status: 'inactive',
            joinDate: '2024-03-10',
            assignedLand: 8,
            completedTasks: 22,
            avatar: null,
        },
        {
            id: 4,
            name: 'Emily Davis',
            email: 'emily.davis@koabiga.com',
            phone: '+1 (555) 456-7890',
            role: 'member',
            status: 'active',
            joinDate: '2024-01-30',
            assignedLand: 18,
            completedTasks: 52,
            avatar: null,
        },
        {
            id: 5,
            name: 'David Wilson',
            email: 'david.wilson@koabiga.com',
            phone: '+1 (555) 567-8901',
            role: 'member',
            status: 'active',
            joinDate: '2024-02-05',
            assignedLand: 10,
            completedTasks: 29,
            avatar: null,
        },
    ];

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit Members - Koabiga" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unit Members</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your unit members and their activities</p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Member
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{members.length}</div>
                            <p className="text-xs text-muted-foreground">
                                In your unit
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {members.filter(m => m.status === 'active').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Land Area</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {members.reduce((sum, m) => sum + m.assignedLand, 0)} ha
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Under management
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {members.reduce((sum, m) => sum + m.completedTasks, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-1 items-center space-x-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search members..."
                                        className="pl-8"
                                    />
                                </div>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Members Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                        <Card key={member.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={member.avatar || undefined} />
                                        <AvatarFallback>
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{member.name}</CardTitle>
                                        <CardDescription>{member.email}</CardDescription>
                                    </div>
                                    {getStatusBadge(member.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Phone</p>
                                        <p className="font-medium">{member.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Join Date</p>
                                        <p className="font-medium">{member.joinDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Assigned Land</p>
                                        <p className="font-medium">{member.assignedLand} ha</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Tasks Completed</p>
                                        <p className="font-medium">{member.completedTasks}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 pt-2">
                                    <Button variant="ghost" size="sm" className="flex-1">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                    </Button>
                                    <Button variant="ghost" size="sm" className="flex-1">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
} 