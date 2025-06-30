import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Trash2,
    Eye,
    Mail,
    SortAsc
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

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
        title: 'Admin Dashboard',
        href: '/koabiga/admin/dashboard',
    },
    {
        title: 'Members',
        href: '/koabiga/admin/members',
    },
];

export default function AdminMembers() {
    // Mock data for demonstration
    const members = [
        {
            id: 1,
            name: 'John Doe',
            phone: '0712345678',
            role: 'member',
            unit: 'Unit A',
            status: 'active',
            joinDate: '2024-01-15',
            avatar: null,
        },
        {
            id: 2,
            name: 'Sarah Smith',
            phone: '0723456789',
            role: 'unit_leader',
            unit: 'Unit B',
            status: 'active',
            joinDate: '2024-02-20',
            avatar: null,
        },
        {
            id: 3,
            name: 'Mike Johnson',
            phone: '0734567890',
            role: 'member',
            unit: 'Unit A',
            status: 'inactive',
            joinDate: '2024-03-10',
            avatar: null,
        },
        {
            id: 4,
            name: 'Emily Davis',
            phone: '0745678901',
            role: 'member',
            unit: 'Unit C',
            status: 'active',
            joinDate: '2024-01-30',
            avatar: null,
        },
        {
            id: 5,
            name: 'David Wilson',
            phone: '0756789012',
            role: 'unit_leader',
            unit: 'Unit D',
            status: 'active',
            joinDate: '2024-02-05',
            avatar: null,
        },
    ];

    const [sortBy, setSortBy] = useState<'name' | 'role' | 'status' | 'joinDate'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [memberList, setMemberList] = useState(members);
    const [search, setSearch] = useState('');

    const sortedMembers = [...memberList].sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'role':
                aValue = a.role.toLowerCase();
                bValue = b.role.toLowerCase();
                break;
            case 'status':
                aValue = a.status.toLowerCase();
                bValue = b.status.toLowerCase();
                break;
            case 'joinDate':
                aValue = a.joinDate;
                bValue = b.joinDate;
                break;
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
        }
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredMembers = sortedMembers.filter((member) => {
        const searchLower = search.toLowerCase();
        return (
            member.name.toLowerCase().includes(searchLower) ||
            (member.phone && member.phone.includes(searchLower))
        );
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge variant="destructive">Admin</Badge>;
            case 'unit_leader':
                return <Badge variant="default">Unit Leader</Badge>;
            case 'member':
                return <Badge variant="secondary">Member</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
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

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            setMemberList(memberList.filter((m) => m.id !== id));
            // Here you would also call your backend to delete the member
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Members Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Members Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage platform members and their roles</p>
                    </div>
                    <Link href="/koabiga/admin/members/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Member
                        </Button>
                    </Link>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-1 items-center space-x-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search members by name, email, or phone..."
                                        className="pl-8"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <SortAsc className="h-4 w-4 mr-2" />
                                            Sort By
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy('role')}>Role</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy('status')}>Status</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy('joinDate')}>Join Date</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                                            {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Members Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Members ({members.length})</CardTitle>
                        <CardDescription>Manage member accounts and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Member</th>
                                        <th className="text-left p-4 font-medium">Role</th>
                                        <th className="text-left p-4 font-medium">Unit</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Join Date</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
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
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{member.name}</div>
                                                        <div className="text-xs text-muted-foreground">{member.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getRoleBadge(member.role)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{member.unit}</span>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(member.status)}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{member.joinDate}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/koabiga/admin/members/${member.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/koabiga/admin/members/${member.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(member.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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