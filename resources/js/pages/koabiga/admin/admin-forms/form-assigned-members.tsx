import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Users, UserCheck, UserX, LoaderCircle, AlertTriangle, CheckCircle, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { BreadcrumbItem } from '@/components/ui/breadcrumb';

interface FormData {
    id: number;
    title: string;
    type: string;
    category: string;
    description: string;
    status: string;
    target_roles: string[];
}

interface AssignedMember {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
    email?: string;
    role: string;
    status: string;
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
    assigned_date: string;
    submission_status: 'pending' | 'submitted' | 'approved' | 'rejected';
    last_activity?: string;
}

interface AssignmentStats {
    total_assigned: number;
    pending_submissions: number;
    submitted_forms: number;
    approved_forms: number;
    rejected_forms: number;
}

export default function FormAssignedMembers() {
    const [formData, setFormData] = useState<FormData | null>(null);
    const [assignedMembers, setAssignedMembers] = useState<AssignedMember[]>([]);
    const [stats, setStats] = useState<AssignmentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get form ID from URL
    const pathSegments = window.location.pathname.split('/');
    const formId = pathSegments[pathSegments.length - 2]; // Get the ID before 'assigned-members'

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/koabiga/admin/dashboard',
        },
        {
            title: 'Forms Management',
            href: '/koabiga/admin/admin-forms',
        },
        {
            title: 'Form Details',
            href: `/koabiga/admin/admin-forms/${formId}`,
        },
        {
            title: 'Assigned Members',
            href: `/koabiga/admin/admin-forms/${formId}/assigned-members`,
        },
    ];

    const fetchFormData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(`/api/admin/forms/${formId}`);
            
            if (response.data.success) {
                setFormData(response.data.data);
            } else {
                setError('Failed to fetch form data');
            }
        } catch (err) {
            setError('Failed to fetch form data');
            console.error('Error fetching form data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedMembers = async () => {
        try {
            const response = await axios.get(`/api/admin/forms/${formId}/assigned-members`);
            if (response.data.success) {
                setAssignedMembers(response.data.data.members || []);
                setStats(response.data.data.stats || null);
            }
        } catch (err) {
            console.error('Error fetching assigned members:', err);
            // Set empty data if API doesn't exist yet
            setAssignedMembers([]);
            setStats({
                total_assigned: 0,
                pending_submissions: 0,
                submitted_forms: 0,
                approved_forms: 0,
                rejected_forms: 0
            });
        }
    };

    useEffect(() => {
        if (formId) {
            fetchFormData();
            fetchAssignedMembers();
        }
    }, [formId]);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary" className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getSubmissionStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
            case 'submitted':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Submitted</Badge>;
            case 'approved':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return <Badge variant="outline" className="border-purple-200 text-purple-700">Admin</Badge>;
            case 'unit_leader':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Unit Leader</Badge>;
            case 'member':
                return <Badge variant="outline" className="border-green-200 text-green-700">Member</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Assigned Members - Koabiga Admin" />
                <div className="flex flex-col gap-6 p-6">
                    <div className="text-center">Loading assigned members...</div>
                </div>
            </AppLayout>
        );
    }

    if (error || !formData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Assigned Members - Koabiga Admin" />
                <div className="flex flex-col gap-6 p-6">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error || 'Form not found'}</AlertDescription>
                    </Alert>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${formData.title} - Assigned Members - Koabiga Admin`} />
            
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/koabiga/admin/admin-forms/${formId}`}>
                            <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Form
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Assigned Members</h1>
                            <p className="text-green-600 dark:text-green-400">Members assigned to: {formData.title}</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-5">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Total Assigned
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                    {stats.total_assigned}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-yellow-700 dark:text-yellow-300 text-sm flex items-center gap-2">
                                    <UserX className="h-4 w-4" />
                                    Pending
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                                    {stats.pending_submissions}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    Submitted
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                    {stats.submitted_forms}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Approved
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                    {stats.approved_forms}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Rejected
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                                    {stats.rejected_forms}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Assigned Members Table */}
                <Card className="border-green-200 dark:border-green-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <Users className="h-5 w-5" />
                            Assigned Members List
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-green-200 dark:divide-green-800">
                                <thead className="bg-green-50 dark:bg-green-900/10">
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Member</th>
                                        <th className="text-left p-4 font-medium">Role</th>
                                        <th className="text-left p-4 font-medium">Unit</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Submission Status</th>
                                        <th className="text-left p-4 font-medium">Assigned Date</th>
                                        <th className="text-left p-4 font-medium">Last Activity</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedMembers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-6 text-green-700 dark:text-green-300">
                                                No members assigned to this form yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        assignedMembers.map((member) => (
                                            <tr key={member.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="p-4">
                                                    <div>
                                                        <div className="font-medium text-green-900 dark:text-green-100">
                                                            {member.christian_name} {member.family_name}
                                                        </div>
                                                        <div className="text-sm text-green-600 dark:text-green-400">
                                                            {member.phone}
                                                        </div>
                                                        {member.email && (
                                                            <div className="text-sm text-green-600 dark:text-green-400">
                                                                {member.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getRoleBadge(member.role)}
                                                </td>
                                                <td className="p-4 text-green-700 dark:text-green-300">
                                                    {member.unit ? (
                                                        <div className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            <span>{member.unit.name} ({member.unit.code})</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">N/A</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(member.status)}
                                                </td>
                                                <td className="p-4">
                                                    {getSubmissionStatusBadge(member.submission_status)}
                                                </td>
                                                <td className="p-4 text-green-700 dark:text-green-300">
                                                    {new Date(member.assigned_date).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-green-700 dark:text-green-300">
                                                    {member.last_activity ? new Date(member.last_activity).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="ghost" size="sm" title="View member details">
                                                            <Users className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" title="View submission">
                                                            <UserCheck className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" title="Send reminder">
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 