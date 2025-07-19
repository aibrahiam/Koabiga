import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, CalendarClock, Eye, Play, Clock, Settings, Square } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface FeeRule {
    id: number;
    name: string;
    type: string;
    amount: string;
    frequency: string;
    status: string;
    description: string;
    created_at: string;
    effective_date: string;
    applicable_to: string;
}

interface FeeStats {
    total_rules: number;
    active_rules: number;
    scheduled_rules: number;
    inactive_rules: number;
    total_applications: number;
    pending_applications: number;
    overdue_applications: number;
    paid_applications: number;
}

interface FeeRulesProps {
    feeRules: FeeRule[];
    stats: FeeStats;
}

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active':
            return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
        case 'inactive':
            return <Badge variant="secondary" className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">Inactive</Badge>;
        case 'scheduled':
            return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Scheduled</Badge>;
        case 'draft':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Draft</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
        case 'land':
            return <Badge variant="secondary">Land</Badge>;
        case 'equipment':
            return <Badge variant="default">Equipment</Badge>;
        case 'processing':
            return <Badge variant="outline">Processing</Badge>;
        case 'storage':
            return <Badge variant="outline">Storage</Badge>;
        case 'training':
            return <Badge variant="outline">Training</Badge>;
        default:
            return <Badge variant="outline">{type}</Badge>;
    }
};

export default function FeeRulesList({ feeRules, stats }: FeeRulesProps) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    const handleApplyFeeRule = (feeRuleId: number) => {
        if (confirm('Are you sure you want to apply this fee rule to all applicable users?')) {
            router.post(`/koabiga/admin/fee-rules/${feeRuleId}/apply`, {}, {
                onSuccess: () => {
                    // The page will be refreshed with updated data
                },
                onError: (errors) => {
                    console.error('Error applying fee rule:', errors);
                }
            });
        }
    };

    const handleStopFeeRule = (feeRuleId: number) => {
        if (confirm('Are you sure you want to stop this fee rule? This will deactivate it and prevent new applications.')) {
            router.put(`/koabiga/admin/fee-rules/${feeRuleId}`, {
                status: 'inactive'
            }, {
                onSuccess: () => {
                    // The page will be refreshed with updated data
                },
                onError: (errors) => {
                    console.error('Error stopping fee rule:', errors);
                }
            });
        }
    };

    const handleDeleteFeeRule = (feeRuleId: number) => {
        if (confirm('Are you sure you want to delete this fee rule?')) {
            router.delete(`/koabiga/admin/fee-rules/${feeRuleId}`, {
                onSuccess: () => {
                    // The page will be refreshed with updated data
                },
                onError: (errors) => {
                    console.error('Error deleting fee rule:', errors);
                }
            });
        }
    };

    const filteredRules = feeRules.filter(rule =>
        (status === 'all' || rule.status.toLowerCase() === status) &&
        (rule.name.toLowerCase().includes(search.toLowerCase()) || rule.type.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Fee Rules', href: '/koabiga/admin/fee-rules' },
        ]}>
            <Head title="Fee Rules - Koabiga Admin" />
            <div className="flex flex-col gap-6 p-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-green-700 dark:text-green-300 text-sm">Total Fee Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {stats?.total_rules || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-green-700 dark:text-green-300 text-sm">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                {stats?.active_rules || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-blue-700 dark:text-blue-300 text-sm">Scheduled</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                {stats?.scheduled_rules || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-gray-700 dark:text-gray-300 text-sm">Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                {stats?.total_applications || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                                {stats?.pending_applications || 0} pending, {stats?.overdue_applications || 0} overdue
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div className="flex gap-2 flex-1">
                        <Input
                            placeholder="Search fee rules..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="max-w-xs"
                        />
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Link href="/koabiga/admin/fee-rules/create-fee">
                        <Button variant="default" className="bg-green-700 hover:bg-green-800">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Fee Rule
                        </Button>
                    </Link>
                </div>

                {/* Fee Rules Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Fee Rules List</CardTitle>
                        <CardDescription>Manage all platform fee rules</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-green-200 dark:divide-green-800">
                                <thead className="bg-green-50 dark:bg-green-900/10">
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Name</th>
                                        <th className="text-left p-4 font-medium">Type</th>
                                        <th className="text-left p-4 font-medium">Amount</th>
                                        <th className="text-left p-4 font-medium">Frequency</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Effective Date</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRules.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-6 text-green-700 dark:text-green-300">
                                                {feeRules.length === 0 ? 'No fee rules found.' : 'No fee rules match your filters.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRules.map(rule => (
                                            <tr key={rule.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="p-4 font-medium text-green-900 dark:text-green-100 text-sm">{rule.name}</td>
                                                <td className="p-4">{getTypeBadge(rule.type)}</td>
                                                <td className="p-4 text-green-700 dark:text-green-300 text-sm">{parseInt(rule.amount).toLocaleString()} RWF</td>
                                                <td className="p-4 text-green-700 dark:text-green-300 text-sm">{rule.frequency}</td>
                                                <td className="p-4">{getStatusBadge(rule.status)}</td>
                                                <td className="p-4 text-green-700 dark:text-green-300 text-sm">
                                                    {new Date(rule.effective_date).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Link href={`/koabiga/admin/fee-rules/${rule.id}`}>
                                                            <Button variant="ghost" size="sm" title="View details">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/koabiga/admin/fee-rules/${rule.id}/edit`}>
                                                            <Button variant="ghost" size="sm" title="Edit fee rule">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {rule.status === 'active' && (
                                                            <>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => handleApplyFeeRule(rule.id)}
                                                                    title="Apply to users"
                                                                >
                                                                    <Play className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => handleStopFeeRule(rule.id)}
                                                                    title="Stop fee rule"
                                                                    className="text-orange-600 hover:text-orange-700"
                                                                >
                                                                    <Square className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDeleteFeeRule(rule.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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