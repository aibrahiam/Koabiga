import { Head, router } from '@inertiajs/react';
import { 
    ClipboardList, 
    ArrowLeft,
    Eye,
    Users,
    FileText,
    Calendar,
    Settings,
    Download,
    Edit,
    Trash2,
    LoaderCircle,
    AlertTriangle,
    Building2,
    UserCheck,
    BarChart3,
    Clock,
    CheckCircle,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface FormField {
    name: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email';
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    description?: string;
}

interface FormSubmission {
    id: number;
    user_id: number;
    user_name: string;
    submitted_at: string;
    status: string;
    data: any;
}

interface FormData {
    id: number;
    title: string;
    type: 'request' | 'registration' | 'report' | 'application';
    category: 'land' | 'crop' | 'equipment' | 'member' | 'harvest' | 'financial' | 'other';
    description: string;
    fields: FormField[];
    status: 'active' | 'draft' | 'inactive';
    target_roles: string[];
    submissions_count: number;
    created_at: string;
    updated_at: string;
    created_by: string;
}

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
        title: 'View Form',
        href: '/koabiga/admin/admin-forms/view',
    },
];

export default function ViewForm() {
    const [formData, setFormData] = useState<FormData | null>(null);
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'submissions'>('details');

    // Get form ID from URL - extract from /koabiga/admin/forms/{id}
    const pathSegments = window.location.pathname.split('/');
    const formId = pathSegments[pathSegments.length - 1]; // Get the last segment as ID

    useEffect(() => {
        fetchForm();
    }, []);

    const fetchForm = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(`/api/admin/forms/${formId}`);
            
            if (response.data.success) {
                setFormData(response.data.data);
            } else {
                setError('Failed to load form data');
            }
        } catch (err: any) {
            console.error('Error fetching form:', err);
            setError('Failed to load form data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        try {
            setSubmissionsLoading(true);
            const response = await axios.get(`/api/admin/forms/${formId}/submissions`);
            
            if (response.data.success) {
                setSubmissions(response.data.data || []);
            }
        } catch (err: any) {
            console.error('Error fetching submissions:', err);
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const handleEdit = () => {
        router.visit(`/koabiga/admin/admin-forms/${formId}/edit`);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/admin/forms/${formId}`);
                router.visit('/koabiga/admin/admin-forms');
            } catch (err: any) {
                console.error('Error deleting form:', err);
                setError('Failed to delete form. Please try again.');
            }
        }
    };

    const handleBack = () => {
        router.visit('/koabiga/admin/admin-forms');
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'request':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Request</Badge>;
            case 'registration':
                return <Badge variant="outline" className="border-green-200 text-green-700">Registration</Badge>;
            case 'report':
                return <Badge variant="outline" className="border-orange-200 text-orange-700">Report</Badge>;
            case 'application':
                return <Badge variant="outline" className="border-purple-200 text-purple-700">Application</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'land':
                return <Badge variant="outline" className="border-purple-200 text-purple-700">Land</Badge>;
            case 'crop':
                return <Badge variant="outline" className="border-green-200 text-green-700">Crop</Badge>;
            case 'equipment':
                return <Badge variant="outline" className="border-gray-200 text-gray-700">Equipment</Badge>;
            case 'member':
                return <Badge variant="outline" className="border-blue-200 text-blue-700">Member</Badge>;
            case 'harvest':
                return <Badge variant="outline" className="border-orange-200 text-orange-700">Harvest</Badge>;
            case 'financial':
                return <Badge variant="outline" className="border-red-200 text-red-700">Financial</Badge>;
            default:
                return <Badge variant="outline">{category}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>;
            case 'inactive':
                return <Badge variant="outline">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTargetRolesBadge = (targetRoles: string[]) => {
        if (!targetRoles || targetRoles.length === 0) {
            return <Badge variant="outline" className="border-gray-200 text-gray-700">All Roles</Badge>;
        }
        
        return (
            <div className="flex flex-wrap gap-1">
                {targetRoles.map((role) => {
                    switch (role) {
                        case 'unit_leader':
                            return <Badge key={role} variant="outline" className="border-blue-200 text-blue-700 text-xs">Unit Leader</Badge>;
                        case 'member':
                            return <Badge key={role} variant="outline" className="border-green-200 text-green-700 text-xs">Member</Badge>;
                        case 'admin':
                            return <Badge key={role} variant="outline" className="border-purple-200 text-purple-700 text-xs">Admin</Badge>;
                        default:
                            return <Badge key={role} variant="outline" className="text-xs">{role}</Badge>;
                    }
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="View Form - Koabiga Admin" />
                <div className="flex items-center justify-center py-8">
                    <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading form...</span>
                </div>
            </AppLayout>
        );
    }

    if (!formData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Form Not Found - Koabiga Admin" />
                <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-600 mb-2">Form Not Found</h3>
                    <p className="text-sm text-muted-foreground">The form you're looking for doesn't exist.</p>
                    <Button onClick={handleBack} className="mt-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Forms
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${formData.title} - View Form`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleBack} variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Forms
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{formData.title}</h1>
                            <p className="text-gray-600 dark:text-gray-400">Form details and submissions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleEdit} variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Form
                        </Button>
                        <Button onClick={handleDelete} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Tabs */}
                <div className="flex space-x-1 border-b">
                    <Button
                        variant={activeTab === 'details' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('details')}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Form Details
                    </Button>
                    <Button
                        variant={activeTab === 'submissions' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                            setActiveTab('submissions');
                            if (submissions.length === 0) {
                                fetchSubmissions();
                            }
                        }}
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Submissions ({formData.submissions_count})
                    </Button>
                </div>

                {activeTab === 'details' && (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Form Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Information</CardTitle>
                                    <CardDescription>Basic form details and configuration</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Form Type</Label>
                                            <div className="mt-1">{getTypeBadge(formData.type)}</div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                                            <div className="mt-1">{getCategoryBadge(formData.category)}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                        <p className="mt-1 text-sm">{formData.description || 'No description provided'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Target Roles</Label>
                                        <div className="mt-1">{getTargetRolesBadge(formData.target_roles)}</div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                        <div className="mt-1">{getStatusBadge(formData.status)}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Fields */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Fields</CardTitle>
                                    <CardDescription>Fields that users will fill out</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {(!formData.fields || formData.fields.length === 0) ? (
                                        <div className="text-center py-8">
                                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-muted-foreground mb-2">No fields</h3>
                                            <p className="text-sm text-muted-foreground">This form has no fields configured.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.fields.map((field, index) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium">{field.label}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline">{field.type}</Badge>
                                                            {field.required && <Badge variant="default" className="bg-red-100 text-red-800">Required</Badge>}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 text-sm text-muted-foreground">
                                                        <p>Field Name: {field.name}</p>
                                                        {field.placeholder && <p>Placeholder: {field.placeholder}</p>}
                                                        {field.description && <p>Description: {field.description}</p>}
                                                        {field.options && field.options.length > 0 && (
                                                            <p>Options: {field.options.join(', ')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Form Statistics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Statistics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{formData.fields ? formData.fields.length : 0}</div>
                                            <div className="text-xs text-muted-foreground">Total Fields</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{formData.fields ? formData.fields.filter(f => f.required).length : 0}</div>
                                            <div className="text-xs text-muted-foreground">Required Fields</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{formData.submissions_count || 0}</div>
                                            <div className="text-xs text-muted-foreground">Submissions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">{formData.target_roles ? formData.target_roles.length : 0}</div>
                                            <div className="text-xs text-muted-foreground">Target Roles</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Metadata */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span>{new Date(formData.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Last Updated:</span>
                                        <span>{new Date(formData.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Created By:</span>
                                        <span>{formData.created_by || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Form ID:</span>
                                        <span className="font-mono">{formData.id}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button onClick={handleEdit} className="w-full">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Form
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Submissions
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <Users className="h-4 w-4 mr-2" />
                                        View Submissions
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Submissions</CardTitle>
                            <CardDescription>View all submissions for this form</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {submissionsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-muted-foreground">Loading submissions...</span>
                                </div>
                            ) : submissions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-4 font-medium">User</th>
                                                <th className="text-left p-4 font-medium">Submitted</th>
                                                <th className="text-left p-4 font-medium">Status</th>
                                                <th className="text-left p-4 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.map((submission) => (
                                                <tr key={submission.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-4">
                                                        <div className="font-medium">{submission.user_name}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm">{new Date(submission.submitted_at).toLocaleString()}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant="outline">{submission.status}</Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No submissions yet</h3>
                                    <p className="text-sm text-muted-foreground">This form hasn't received any submissions yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
} 