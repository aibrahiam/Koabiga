import MemberSidebarLayout from '@/layouts/member-sidebar-layout';
import MemberBottomNavbar from '@/components/member-bottom-navbar';
import { Head } from '@inertiajs/react';
import { 
    FileText, 
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Member Dashboard',
        href: '/koabiga/members/dashboard',
    },
    {
        title: 'My Forms',
        href: '/koabiga/members/forms',
    },
];

export default function MemberForms() {
    const [forms, setForms] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalForms: 0,
        pendingForms: 0,
        completedForms: 0,
        overdueForms: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFormsData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get('/member/forms');
                if (response.data.success) {
                    const formsData = response.data.data;
                    setForms(formsData);

                    // Calculate stats
                    setStats({
                        totalForms: formsData.length,
                        pendingForms: formsData.filter((f: any) => f.status === 'pending').length,
                        completedForms: formsData.filter((f: any) => f.status === 'approved').length,
                        overdueForms: formsData.filter((f: any) => f.status === 'overdue').length,
                    });
                }
            } catch (err: any) {
                console.error('Error fetching forms data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load forms data');
            } finally {
                setLoading(false);
            }
        };

        fetchFormsData();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'overdue':
                return <Badge variant="destructive">Overdue</Badge>;
            case 'pending':
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'rejected':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'overdue':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'pending':
            default:
                return <Clock className="h-4 w-4 text-yellow-600" />;
        }
    };

    if (loading) {
        return (
            <MemberSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="My Forms - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading forms...</span>
                        </div>
                    </div>
                </div>
                <MemberBottomNavbar />
            </MemberSidebarLayout>
        );
    }

    if (error) {
        return (
            <MemberSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="My Forms - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
                <MemberBottomNavbar />
            </MemberSidebarLayout>
        );
    }

    return (
        <MemberSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="My Forms - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Forms</h1>
                        <p className="text-gray-600 dark:text-gray-400">Access and submit required forms and reports</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Forms</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalForms}</div>
                            <p className="text-xs text-muted-foreground">Assigned to you</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingForms}</div>
                            <p className="text-xs text-muted-foreground">Awaiting submission</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.completedForms}</div>
                            <p className="text-xs text-muted-foreground">Successfully submitted</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Overdue</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.overdueForms}</div>
                            <p className="text-xs text-muted-foreground">Past due date</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Forms List */}
                <Card className="rounded-lg shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-base">Form Management</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Your assigned forms and their current status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 sm:space-y-4">
                            {forms.length > 0 ? (
                                forms.map((form) => (
                                    <div key={form.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
                                                {getStatusIcon(form.status)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm sm:text-base font-medium">{form.title}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {form.description}
                                                </p>
                                                {form.dueDate && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Due: {new Date(form.dueDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Type: {form.type}
                                                </p>
                                                {form.submitted_at && (
                                                    <p className="text-xs text-green-600">
                                                        Submitted: {new Date(form.submitted_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusBadge(form.status)}
                                            {form.status === 'pending' && (
                                                <Button size="sm" className="text-xs">
                                                    Submit
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No forms assigned</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">You don't have any forms assigned yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="rounded-lg shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Common form-related tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button variant="outline" className="justify-start">
                                <FileText className="mr-2 h-4 w-4" />
                                View Form History
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <Calendar className="mr-2 h-4 w-4" />
                                View Due Dates
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <MemberBottomNavbar />
        </MemberSidebarLayout>
    );
} 