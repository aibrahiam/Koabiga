import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Users, 
    Search, 
    Plus,
    ArrowLeft,
    Phone,
    MapPin,
    Calendar
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface Unit {
    id: string | number;
    name: string;
    code: string;
    leader: string;
}

interface Member {
    id: number;
    christianName: string;
    familyName: string;
    phone: string;
    role: string;
    status: string;
    joinDate: string;
    landArea: number;
    crops: string[];
    avatar: string | null;
}

interface Props {
    unitId?: number;
    unit?: Unit;
}

export default function UnitMembers({ unitId, unit }: Props) {
    // Use the unit data from props, with fallback
    const currentUnit = unit || {
        id: unitId || 1,
        name: 'Unit A',
        code: 'UA001',
        leader: 'Sarah Smith',
    };

    // Mock data - replace with API call in production
    const members: Member[] = [
        {
            id: 1,
            christianName: 'John',
            familyName: 'Doe',
            phone: '0712345678',
            role: 'Farmer',
            status: 'active',
            joinDate: '2024-01-15',
            landArea: 15,
            crops: ['Maize', 'Beans'],
            avatar: null,
        },
        {
            id: 2,
            christianName: 'Jane',
            familyName: 'Smith',
            phone: '0723456789',
            role: 'Farmer',
            status: 'active',
            joinDate: '2024-02-01',
            landArea: 20,
            crops: ['Potatoes', 'Tomatoes'],
            avatar: null,
        },
        {
            id: 3,
            christianName: 'Mike',
            familyName: 'Johnson',
            phone: '0734567890',
            role: 'Farmer',
            status: 'inactive',
            joinDate: '2024-01-20',
            landArea: 12,
            crops: ['Wheat'],
            avatar: null,
        },
        {
            id: 4,
            christianName: 'Emily',
            familyName: 'Davis',
            phone: '0745678901',
            role: 'Farmer',
            status: 'active',
            joinDate: '2024-03-10',
            landArea: 18,
            crops: ['Maize', 'Soybeans'],
            avatar: null,
        },
        {
            id: 5,
            christianName: 'David',
            familyName: 'Wilson',
            phone: '0756789012',
            role: 'Farmer',
            status: 'active',
            joinDate: '2024-02-15',
            landArea: 25,
            crops: ['Coffee', 'Tea'],
            avatar: null,
        },
    ];

    const [search, setSearch] = useState('');

    const filteredMembers = members.filter(member => {
        const searchLower = search.toLowerCase();
        return (
            member.christianName.toLowerCase().includes(searchLower) ||
            member.familyName.toLowerCase().includes(searchLower) ||
            member.phone.includes(searchLower) ||
            member.role.toLowerCase().includes(searchLower)
        );
    });

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

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Units', href: '/koabiga/admin/units' },
            { title: currentUnit.name, href: `/koabiga/admin/units/${currentUnit.id}` },
            { title: 'Members', href: `/koabiga/admin/units/${currentUnit.id}/members` },
        ]}>
            <Head title={`${currentUnit.name} Members - Koabiga Admin`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/koabiga/admin/units/${currentUnit.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Unit
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentUnit.name} Members</h1>
                            <p className="text-gray-600 dark:text-gray-400">Unit Code: {currentUnit.code} • Leader: {currentUnit.leader}</p>
                        </div>
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
                            <p className="text-xs text-muted-foreground">All members</p>
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
                            <p className="text-xs text-muted-foreground">Currently active</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Land</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {members.reduce((sum, m) => sum + m.landArea, 0)} ha
                            </div>
                            <p className="text-xs text-muted-foreground">Combined area</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Land/Member</CardTitle>
                            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Math.round(members.reduce((sum, m) => sum + m.landArea, 0) / members.length)} ha
                            </div>
                            <p className="text-xs text-muted-foreground">Per member</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search members by name, phone, or role..."
                                    className="pl-8"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Members Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Unit Members</CardTitle>
                        <CardDescription>All members of {currentUnit.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Member</th>
                                        <th className="text-left p-4 font-medium">Contact</th>
                                        <th className="text-left p-4 font-medium">Role</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Land Area</th>
                                        <th className="text-left p-4 font-medium">Crops</th>
                                        <th className="text-left p-4 font-medium">Join Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarImage src={member.avatar || undefined} />
                                                        <AvatarFallback>
                                                            {member.christianName[0]}{member.familyName[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{member.christianName} {member.familyName}</div>
                                                        <div className="text-sm text-muted-foreground">ID: {member.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="text-sm">{member.phone}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{member.role}</span>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(member.status)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{member.landArea} ha</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {member.crops.map((crop, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {crop}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-sm">{member.joinDate}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 