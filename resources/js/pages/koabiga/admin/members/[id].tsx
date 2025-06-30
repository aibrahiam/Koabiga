import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { EyeOff } from 'lucide-react';

// Mock member data (replace with real data from backend or props)
const mockMember = {
    id: 1,
    christianName: 'John',
    familyName: 'Doe',
    idPassport: 'A1234567',
    role: 'member',
    status: 'active',
    pin: '********', // Masked
};

export default function ViewMember() {
    // In a real app, fetch member data by ID from backend or props
    const member = mockMember;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Members', href: '/koabiga/admin/members' },
            { title: `${member.christianName} ${member.familyName}`, href: `/koabiga/admin/members/${member.id}` },
        ]}>
            <Head title={`View Member - ${member.christianName} ${member.familyName}`} />
            <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md sm:max-w-lg shadow-2xl rounded-2xl bg-white dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle>Member Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="font-semibold">Christian Name:</span> {member.christianName}
                        </div>
                        <div>
                            <span className="font-semibold">Family Name:</span> {member.familyName}
                        </div>
                        <div>
                            <span className="font-semibold">ID/Passport:</span> {member.idPassport}
                        </div>
                        <div>
                            <span className="font-semibold">Role:</span> {member.role}
                        </div>
                        <div>
                            <span className="font-semibold">Status:</span> {member.status}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">PIN/Password:</span>
                            <span className="tracking-widest">{member.pin}</span>
                            <EyeOff className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Link href={`/koabiga/admin/members/${member.id}/edit`}>
                                <Button variant="outline">Edit</Button>
                            </Link>
                            <Link href="/koabiga/admin/members">
                                <Button variant="secondary">Back</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 