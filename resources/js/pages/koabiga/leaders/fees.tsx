import { Head } from '@inertiajs/react';
import { 
    FileText, 
    Calendar,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UnitLeaderLayout from '@/layouts/unit-leader-layout';

interface FeeApplication {
    id: number;
    fee_rule: {
        id: number;
        name: string;
        type: string;
        description: string;
    };
    amount: string;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    created_at: string;
    paid_date?: string;
    notes?: string;
}

interface FeeStats {
    total_fees: number;
    paid_fees: number;
    pending_fees: number;
    overdue_fees: number;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    overdue_amount: number;
}

interface LeaderFeesProps {
    feeApplications: FeeApplication[];
    stats: FeeStats;
}

export default function LeaderFees({ feeApplications, stats }: LeaderFeesProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</Badge>;
            case 'overdue':
                return <Badge variant="destructive">Overdue</Badge>;
            case 'cancelled':
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Cancelled</Badge>;
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
            case 'cancelled':
                return <Clock className="h-4 w-4 text-gray-600" />;
            case 'pending':
            default:
                return <Clock className="h-4 w-4 text-yellow-600" />;
        }
    };

    return (
        <UnitLeaderLayout>
            <Head title="My Fees - Koabiga Leaders" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Fees</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your fee payments and track your financial obligations</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_fees}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.paid_fees}</div>
                            <p className="text-xs text-muted-foreground">{stats.paid_amount.toLocaleString()} RWF</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_fees}</div>
                            <p className="text-xs text-muted-foreground">{stats.pending_amount.toLocaleString()} RWF</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.overdue_fees}</div>
                            <p className="text-xs text-muted-foreground">{stats.overdue_amount.toLocaleString()} RWF</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Fees List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Fee Details</CardTitle>
                        <CardDescription>Your fee payment history and obligations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {feeApplications.length > 0 ? (
                                feeApplications.map((fee) => (
                                    <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800">
                                                {getStatusIcon(fee.status)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-base font-medium">{fee.fee_rule.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Due: {new Date(fee.due_date).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Type: {fee.fee_rule.type}
                                                </p>
                                                {fee.paid_date && (
                                                    <p className="text-xs text-green-600">
                                                        Paid: {new Date(fee.paid_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="text-right">
                                                <p className="text-base font-bold">{fee.amount} RWF</p>
                                                {getStatusBadge(fee.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No fees found</p>
                                    <p className="text-sm text-gray-400">You don't have any fee obligations at the moment.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UnitLeaderLayout>
    );
} 