import MemberSidebarLayout from '@/layouts/member-sidebar-layout';
import MemberBottomNavbar from '@/components/member-bottom-navbar';
import { Head } from '@inertiajs/react';
import { 
    FileText, 
    Calendar,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Member Dashboard',
        href: '/koabiga/members/dashboard',
    },
    {
        title: 'My Fees',
        href: '/koabiga/members/fees',
    },
];

interface Fee {
    id: number;
    title: string;
    description?: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    fee_rule?: {
        name: string;
        type: string;
    };
    created_at: string;
}

interface FeeStats {
    totalFees: number;
    paidFees: number;
    pendingFees: number;
    overdueFees: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
}

export default function MemberFees() {
    const [fees, setFees] = useState<Fee[]>([]);
    const [stats, setStats] = useState<FeeStats>({
        totalFees: 0,
        paidFees: 0,
        pendingFees: 0,
        overdueFees: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeesData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch upcoming fees (this includes all fees for the member)
                const feesResponse = await axios.get('/member/dashboard/upcoming-fees');
                if (feesResponse.data.success) {
                    const feesData = feesResponse.data.data;
                    setFees(feesData);

                    // Calculate stats from the fees data
                    const statsData = {
                        totalFees: feesData.length,
                        paidFees: feesData.filter((fee: Fee) => fee.status === 'paid').length,
                        pendingFees: feesData.filter((fee: Fee) => fee.status === 'pending').length,
                        overdueFees: feesData.filter((fee: Fee) => fee.status === 'overdue').length,
                        totalAmount: feesData.reduce((sum: number, fee: Fee) => sum + fee.amount, 0),
                        paidAmount: feesData.filter((fee: Fee) => fee.status === 'paid').reduce((sum: number, fee: Fee) => sum + fee.amount, 0),
                        pendingAmount: feesData.filter((fee: Fee) => fee.status === 'pending').reduce((sum: number, fee: Fee) => sum + fee.amount, 0),
                        overdueAmount: feesData.filter((fee: Fee) => fee.status === 'overdue').reduce((sum: number, fee: Fee) => sum + fee.amount, 0),
                    };
                    setStats(statsData);
                }

            } catch (err: any) {
                console.error('Error fetching fees data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load fees data');
            } finally {
                setLoading(false);
            }
        };

        fetchFeesData();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</Badge>;
            case 'overdue':
                return <Badge variant="destructive">Overdue</Badge>;
            case 'pending':
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
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
                <Head title="My Fees - Koabiga" />
                <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading fees...</span>
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
                <Head title="My Fees - Koabiga" />
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
            <Head title="My Fees - Koabiga" />
            <div className="flex h-full flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Fees</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your fee payments and track your financial obligations</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Fees</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalFees}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Paid</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.paidFees}</div>
                            <p className="text-xs text-muted-foreground">{stats.paidAmount.toLocaleString()} RWF</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingFees}</div>
                            <p className="text-xs text-muted-foreground">{stats.pendingAmount.toLocaleString()} RWF</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Overdue</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.overdueFees}</div>
                            <p className="text-xs text-muted-foreground">{stats.overdueAmount.toLocaleString()} RWF</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Fees List */}
                <Card className="rounded-lg shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-base">Fee Details</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Your fee payment history and obligations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 sm:space-y-4">
                            {fees.length > 0 ? (
                                fees.map((fee) => (
                                    <div key={fee.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800">
                                                {getStatusIcon(fee.status)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm sm:text-base font-medium">{fee.title}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    Due: {new Date(fee.dueDate).toLocaleDateString()}
                                                </p>
                                                {fee.fee_rule && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Type: {fee.fee_rule.type}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                            <div className="text-right">
                                                <p className="text-sm sm:text-base font-semibold">{fee.amount.toLocaleString()} RWF</p>
                                            </div>
                                            {getStatusBadge(fee.status)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No fees found</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">You don't have any fees assigned yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <MemberBottomNavbar />
        </MemberSidebarLayout>
    );
} 