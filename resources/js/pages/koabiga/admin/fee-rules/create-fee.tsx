import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Unit {
    id: number;
    name: string;
    code: string;
    zone: {
        id: number;
        name: string;
        code: string;
    };
}

interface CreateFeeRuleProps {
    units: Unit[];
}

export default function CreateFeeRule({ units }: CreateFeeRuleProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
        amount: '',
        frequency: '',
        unit: '',
        status: 'active',
        applicable_to: '',
        description: '',
        effective_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/koabiga/admin/fee-rules');
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
            { title: 'Fee Rules', href: '/koabiga/admin/fee-rules' },
            { title: 'Create Fee Rule', href: '/koabiga/admin/fee-rules/create-fee' },
        ]}>
            <Head title="Create Fee Rule - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6 items-center">
                {/* Header */}
                <div className="w-full max-w-2xl">
                    <div className="flex items-center mb-4">
                        <Link href="/koabiga/admin/fee-rules">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Fee Rules
                            </Button>
                        </Link>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Fee Rule</h1>
                        <p className="text-gray-600 dark:text-gray-400">Configure a new platform fee structure</p>
                    </div>
                </div>

                {/* Create Form */}
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Fee Rule Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block mb-1 font-medium">Fee Rule Name</label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g., Land Usage Fee"
                                    required
                                />
                                {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label htmlFor="type" className="block mb-1 font-medium">Fee Type</label>
                                <Select value={data.type} onValueChange={value => setData('type', value)} required>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select fee type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="land">Land</SelectItem>
                                        <SelectItem value="equipment">Equipment</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="storage">Storage</SelectItem>
                                        <SelectItem value="training">Training</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <div className="text-red-600 text-sm mt-1">{errors.type}</div>}
                            </div>

                            <div>
                                <label htmlFor="amount" className="block mb-1 font-medium">Amount</label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    placeholder="1,000 RWF"
                                    required
                                />
                                {errors.amount && <div className="text-red-600 text-sm mt-1">{errors.amount}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="frequency" className="block mb-1 font-medium">Frequency</label>
                                    <Select value={data.frequency} onValueChange={value => setData('frequency', value)} required>
                                        <SelectTrigger id="frequency">
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                            <SelectItem value="per_transaction">Per Transaction</SelectItem>
                                            <SelectItem value="one_time">One Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.frequency && <div className="text-red-600 text-sm mt-1">{errors.frequency}</div>}
                                </div>
                                <div>
                                    <label htmlFor="unit" className="block mb-1 font-medium">Unit</label>
                                    <Input
                                        id="unit"
                                        name="unit"
                                        value={data.unit}
                                        onChange={e => setData('unit', e.target.value)}
                                        placeholder="e.g., per hectare, per day"
                                        required
                                    />
                                    {errors.unit && <div className="text-red-600 text-sm mt-1">{errors.unit}</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="applicable_to" className="block mb-1 font-medium">Applicable To</label>
                                    <Select value={data.applicable_to} onValueChange={value => setData('applicable_to', value)} required>
                                        <SelectTrigger id="applicable_to">
                                            <SelectValue placeholder="Select applicable group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_members">All Members</SelectItem>
                                            <SelectItem value="unit_leaders">Unit Leaders</SelectItem>
                                            <SelectItem value="new_members">New Members</SelectItem>
                                            <SelectItem value="active_members">Active Members</SelectItem>
                                            <SelectItem value="specific_units">Specific Units</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.applicable_to && <div className="text-red-600 text-sm mt-1">{errors.applicable_to}</div>}
                                </div>
                                <div>
                                    <label htmlFor="status" className="block mb-1 font-medium">Status</label>
                                    <Select value={data.status} onValueChange={value => setData('status', value)} required>
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <div className="text-red-600 text-sm mt-1">{errors.status}</div>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="effective_date" className="block mb-1 font-medium">Effective Date</label>
                                <Input
                                    id="effective_date"
                                    name="effective_date"
                                    type="date"
                                    value={data.effective_date}
                                    onChange={e => setData('effective_date', e.target.value)}
                                    required
                                />
                                {errors.effective_date && <div className="text-red-600 text-sm mt-1">{errors.effective_date}</div>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block mb-1 font-medium">Description</label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Describe the fee rule and its purpose..."
                                    rows={3}
                                    required
                                />
                                {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Link href="/koabiga/admin/fee-rules">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Create Fee Rule</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 