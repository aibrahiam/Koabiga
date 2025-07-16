import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { 
    EyeOff, 
    Phone, 
    User, 
    MapPin, 
    Building2, 
    Calendar,
    Shield,
    Mail
} from 'lucide-react';

interface Member {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
    secondary_phone?: string;
    national_id: string;
    gender: 'male' | 'female';
    role: 'member' | 'unit_leader' | 'zone_leader';
    status: 'active' | 'inactive';
    unit_id?: number;
    zone_id?: number;
    unit?: {
        id: number;
        name: string;
        code: string;
    };
    zone?: {
        id: number;
        name: string;
        code: string;
    };
    created_at: string;
    updated_at: string;
}

interface ViewMemberProps {
    member: Member;
}

export default function ViewMember({ member }: ViewMemberProps) {
    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'zone_leader':
                return 'default';
            case 'unit_leader':
                return 'secondary';
            case 'member':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        return status === 'active' ? 'default' : 'destructive';
    };

    const getGenderIcon = (gender: string) => {
        return gender === 'male' ? '👨' : '👩';
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/koabiga/admin' },
            { title: 'Members Management', href: '/koabiga/admin/members' },
            { title: `${member.christian_name} ${member.family_name}`, href: `/koabiga/admin/members/${member.id}` },
        ]}>
            <Head title={`View Member - ${member.christian_name} ${member.family_name}`} />
            
            <div className="flex flex-col items-center justify-center min-h-screen py-8">
                <div className="w-full max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">
                                Member Details
                            </h1>
                            <p className="text-green-600 dark:text-green-300 mt-1">
                                View complete information for {member.christian_name} {member.family_name}
                            </p>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.history.back()}
                                className="flex items-center"
                            >
                                ← Back
                            </Button>
                        </div>
                    </div>

                    {/* Member Details Card */}
                    <div className="flex justify-center">
                        <Card className="w-full max-w-2xl shadow-2xl rounded-2xl bg-white dark:bg-gray-900">
                            <CardHeader className="text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-2xl">
                                        {getGenderIcon(member.gender)}
                                    </div>
                                </div>
                                <CardTitle className="text-2xl">
                                    {member.christian_name} {member.family_name}
                                </CardTitle>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <Badge variant={getRoleBadgeVariant(member.role)}>
                                        {member.role.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <Badge variant={getStatusBadgeVariant(member.status)}>
                                        {member.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Christian Name:</span>
                                            <p className="text-lg">{member.christian_name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Family Name:</span>
                                            <p className="text-lg">{member.family_name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Gender:</span>
                                            <p className="text-lg capitalize">{member.gender}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">National ID:</span>
                                            <p className="text-lg">{member.national_id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Primary Phone:</span>
                                            <p className="text-lg">{member.phone}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Secondary Phone:</span>
                                            <p className="text-lg">
                                                {member.secondary_phone ? member.secondary_phone : (
                                                    <span className="text-gray-400 italic">Not provided</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Organizational Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Organizational Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Zone:</span>
                                            <p className="text-lg">
                                                {member.zone ? (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        {member.zone.name} ({member.zone.code})
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Not assigned</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Unit:</span>
                                            <p className="text-lg">
                                                {member.unit ? (
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4" />
                                                        {member.unit.name} ({member.unit.code})
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Not assigned</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Account Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Member ID:</span>
                                            <p className="text-lg font-mono">#{member.id}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">PIN/Password:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg tracking-widest">•••••</span>
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Timestamps
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Joined:</span>
                                            <p className="text-lg">{new Date(member.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600 dark:text-gray-400">Last Updated:</span>
                                            <p className="text-lg">{new Date(member.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 justify-end pt-6 border-t">
                                    <Link href={`/koabiga/admin/members/${member.id}/edit`}>
                                        <Button variant="outline">
                                            Edit Member
                                        </Button>
                                    </Link>
                                    <Link href="/koabiga/admin/members">
                                        <Button variant="secondary">
                                            Back to Members
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 