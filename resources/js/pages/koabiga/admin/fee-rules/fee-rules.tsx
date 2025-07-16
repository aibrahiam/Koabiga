import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, CalendarClock, Eye, Play, Clock, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import axios from '@/lib/axios';
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

export default function FeeRulesList() {
    const [feeRules, setFeeRules] = useState<FeeRule[]>([]);
    const [stats, setStats] = useState<FeeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    const fetchFeeRules = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.current_page.toString(),
                per_page: pagination.per_page.toString(),
            });

            if (status !== 'all') params.append('status', status);
            if (search) params.append('search', search);

            const response = await axios.get(`/api/admin/fee-rules?${params}`);
            
            if (response.data.success) {
                setFeeRules(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setError('Failed to fetch fee rules');
            }
        } catch (err) {
            setError('Failed to fetch fee rules');
            console.error('Error fetching fee rules:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/fee-rules/statistics');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    useEffect(() => {
        fetchFeeRules();
        fetchStats();
    }, [pagination.current_page, status, search]);

    const handleApplyFeeRule = async (feeRuleId: number) => {
        try {
            console.log('Applying fee rule:', feeRuleId);
            const response = await axios.post(`/api/admin/fee-rules/${feeRuleId}/apply`);
            console.log('Fee rule application response:', response.data);
            
            if (response.data.success) {
                alert(`Fee rule applied successfully! ${response.data.data.applied_count} applications created.`);
                fetchFeeRules();
                fetchStats();
            } else {
                alert(`Failed to apply fee rule: ${response.data.message}`);
            }
        } catch (err: any) {
            console.error('Error applying fee rule:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            let errorMessage = 'Failed to apply fee rule';
            
            if (err.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (err.response?.status === 403) {
                errorMessage = 'You do not have permission to apply fee rules.';
            } else if (err.response?.status === 404) {
                errorMessage = 'Fee rule not found.';
            } else if (err.response?.status === 500) {
                errorMessage = `Server error: ${err.response?.data?.message || 'Unknown error'}`;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            alert(errorMessage);
        }
    };

    const handleDeleteFeeRule = async (feeRuleId: number) => {
        if (!confirm('Are you sure you want to delete this fee rule?')) return;

        try {
            const response = await axios.delete(`/api/admin/fee-rules/${feeRuleId}`);
            if (response.data.success) {
                alert('Fee rule deleted successfully!');
                fetchFeeRules();
                fetchStats();
            } else {
                alert('Failed to delete fee rule');
            }
        } catch (err) {
            alert('Failed to delete fee rule');
            console.error('Error deleting fee rule:', err);
        }
    };

    const filteredRules = feeRules.filter(rule =>
        (status === 'all' || rule.status.toLowerCase() === status) &&
        (rule.name.toLowerCase().includes(search.toLowerCase()) || rule.type.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading && feeRules.length === 0) {
        return (
            <AppLayout breadcrumbs={[
                { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
                { title: 'Fee Rules', href: '/koabiga/admin/fee-rules' },
            ]}>
                <Head title="Fee Rules - Koabiga Admin" />
                <div className="flex flex-col gap-6 p-6">
                    <div className="text-center">Loading fee rules...</div>
                </div>
            </AppLayout>
        );
    }

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
                        {error && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                        
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
                                                {loading ? 'Loading...' : 'No fee rules found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRules.map(rule => (
                                            <tr key={rule.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="p-4 font-medium text-green-900 dark:text-green-100 text-sm">{rule.name}</td>
                                                <td className="p-4">{getTypeBadge(rule.type)}</td>
                                                <td className="p-4 text-green-700 dark:text-green-300 text-sm">{rule.amount} RWF</td>
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
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => handleApplyFeeRule(rule.id)}
                                                                title="Apply to users"
                                                            >
                                                                <Play className="h-4 w-4" />
                                                            </Button>
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

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-gray-600">
                                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.current_page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.current_page === pagination.last_page}
                                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 