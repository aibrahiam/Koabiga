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
    id: number;
    name: string;
    code: string;
    zone: {
        id: number;
        name: string;
        code: string;
    };
    leader?: {
        id: number;
        christian_name: string;
        family_name: string;
        phone: string;
        secondary_phone?: string;
    };
}

interface Member {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
    secondary_phone?: string;
    status: string;
    created_at: string;
    land_area?: number;
    crops?: string[];
}

interface UnitMembersProps {
    unit: Unit;
    members: Member[];
}

export default function UnitMembers({ unit, members }: UnitMembersProps) {
    const [search, setSearch] = useState('');

    const filteredMembers = members.filter(member => {
        const searchLower = search.toLowerCase();
        return (
            member.christian_name.toLowerCase().includes(searchLower) ||
            member.family_name.toLowerCase().includes(searchLower) ||
            member.phone.includes(searchLower) ||
            member.status.toLowerCase().includes(searchLower)
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

    const totalLand = members.reduce((sum, m) => sum + (m.land_area || 0), 0);
    const avgLandPerMember = members.length > 0 ? Math.round(totalLand / members.length) : 0;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Units', href: '/koabiga/admin/admin-units' },
            { title: unit.name, href: `/koabiga/admin/admin-units/${unit.id}` },
            { title: 'Members', href: `/koabiga/admin/admin-units/${unit.id}/members` },
        ]}>
            <Head title={`${unit.name} Members - Koabiga Admin`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/koabiga/admin/admin-units/${unit.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to {unit.name}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{unit.name} Members</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Unit Code: {unit.code} • Zone: {unit.zone.name}
                                {unit.leader && ` • Leader: ${unit.leader.christian_name} ${unit.leader.family_name}`}
                            </p>
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
                                {totalLand} ha
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
                                {avgLandPerMember} ha
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
                                    placeholder="Search members by name, phone, or status..."
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
                        <CardDescription>All members of {unit.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Member</th>
                                        <th className="text-left p-4 font-medium">Contact</th>
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
                                                        <AvatarImage src={undefined} />
                                                        <AvatarFallback>
                                                            {member.christian_name[0]}{member.family_name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{member.christian_name} {member.family_name}</div>
                                                        <div className="text-sm text-muted-foreground">ID: {member.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="text-sm">{member.phone}</span>
                                                </div>
                                                {member.secondary_phone && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span className="text-sm text-muted-foreground">{member.secondary_phone}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(member.status)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{member.land_area || 0} ha</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {member.crops && member.crops.length > 0 ? (
                                                        member.crops.map((crop, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {crop}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No crops</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-sm">{new Date(member.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {filteredMembers.length === 0 && (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {search ? 'No members found matching your search.' : 'No members assigned to this unit yet.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 