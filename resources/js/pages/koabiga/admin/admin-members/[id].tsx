import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

interface Member {
    id: number;
    christian_name: string;
    family_name: string;
    date_of_birth?: string;
    address?: string;
    role: string;
    status: string;
    pin: string;
    phone?: string;
    email?: string;
    unit?: {
        name: string;
        code: string;
    };
}

export default function ViewMember() {
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get member ID from URL
    const memberId = window.location.pathname.split('/').pop();

    useEffect(() => {
        const fetchMember = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`/api/admin/members/${memberId}`);
                
                if (response.data.success) {
                    setMember(response.data.data);
                } else {
                    setError('Failed to fetch member data');
                }
            } catch (err: any) {
                console.error('Error fetching member:', err);
                setError('Failed to fetch member data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchMember();
        }
    }, [memberId]);

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Loading Member - Koabiga Admin" />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading member data...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error || !member) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Error - Koabiga Admin" />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error || 'Member not found'}</p>
                        <Link href="/koabiga/admin/admin-members">
                            <Button variant="secondary">Back to Members</Button>
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbs = [
        { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
        { title: 'Members', href: '/koabiga/admin/admin-members' },
        { title: `${member.christian_name} ${member.family_name}`, href: `/koabiga/admin/admin-members/${member.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`View Member - ${member.christian_name} ${member.family_name}`} />
            <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md sm:max-w-lg shadow-2xl rounded-2xl bg-white dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle>Member Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="font-semibold">Christian Name:</span> {member.christian_name}
                        </div>
                        <div>
                            <span className="font-semibold">Family Name:</span> {member.family_name}
                        </div>
                        {member.date_of_birth && (
                            <div>
                                <span className="font-semibold">Date of Birth:</span> {new Date(member.date_of_birth).toLocaleDateString()}
                            </div>
                        )}
                        {member.address && (
                            <div>
                                <span className="font-semibold">Address:</span> {member.address}
                            </div>
                        )}
                        <div>
                            <span className="font-semibold">ID/Passport:</span> {member.id_passport}
                        </div>
                        {member.phone && (
                            <div>
                                <span className="font-semibold">Phone:</span> {member.phone}
                            </div>
                        )}
                        {member.email && (
                            <div>
                                <span className="font-semibold">Email:</span> {member.email}
                            </div>
                        )}
                        <div>
                            <span className="font-semibold">Role:</span> {member.role}
                        </div>
                        <div>
                            <span className="font-semibold">Status:</span> {member.status}
                        </div>
                        {member.unit && (
                            <div>
                                <span className="font-semibold">Unit:</span> {member.unit.name} ({member.unit.code})
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">PIN/Password:</span>
                            <span className="tracking-widest">{member.pin}</span>
                            <EyeOff className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Link href={`/koabiga/admin/admin-members/${member.id}/edit`}>
                                <Button variant="outline">Edit</Button>
                            </Link>
                            <Link href="/koabiga/admin/admin-members">
                                <Button variant="secondary">Back</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 