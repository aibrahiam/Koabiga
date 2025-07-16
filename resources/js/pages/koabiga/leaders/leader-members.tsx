import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Eye,
    Mail,
    Phone,
    MapPin,
    LoaderCircle,
    AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

import UnitLeaderLayout from '@/layouts/unit-leader-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/unit-leader/dashboard',
    },
    {
        title: 'Members',
        href: '/koabiga/unit-leader/leader-members',
    },
];

interface Member {
    id: number;
    christian_name: string;
    family_name: string;
    email: string | null;
    phone: string;
    role: string;
    status: string;
    created_at: string;
    unit_id: number | null;
    unit?: {
        name: string;
        code: string;
    };
    assignedLand?: number;
    completedTasks?: number;
}

interface UnitStats {
    totalMembers: number;
    activeMembers: number;
    totalLandArea: number;
    completedTasks: number;
}

export default function UnitLeaderMembers() {
    const [members, setMembers] = useState<Member[]>([]);
    const [unitStats, setUnitStats] = useState<UnitStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchMembersData();
    }, []);

    const fetchMembersData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch unit statistics
            const statsResponse = await axios.get('/api/leaders/stats');
            if (statsResponse.data.success) {
                const stats = statsResponse.data.data;
                setUnitStats({
                    totalMembers: stats.totalMembers || 0,
                    activeMembers: stats.activeMembers || 0,
                    totalLandArea: stats.totalLandArea || 0,
                    completedTasks: stats.completedTasks || 0
                });
            }

            // Fetch members
            const membersResponse = await axios.get('/api/leaders/members');
            if (membersResponse.data.success) {
                setMembers(membersResponse.data.data || []);
            } else {
                setError(membersResponse.data.message || 'Failed to fetch members');
            }
        } catch (err: any) {
            console.error('Error fetching members data:', err);
            if (err.response?.status === 401) {
                setError('Authentication required. Please login as unit leader.');
            } else {
                setError(err.response?.data?.message || 'Failed to load members data');
            }
        } finally {
            setLoading(false);
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

    const filteredMembers = members.filter(member => {
        const matchesSearch = 
            member.christian_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone.includes(searchTerm) ||
            (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <UnitLeaderLayout breadcrumbs={breadcrumbs}>
                <Head title="Unit Members - Koabiga" />
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
                <Head title="Unit Members - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button onClick={fetchMembersData} variant="outline">
                        Retry
                    </Button>
                </div>
            </UnitLeaderLayout>
        );
    }

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit Members - Koabiga" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unit Members</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your unit members and their activities</p>
                    </div>
                                            <Link href="/koabiga/leaders/forms/member-creation">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Member
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{unitStats?.totalMembers || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                In your unit
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Active Members</CardTitle>
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{unitStats?.activeMembers || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Land Area</CardTitle>
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{unitStats?.totalLandArea || 0} ha</div>
                            <p className="text-xs text-muted-foreground">
                                Under management
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Completed Tasks</CardTitle>
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{unitStats?.completedTasks || 0}</div>
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
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <div className="grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                            <Card key={member.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                        <div className="flex items-center justify-center sm:justify-start space-x-3">
                                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                                <AvatarImage src={undefined} />
                                                <AvatarFallback>
                                                    {member.christian_name[0]}{member.family_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 text-center sm:text-left">
                                                <CardTitle className="text-base sm:text-lg">
                                                    {member.christian_name} {member.family_name}
                                                </CardTitle>
                                                <CardDescription className="text-xs sm:text-sm">
                                                    {member.email || member.phone}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex justify-center sm:justify-end">
                                            {getStatusBadge(member.status)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs sm:text-sm">Phone</p>
                                            <p className="font-medium text-xs sm:text-sm">{member.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs sm:text-sm">Join Date</p>
                                            <p className="font-medium text-xs sm:text-sm">
                                                {new Date(member.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs sm:text-sm">Unit</p>
                                            <p className="font-medium text-xs sm:text-sm">
                                                {member.unit ? `${member.unit.name} (${member.unit.code})` : 'Not Assigned'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs sm:text-sm">Role</p>
                                            <p className="font-medium text-xs sm:text-sm capitalize">{member.role}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-2 pt-2 gap-2">
                                        <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">View</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                                            <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                                            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Members Found</h3>
                            <p className="text-sm text-muted-foreground">
                                {searchTerm || statusFilter !== 'all' 
                                    ? 'No members match your search criteria.' 
                                    : 'No members have been added to your unit yet.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </UnitLeaderLayout>
    );
} 