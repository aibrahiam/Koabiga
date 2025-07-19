import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Users, MapPin, Phone, Calendar, Building2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';

interface Unit {
    id: number;
    name: string;
    code: string;
    zone_id: number;
    leader_id?: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
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
    members?: Array<{
        id: number;
        christian_name: string;
        family_name: string;
        phone: string;
        status: string;
    }>;
}

interface ViewUnitProps {
    unit: Unit;
}

export default function ViewUnit({ unit }: ViewUnitProps) {
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
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/koabiga/admin' },
            { title: 'Units Management', href: '/koabiga/admin/admin-units' },
            { title: unit.name, href: `/koabiga/admin/admin-units/${unit.id}` }
        ]}>
            <Head title={`${unit.name} - Unit Details`} />
            
            <div className="flex flex-col items-center justify-center min-h-screen py-8">
                <div className="w-full max-w-4xl space-y-6">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">
                                {unit.name}
                            </h1>
                            <p className="text-green-600 dark:text-green-300 mt-1">
                                Unit Code: {unit.code} • {unit.zone.name}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-4xl space-y-4">
                            {/* Back Button */}
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.visit('/koabiga/admin/admin-units')}
                                    className="flex items-center"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Units
                                </Button>
                            </div>

                            {/* Unit Information */}
                            <Card className="border-green-200 dark:border-green-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                        <Building2 className="h-5 w-5" />
                                        Unit Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                {unit.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-green-800 dark:text-green-200">{unit.name}</div>
                                            <Badge variant="outline" className="font-mono">{unit.code}</Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Zone:</span>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-800 dark:text-green-200">{unit.zone.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Status:</span>
                                            {getStatusBadge(unit.status)}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Created:</span>
                                            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(unit.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Last Updated:</span>
                                            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(unit.updated_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Unit Leader */}
                            <Card className="border-green-200 dark:border-green-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                        <Users className="h-5 w-5" />
                                        Unit Leader
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {unit.leader ? (
                                        <>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {unit.leader.christian_name[0]}{unit.leader.family_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-green-800 dark:text-green-200">
                                                        {unit.leader.christian_name} {unit.leader.family_name}
                                                    </div>
                                                    <div className="text-sm text-green-600 dark:text-green-400">Unit Leader</div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid gap-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Primary Phone:</span>
                                                    <div className="flex items-center gap-1 text-sm text-green-800 dark:text-green-200">
                                                        <Phone className="w-3 h-3" />
                                                        {unit.leader.phone}
                                                    </div>
                                                </div>
                                                {unit.leader.secondary_phone && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Secondary Phone:</span>
                                                        <div className="flex items-center gap-1 text-sm text-green-800 dark:text-green-200">
                                                            <Phone className="w-3 h-3" />
                                                            {unit.leader.secondary_phone}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">No leader assigned to this unit</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Unit Members */}
                            <Card className="border-green-200 dark:border-green-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                        <Users className="h-5 w-5" />
                                        Unit Members
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {unit.members && unit.members.length > 0 ? (
                                        <div className="space-y-3">
                                            {unit.members.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                {member.christian_name[0]}{member.family_name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-green-800 dark:text-green-200">
                                                                {member.christian_name} {member.family_name}
                                                            </div>
                                                            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {member.phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(member.status)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">No members assigned to this unit</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.visit('/koabiga/admin/admin-units')}
                                >
                                    Back to Units
                                </Button>
                                <Button
                                    onClick={() => router.visit(`/koabiga/admin/admin-units/${unit.id}/edit-unit`)}
                                    className="flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Unit
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 