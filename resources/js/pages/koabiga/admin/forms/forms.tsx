import { Head, router } from '@inertiajs/react';
import { 
    ClipboardList, 
    Search, 
    Filter, 
    Plus,
    Edit,
    Eye,
    Trash2,
    Download,
    Calendar,
    Users,
    FileText,
    AlertTriangle,
    LoaderCircle,
    Building2,
    UserCheck,
    Save,
    X,
    RefreshCw,
    CheckCircle
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import axios from '@/lib/axios';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/koabiga/admin/dashboard',
    },
    {
        title: 'Forms Management',
        href: '/koabiga/admin/forms',
    },
];

interface FormField {
    name: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    description?: string;
}

interface Form {
    id: number;
    title: string;
    type: string;
    category: string;
    description: string;
    fields: FormField[];
    status: string;
    target_roles: string[];
    created_at: string;
    updated_at: string;
}

export default function AdminForms() {
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [availableForms, setAvailableForms] = useState<any[]>([]);
    const [showAvailableForms, setShowAvailableForms] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creatingForm, setCreatingForm] = useState(false);
    
    // Form creation/editing state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingForm, setEditingForm] = useState<Form | null>(null);
    const [formToDelete, setFormToDelete] = useState<Form | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    // Form data
    const [formData, setFormData] = useState({
        title: '',
        type: 'request',
        category: 'other',
        description: '',
        fields: [] as FormField[],
        status: 'active',
        target_roles: [] as string[]
    });

    // New form creation state
    const [newFormData, setNewFormData] = useState({
        name: '',
        title: '',
        type: 'request',
        category: 'other',
        description: '',
        fields: [] as FormField[],
        target_roles: ['unit_leader'] as string[]
    });

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchForms = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching admin forms with params:', {
                search: searchTerm,
                type: typeFilter,
                category: categoryFilter,
                status: statusFilter
            });
            
            const params = new URLSearchParams({
                search: searchTerm,
                type: typeFilter,
                category: categoryFilter,
                status: statusFilter,
                per_page: 'all' // Get all forms without pagination
            });
            
            console.log('Making API call to:', `/api/admin/forms?${params}`);
            
            const response = await axios.get(`/api/admin/forms?${params}`);
            
            console.log('Admin forms API response:', response.data);
            
            if (response.data.success) {
                const formsData = response.data.data;
                console.log('Raw forms data:', formsData);
                
                if (Array.isArray(formsData)) {
                    // Direct array response
                    setForms(formsData);
                    console.log('Forms loaded (direct array):', formsData.length);
                } else if (formsData && formsData.data) {
                    // Paginated response (fallback)
                    setForms(formsData.data || []);
                    console.log('Forms loaded (paginated):', formsData.data?.length || 0);
                } else {
                    // Fallback
                    setForms([]);
                    console.log('No forms found in response');
                }
            } else {
                console.error('API returned error:', response.data.message);
                setError(response.data.message || 'Failed to fetch forms');
                setForms([]);
            }
        } catch (err: any) {
            console.error('Error fetching admin forms:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            setError('Failed to load forms. Please try again.');
            setForms([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableForms = async () => {
        try {
            const response = await axios.get('/api/admin/forms/available');
            if (response.data.success) {
                setAvailableForms(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching available forms:', err);
        }
    };

    const createNewForm = async () => {
        try {
            setCreatingForm(true);
            setError(null);

            const response = await axios.post('/api/admin/forms/create-file', newFormData);
            
            if (response.data.success) {
                setSuccess('Form created successfully in leaders folder!');
                setShowCreateForm(false);
                setNewFormData({
                    name: '',
                    title: '',
                    type: 'request',
                    category: 'other',
                    description: '',
                    fields: [],
                    target_roles: ['unit_leader']
                });
                fetchAvailableForms();
                fetchForms();
            } else {
                setError(response.data.message || 'Failed to create form');
            }
        } catch (err: any) {
            console.error('Error creating form:', err);
            setError(err.response?.data?.message || 'Failed to create form. Please try again.');
        } finally {
            setCreatingForm(false);
        }
    };

    const deleteFormFile = async (formName: string) => {
        if (confirm('Are you sure you want to delete this form file? This action cannot be undone.')) {
            try {
                const response = await axios.delete(`/api/admin/forms/delete-file/${formName}`);
                
                if (response.data.success) {
                    setSuccess('Form file deleted successfully!');
                    fetchAvailableForms();
                    fetchForms();
                } else {
                    setError(response.data.message || 'Failed to delete form file');
                }
            } catch (err: any) {
                console.error('Error deleting form file:', err);
                setError(err.response?.data?.message || 'Failed to delete form file. Please try again.');
            }
        }
    };

    useEffect(() => {
        fetchForms();
    }, [searchTerm, typeFilter, categoryFilter, statusFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>;
            case 'inactive':
                return <Badge variant="outline">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'request':
                return <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">Request</Badge>;
            case 'registration':
                return <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">Registration</Badge>;
            case 'report':
                return <Badge variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">Report</Badge>;
            case 'application':
                return <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">Application</Badge>;
            case 'feedback':
                return <Badge variant="outline" className="border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300">Feedback</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'land':
                return <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">Land</Badge>;
            case 'crop':
                return <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">Crop</Badge>;
            case 'equipment':
                return <Badge variant="outline" className="border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-300">Equipment</Badge>;
            case 'member':
                return <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">Member</Badge>;
            case 'harvest':
                return <Badge variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">Harvest</Badge>;
            case 'financial':
                return <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">Financial</Badge>;
            case 'training':
                return <Badge variant="outline" className="border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300">Training</Badge>;
            default:
                return <Badge variant="outline">{category}</Badge>;
        }
    };

    const getTargetRolesBadge = (targetRoles: string[]) => {
        if (!targetRoles || targetRoles.length === 0) {
            return <Badge variant="outline" className="border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-300">All Roles</Badge>;
        }
        
        return (
            <div className="flex flex-wrap gap-1">
                {targetRoles.map((role) => {
                    switch (role) {
                        case 'unit_leader':
                            return <Badge key={role} variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300 text-xs">Unit Leader</Badge>;
                        case 'member':
                            return <Badge key={role} variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300 text-xs">Member</Badge>;
                        case 'admin':
                            return <Badge key={role} variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 text-xs">Admin</Badge>;
                        default:
                            return <Badge key={role} variant="outline" className="text-xs">{role}</Badge>;
                    }
                })}
            </div>
        );
    };

    const handleCreateForm = () => {
        setFormData({
            title: '',
            type: 'request',
            category: 'other',
            description: '',
            fields: [],
            status: 'active',
            target_roles: []
        });
        setIsCreateDialogOpen(true);
    };

    const handleEditForm = (form: Form) => {
        setEditingForm(form);
        setFormData({
            title: form.title,
            type: form.type,
            category: form.category,
            description: form.description,
            fields: form.fields,
            status: form.status,
            target_roles: form.target_roles
        });
        setIsEditDialogOpen(true);
    };

    const handleDeleteForm = (form: Form) => {
        setFormToDelete(form);
        setIsDeleteDialogOpen(true);
    };

    const handleSaveForm = async () => {
        try {
            setSaving(true);
            setError(null);

            if (editingForm) {
                // Update existing form
                const response = await axios.put(`/api/admin/forms/${editingForm.id}`, formData);
                if (response.data.success) {
                    setSuccess('Form updated successfully');
                    setIsEditDialogOpen(false);
                    setEditingForm(null);
                    fetchForms();
                } else {
                    setError(response.data.message || 'Failed to update form');
                }
            } else {
                // Create new form
                const response = await axios.post('/api/admin/forms', formData);
                if (response.data.success) {
                    setSuccess('Form created successfully');
                    setIsCreateDialogOpen(false);
                    fetchForms();
                } else {
                    setError(response.data.message || 'Failed to create form');
                }
            }
        } catch (err: any) {
            console.error('Error saving form:', err);
            setError(err.response?.data?.message || 'Failed to save form. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleting(true);
            setError(null);

            const response = await axios.delete(`/api/admin/forms/${formToDelete?.id}`);
            if (response.data.success) {
                setSuccess('Form deleted successfully');
                setIsDeleteDialogOpen(false);
                setFormToDelete(null);
                fetchForms();
            } else {
                setError(response.data.message || 'Failed to delete form');
            }
        } catch (err: any) {
            console.error('Error deleting form:', err);
            setError(err.response?.data?.message || 'Failed to delete form. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const addField = () => {
        const newField: FormField = {
            name: '',
            type: 'text',
            label: '',
            required: false,
            placeholder: '',
            description: ''
        };
        setFormData(prev => ({
            ...prev,
            fields: [...prev.fields, newField]
        }));
    };

    const updateField = (index: number, field: FormField) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map((f, i) => i === index ? field : f)
        }));
    };

    const removeField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Forms Management - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forms Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage forms in the leaders folder</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={async () => {
                                try {
                                    const response = await axios.post('/api/admin/forms/sync');
                                    if (response.data.success) {
                                        setSuccess('Forms synced successfully from leaders folder');
                                        fetchForms();
                                        fetchAvailableForms();
                                    } else {
                                        setError('Failed to sync forms');
                                    }
                                } catch (err) {
                                    setError('Failed to sync forms');
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Sync from Leaders
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setShowAvailableForms(!showAvailableForms);
                                if (!showAvailableForms) {
                                    fetchAvailableForms();
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            {showAvailableForms ? 'Hide' : 'View'} Forms in Folder
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={fetchForms} 
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button 
                            className="flex items-center gap-2" 
                            onClick={() => setShowCreateForm(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Create New Form
                        </Button>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                    </Alert>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading forms...</span>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                                    <ClipboardList className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{forms.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Created forms
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Available Forms</CardTitle>
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {availableForms.total_available || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        In leaders folder
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {forms.filter(f => f.status === 'active').length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Currently active
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Unit Leader Forms</CardTitle>
                                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {forms.filter(f => f.target_roles?.includes('unit_leader')).length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Unit leader forms
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Available Forms Section */}
                        {showAvailableForms && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Forms in Leaders Folder
                                    </CardTitle>
                                    <CardDescription>
                                        Current forms available in the leaders folder ({availableForms.length} forms)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {availableForms.length > 0 ? (
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {availableForms.map((form) => (
                                                    <Card key={form.name} className={`border-2 ${form.exists_in_db ? 'border-green-200' : 'border-yellow-200'}`}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium capitalize">
                                                                    {form.name.replace('-', ' ')}
                                                                </h4>
                                                                <div className="flex items-center gap-1">
                                                                    {form.exists_in_db ? (
                                                                        <Badge variant="default" className="bg-green-100 text-green-800">In DB</Badge>
                                                                    ) : (
                                                                        <Badge variant="outline" className="text-yellow-600">Not Synced</Badge>
                                                                    )}
                                                                    <Badge variant="outline">
                                                                        {form.type}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                {form.description || form.title}
                                                            </p>
                                                            <div className="space-y-2 text-xs text-muted-foreground">
                                                                <div>File: {form.name}.tsx</div>
                                                                <div>Size: {(form.file_size / 1024).toFixed(1)} KB</div>
                                                                <div>Modified: {new Date(form.modified_at * 1000).toLocaleDateString()}</div>
                                                                <div>Fields: {form.fields.length}</div>
                                                                <div>Target Roles: {form.target_roles.join(', ')}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-3">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        if (!form.exists_in_db) {
                                                                            // Sync this specific form
                                                                            setSuccess(`Form ${form.name} synced successfully`);
                                                                        }
                                                                    }}
                                                                    disabled={form.exists_in_db}
                                                                >
                                                                    <Plus className="h-3 w-3 mr-1" />
                                                                    {form.exists_in_db ? 'Synced' : 'Sync'}
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        // View the form file
                                                                        window.open(`/resources/js/pages/koabiga/leaders/forms/${form.name}.tsx`, '_blank');
                                                                    }}
                                                                >
                                                                    <Eye className="h-3 w-3 mr-1" />
                                                                    View
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost"
                                                                    onClick={() => deleteFormFile(form.name)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No forms found in leaders folder</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Filters */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-1 items-center space-x-2">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search forms..."
                                                className="pl-8"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="request">Request</SelectItem>
                                                <SelectItem value="registration">Registration</SelectItem>
                                                <SelectItem value="report">Report</SelectItem>
                                                <SelectItem value="application">Application</SelectItem>
                                                <SelectItem value="feedback">Feedback</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                <SelectItem value="land">Land</SelectItem>
                                                <SelectItem value="crop">Crop</SelectItem>
                                                <SelectItem value="equipment">Equipment</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="harvest">Harvest</SelectItem>
                                                <SelectItem value="financial">Financial</SelectItem>
                                                <SelectItem value="training">Training</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Forms Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Forms</CardTitle>
                                <CardDescription>Manage forms for different user roles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-4 font-medium">Form</th>
                                                    <th className="text-left p-4 font-medium">Type</th>
                                                    <th className="text-left p-4 font-medium">Category</th>
                                                <th className="text-left p-4 font-medium">Status</th>
                                                    <th className="text-left p-4 font-medium">Target Roles</th>
                                                <th className="text-left p-4 font-medium">Created</th>
                                                    <th className="text-left p-4 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {forms.map((form) => (
                                                    <tr key={form.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-4">
                                                            <div>
                                                                <div className="font-medium">{form.title}</div>
                                                                <div className="text-sm text-muted-foreground">{form.description}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {form.fields?.length || 0} fields
                                                            </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            {getTypeBadge(form.type)}
                                                        </td>
                                                        <td className="p-4">
                                                            {getCategoryBadge(form.category)}
                                                        </td>
                                                        <td className="p-4">
                                                            {getStatusBadge(form.status)}
                                                        </td>
                                                        <td className="p-4">
                                                        {getTargetRolesBadge(form.target_roles)}
                                                        </td>
                                                        <td className="p-4">
                                                        <span className="text-sm">
                                                            {new Date(form.created_at).toLocaleDateString()}
                                                        </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                onClick={() => handleEditForm(form)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                onClick={() => router.visit(`/koabiga/admin/forms/${form.id}`)}
                                                                >
                                                                <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() => handleDeleteForm(form)}
                                                                >
                                                                <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    
                                    {forms.length === 0 && !loading && (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">No forms found</p>
                                            <Button onClick={handleCreateForm} className="mt-4">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create First Form
                                            </Button>
                                    </div>
                                )}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Create/Edit Form Dialog */}
                <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateDialogOpen(false);
                        setIsEditDialogOpen(false);
                        setEditingForm(null);
                    }
                }}>
                    <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingForm ? 'Edit Form' : 'Create New Form'}</DialogTitle>
                            <DialogDescription>
                                {editingForm ? 'Update form details and fields' : 'Create a new form for unit leaders'}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                            {/* Basic Form Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Form Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="Enter form title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Form Type</Label>
                                    <Select 
                                        value={formData.type} 
                                        onValueChange={(value) => setFormData({...formData, type: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="request">Request</SelectItem>
                                            <SelectItem value="registration">Registration</SelectItem>
                                            <SelectItem value="report">Report</SelectItem>
                                            <SelectItem value="application">Application</SelectItem>
                                            <SelectItem value="feedback">Feedback</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select 
                                        value={formData.category} 
                                        onValueChange={(value) => setFormData({...formData, category: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="land">Land</SelectItem>
                                            <SelectItem value="crop">Crop</SelectItem>
                                            <SelectItem value="equipment">Equipment</SelectItem>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="harvest">Harvest</SelectItem>
                                            <SelectItem value="financial">Financial</SelectItem>
                                            <SelectItem value="training">Training</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={(value) => setFormData({...formData, status: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Enter form description"
                                    rows={3}
                                />
                            </div>
                            
                            {/* Target Roles */}
                            <div className="space-y-2">
                                <Label>Target Roles</Label>
                                <div className="flex gap-4">
                                    {['admin', 'unit_leader', 'member'].map((role) => (
                                        <div key={role} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={role}
                                                checked={formData.target_roles.includes(role)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            target_roles: [...formData.target_roles, role]
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            target_roles: formData.target_roles.filter(r => r !== role)
                                                        });
                                                    }
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor={role} className="text-sm capitalize">{role.replace('_', ' ')}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Form Fields</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addField}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Field
                                    </Button>
                                </div>
                                
                                {formData.fields.map((field, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Field {index + 1}</h4>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => removeField(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Field Name</Label>
                                                <Input
                                                    value={field.name}
                                                    onChange={(e) => updateField(index, {...field, name: e.target.value})}
                                                    placeholder="e.g., crop_name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Field Type</Label>
                                                <Select 
                                                    value={field.type} 
                                                    onValueChange={(value) => updateField(index, {...field, type: value})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Text</SelectItem>
                                                        <SelectItem value="textarea">Textarea</SelectItem>
                                                        <SelectItem value="select">Select</SelectItem>
                                                        <SelectItem value="checkbox">Checkbox</SelectItem>
                                                        <SelectItem value="radio">Radio</SelectItem>
                                                        <SelectItem value="date">Date</SelectItem>
                                                        <SelectItem value="number">Number</SelectItem>
                                                        <SelectItem value="email">Email</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label>Field Label</Label>
                                            <Input
                                                value={field.label}
                                                onChange={(e) => updateField(index, {...field, label: e.target.value})}
                                                placeholder="e.g., Crop Name"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Placeholder</Label>
                                                <Input
                                                    value={field.placeholder || ''}
                                                    onChange={(e) => updateField(index, {...field, placeholder: e.target.value})}
                                                    placeholder="Optional placeholder text"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Input
                                                    value={field.description || ''}
                                                    onChange={(e) => updateField(index, {...field, description: e.target.value})}
                                                    placeholder="Optional field description"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`required-${index}`}
                                                checked={field.required}
                                                onChange={(e) => updateField(index, {...field, required: e.target.checked})}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor={`required-${index}`}>Required field</Label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        setIsEditDialogOpen(false);
                                        setEditingForm(null);
                                    }}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveForm} disabled={saving}>
                                    {saving ? (
                                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {editingForm ? 'Update Form' : 'Create Form'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="w-[90vw] max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-red-800 dark:text-red-200">Delete Form</DialogTitle>
                            <DialogDescription className="text-red-600 dark:text-red-400">
                                Are you sure you want to delete "{formToDelete?.title}"? This action cannot be undone and will also remove the corresponding TypeScript file.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Delete Form
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Create New Form Dialog */}
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Form in Leaders Folder</DialogTitle>
                        <DialogDescription>
                            Create a new form that will be added to the leaders folder
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="form-name">Form Name *</Label>
                                <Input
                                    id="form-name"
                                    value={newFormData.name}
                                    onChange={(e) => setNewFormData({...newFormData, name: e.target.value})}
                                    placeholder="e.g., crop-creation"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use kebab-case (e.g., crop-creation, land-assignment)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="form-title">Form Title *</Label>
                                <Input
                                    id="form-title"
                                    value={newFormData.title}
                                    onChange={(e) => setNewFormData({...newFormData, title: e.target.value})}
                                    placeholder="e.g., Crop Creation Form"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="form-type">Form Type</Label>
                                <Select 
                                    value={newFormData.type} 
                                    onValueChange={(value: any) => setNewFormData({...newFormData, type: value})}
                                >
                                    <SelectTrigger id="form-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="request">Request</SelectItem>
                                        <SelectItem value="registration">Registration</SelectItem>
                                        <SelectItem value="report">Report</SelectItem>
                                        <SelectItem value="application">Application</SelectItem>
                                        <SelectItem value="feedback">Feedback</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="form-category">Category</Label>
                                <Select 
                                    value={newFormData.category} 
                                    onValueChange={(value: any) => setNewFormData({...newFormData, category: value})}
                                >
                                    <SelectTrigger id="form-category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="land">Land</SelectItem>
                                        <SelectItem value="crop">Crop</SelectItem>
                                        <SelectItem value="equipment">Equipment</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="harvest">Harvest</SelectItem>
                                        <SelectItem value="financial">Financial</SelectItem>
                                        <SelectItem value="training">Training</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="form-description">Description</Label>
                            <Textarea
                                id="form-description"
                                value={newFormData.description}
                                onChange={(e) => setNewFormData({...newFormData, description: e.target.value})}
                                placeholder="Describe what this form is for..."
                                rows={3}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Target Roles</Label>
                            <div className="flex flex-wrap gap-2">
                                {['admin', 'unit_leader', 'member'].map((role) => (
                                    <Button
                                        key={role}
                                        variant={newFormData.target_roles.includes(role) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            const roles = newFormData.target_roles.includes(role)
                                                ? newFormData.target_roles.filter(r => r !== role)
                                                : [...newFormData.target_roles, role];
                                            setNewFormData({ ...newFormData, target_roles: roles });
                                        }}
                                        type="button"
                                    >
                                        {role.replace('_', ' ')}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Form Fields</Label>
                            <div className="space-y-2">
                                {newFormData.fields.map((field, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                        <Input
                                            value={field.name}
                                            onChange={(e) => {
                                                const updatedFields = [...newFormData.fields];
                                                updatedFields[index].name = e.target.value;
                                                setNewFormData({...newFormData, fields: updatedFields});
                                            }}
                                            placeholder="Field name"
                                            className="flex-1"
                                        />
                                        <Select 
                                            value={field.type} 
                                            onValueChange={(value: any) => {
                                                const updatedFields = [...newFormData.fields];
                                                updatedFields[index].type = value;
                                                setNewFormData({...newFormData, fields: updatedFields});
                                            }}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="textarea">Textarea</SelectItem>
                                                <SelectItem value="select">Select</SelectItem>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const updatedFields = newFormData.fields.filter((_, i) => i !== index);
                                                setNewFormData({...newFormData, fields: updatedFields});
                                            }}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const newField = {
                                            name: `field_${newFormData.fields.length + 1}`,
                                            type: 'text',
                                            label: `Field ${newFormData.fields.length + 1}`,
                                            required: false
                                        };
                                        setNewFormData({
                                            ...newFormData, 
                                            fields: [...newFormData.fields, newField]
                                        });
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Field
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-4">
                        <Button 
                            onClick={createNewForm} 
                            disabled={creatingForm || !newFormData.name || !newFormData.title}
                            className="flex items-center gap-2"
                        >
                            {creatingForm ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Create Form
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowCreateForm(false)}
                            disabled={creatingForm}
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
} 