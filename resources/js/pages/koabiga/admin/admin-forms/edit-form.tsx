import { Head, router } from '@inertiajs/react';
import { 
    ClipboardList, 
    Save,
    X,
    Plus,
    Trash2,
    LoaderCircle,
    AlertTriangle,
    CheckCircle,
    ArrowLeft,
    Eye,
    Settings,
    FileText,
    Calendar,
    Users,
    MapPin,
    Sprout,
    Package,
    Shield,
    Database,
    BarChart3,
    Clock,
    Star,
    Heart,
    Zap,
    Target,
    TrendingUp,
    Activity,
    Building2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface FormField {
    name: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email';
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    description?: string;
}

interface FormData {
    id?: number;
    title: string;
    type: 'request' | 'registration' | 'report' | 'application' | 'feedback';
    category: 'land' | 'crop' | 'equipment' | 'member' | 'harvest' | 'financial' | 'training' | 'other';
    description: string;
    fields: FormField[];
    status: 'active' | 'draft' | 'inactive';
    target_roles: string[];
}

const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' },
    { value: 'date', label: 'Date Picker' },
    { value: 'number', label: 'Number Input' },
    { value: 'email', label: 'Email Input' },
];

const formTypes = [
    { value: 'request', label: 'Request Form' },
    { value: 'registration', label: 'Registration Form' },
    { value: 'report', label: 'Report Form' },
    { value: 'application', label: 'Application Form' },
    { value: 'feedback', label: 'Feedback Form' },
];

const formCategories = [
    { value: 'land', label: 'Land Management' },
    { value: 'crop', label: 'Crop Management' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'member', label: 'Member Management' },
    { value: 'harvest', label: 'Harvest' },
    { value: 'financial', label: 'Financial' },
    { value: 'training', label: 'Training' },
    { value: 'other', label: 'Other' },
];

const targetRoles = [
    { value: 'admin', label: 'Admin' },
    { value: 'unit_leader', label: 'Unit Leader' },
    { value: 'member', label: 'Member' },
];

export default function EditForm() {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        type: 'request',
        category: 'other',
        description: '',
        fields: [],
        status: 'draft',
        target_roles: ['unit_leader']
    });

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [newOption, setNewOption] = useState('');
    const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);

    // Get form ID from URL - extract from /koabiga/admin/forms/{id}/edit
    const pathSegments = window.location.pathname.split('/');
    const formId = pathSegments[pathSegments.length - 2]; // Get the ID before 'edit'

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
            title: 'Edit Form',
            href: `/koabiga/admin/admin-forms/${formId}/edit`,
        },
    ];

    useEffect(() => {
        if (formId && formId !== 'edit') {
            fetchForm();
        } else {
            setError('Invalid form ID');
            setLoading(false);
        }
    }, [formId]);

    const fetchForm = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching form with ID:', formId);
            const response = await axios.get(`/api/admin/forms/${formId}`);
            
            if (response.data.success) {
                const form = response.data.data;
                console.log('Fetched form data:', form);
                
                const updatedFormData = {
                    id: form.id,
                    title: form.title || '',
                    type: form.type || 'request',
                    category: form.category || 'other',
                    description: form.description || '',
                    fields: form.fields || [],
                    status: form.status || 'draft',
                    target_roles: form.target_roles || ['unit_leader']
                };
                
                console.log('Setting form data:', updatedFormData);
                setFormData(updatedFormData);
            } else {
                setError('Failed to load form data');
            }
        } catch (err: any) {
            console.error('Error fetching form:', err);
            if (err.response?.status === 401) {
                setError('Authentication required. Please login as admin.');
            } else if (err.response?.status === 403) {
                setError('Access denied. Admin role required.');
            } else if (err.response?.status === 404) {
                setError('Form not found.');
            } else {
                setError('Failed to load form data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            // Validate required fields
            if (!formData.title.trim()) {
                setError('Form title is required');
                return;
            }

            if (formData.fields.length === 0) {
                setError('At least one form field is required');
                return;
            }

            // Validate field names are unique
            const fieldNames = formData.fields.map(f => f.name);
            const uniqueNames = new Set(fieldNames);
            if (fieldNames.length !== uniqueNames.size) {
                setError('Field names must be unique');
                return;
            }

            const response = await axios.put(`/api/admin/forms/${formId}`, formData);
            
            if (response.data.success) {
                setSuccess('Form updated successfully! Redirecting...');
                setTimeout(() => {
                    router.visit('/koabiga/admin/admin-forms');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to update form');
            }
        } catch (err: any) {
            console.error('Error updating form:', err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError(err.response?.data?.message || 'Failed to update form. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.visit('/koabiga/admin/admin-forms');
    };

    const addField = () => {
        const newField: FormField = {
            name: `field_${formData.fields.length + 1}`,
            type: 'text',
            label: `Field ${formData.fields.length + 1}`,
            required: false,
            placeholder: '',
            description: ''
        };
        setFormData({
            ...formData,
            fields: [...formData.fields, newField]
        });
        setEditingFieldIndex(formData.fields.length);
    };

    const updateField = (index: number, field: Partial<FormField>) => {
        const updatedFields = [...formData.fields];
        updatedFields[index] = { ...updatedFields[index], ...field };
        setFormData({
            ...formData,
            fields: updatedFields
        });
    };

    const removeField = (index: number) => {
        setFormData({
            ...formData,
            fields: formData.fields.filter((_, i) => i !== index)
        });
        if (editingFieldIndex === index) {
            setEditingFieldIndex(null);
        }
    };

    const addOption = (fieldIndex: number) => {
        if (newOption.trim()) {
            const field = formData.fields[fieldIndex];
            const options = [...(field.options || []), newOption.trim()];
            updateField(fieldIndex, { options });
            setNewOption('');
        }
    };

    const removeOption = (fieldIndex: number, optionIndex: number) => {
        const field = formData.fields[fieldIndex];
        const options = field.options?.filter((_, i) => i !== optionIndex) || [];
        updateField(fieldIndex, { options });
    };

    const toggleTargetRole = (role: string) => {
        const roles = formData.target_roles.includes(role)
            ? formData.target_roles.filter(r => r !== role)
            : [...formData.target_roles, role];
        setFormData({ ...formData, target_roles: roles });
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
            case 'feedback':
                return <Badge variant="outline" className="border-pink-200 text-pink-700">Feedback</Badge>;
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
            case 'training':
                return <Badge variant="outline" className="border-indigo-200 text-indigo-700">Training</Badge>;
            default:
                return <Badge variant="outline">{category}</Badge>;
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Edit Form - Koabiga Admin" />
                <div className="flex items-center justify-center py-8">
                    <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading form...</span>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Form - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleCancel} variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Form</h1>
                            <p className="text-gray-600 dark:text-gray-400">Modify form configuration and fields</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getTypeBadge(formData.type)}
                        {getCategoryBadge(formData.category)}
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

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Form details and configuration</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="form-title">Form Title *</Label>
                                    <Input
                                        id="form-title"
                                        name="form-title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="Enter form title"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="form-type">Form Type</Label>
                                        <Select 
                                            value={formData.type} 
                                            onValueChange={(value: any) => setFormData({...formData, type: value})}
                                        >
                                            <SelectTrigger id="form-type" name="form-type">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="form-category">Category</Label>
                                        <Select 
                                            value={formData.category} 
                                            onValueChange={(value: any) => setFormData({...formData, category: value})}
                                        >
                                            <SelectTrigger id="form-category" name="form-category">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formCategories.map((category) => (
                                                    <SelectItem key={category.value} value={category.value}>
                                                        {category.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="form-description">Description</Label>
                                    <Textarea
                                        id="form-description"
                                        name="form-description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Describe what this form is for..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="target-roles">Target Roles</Label>
                                    <div className="flex flex-wrap gap-2" id="target-roles" role="group" aria-labelledby="target-roles">
                                        {targetRoles.map((role) => (
                                            <Button
                                                key={role.value}
                                                variant={formData.target_roles.includes(role.value) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleTargetRole(role.value)}
                                                type="button"
                                                aria-pressed={formData.target_roles.includes(role.value)}
                                            >
                                                {role.label}
                                                {role.value === 'unit_leader' && <Building2 className="h-3 w-3 ml-1" />}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Unit Leader forms are specifically designed for unit leaders to fill out
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Fields */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Form Fields</CardTitle>
                                        <CardDescription>Add and configure form fields</CardDescription>
                                    </div>
                                    <Button 
                                        onClick={addField} 
                                        size="sm"
                                        type="button"
                                        aria-label="Add new form field"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Field
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {formData.fields.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No fields added</h3>
                                        <p className="text-sm text-muted-foreground">Add your first field to get started.</p>
                                    </div>
                                ) : (
                                    formData.fields.map((field, index) => (
                                        <Card key={index} className="border-2 border-dashed">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-medium">Field {index + 1}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEditingFieldIndex(editingFieldIndex === index ? null : index)}
                                                            type="button"
                                                            aria-label={`${editingFieldIndex === index ? 'Close' : 'Edit'} field ${index + 1} settings`}
                                                        >
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeField(index)}
                                                            className="text-red-600 hover:text-red-700"
                                                            type="button"
                                                            aria-label={`Delete field ${index + 1}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {editingFieldIndex === index ? (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`field-name-${index}`}>Field Name</Label>
                                                                <Input
                                                                    id={`field-name-${index}`}
                                                                    name={`field-name-${index}`}
                                                                    value={field.name}
                                                                    onChange={(e) => updateField(index, { name: e.target.value })}
                                                                    placeholder="field_name"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`field-type-${index}`}>Field Type</Label>
                                                                <Select 
                                                                    value={field.type} 
                                                                    onValueChange={(value: any) => updateField(index, { type: value })}
                                                                >
                                                                    <SelectTrigger id={`field-type-${index}`} name={`field-type-${index}`}>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {fieldTypes.map((type) => (
                                                                            <SelectItem key={type.value} value={type.value}>
                                                                                {type.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`field-label-${index}`}>Display Label</Label>
                                                            <Input
                                                                id={`field-label-${index}`}
                                                                name={`field-label-${index}`}
                                                                value={field.label}
                                                                onChange={(e) => updateField(index, { label: e.target.value })}
                                                                placeholder="Enter field label"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`field-placeholder-${index}`}>Placeholder</Label>
                                                            <Input
                                                                id={`field-placeholder-${index}`}
                                                                name={`field-placeholder-${index}`}
                                                                value={field.placeholder || ''}
                                                                onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                                                placeholder="Enter placeholder text"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`field-description-${index}`}>Description</Label>
                                                            <Textarea
                                                                id={`field-description-${index}`}
                                                                name={`field-description-${index}`}
                                                                value={field.description || ''}
                                                                onChange={(e) => updateField(index, { description: e.target.value })}
                                                                placeholder="Field description (optional)"
                                                                rows={2}
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                id={`field-required-${index}`}
                                                                name={`field-required-${index}`}
                                                                checked={field.required}
                                                                onCheckedChange={(checked) => updateField(index, { required: checked })}
                                                            />
                                                            <Label htmlFor={`field-required-${index}`}>Required field</Label>
                                                        </div>

                                                        {/* Options for select/radio/checkbox */}
                                                        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`field-option-input-${index}`}>Options</Label>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        id={`field-option-input-${index}`}
                                                                        name={`field-option-input-${index}`}
                                                                        value={newOption}
                                                                        onChange={(e) => setNewOption(e.target.value)}
                                                                        placeholder="Add option"
                                                                        onKeyPress={(e) => e.key === 'Enter' && addOption(index)}
                                                                    />
                                                                    <Button 
                                                                        onClick={() => addOption(index)} 
                                                                        size="sm" 
                                                                        type="button"
                                                                        aria-label={`Add option to field ${index + 1}`}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                                <div className="space-y-1" role="list" aria-label={`Options for field ${index + 1}`}>
                                                                    {field.options?.map((option, optionIndex) => (
                                                                        <div key={optionIndex} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded" role="listitem">
                                                                            <span className="text-sm">{option}</span>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => removeOption(index, optionIndex)}
                                                                                className="text-red-600 hover:text-red-700"
                                                                                type="button"
                                                                                aria-label={`Remove option "${option}" from field ${index + 1}`}
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{field.label}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline">{field.type}</Badge>
                                                                {field.required && <Badge variant="default" className="bg-red-100 text-red-800">Required</Badge>}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Name: {field.name} • Type: {field.type}
                                                            {field.placeholder && ` • Placeholder: ${field.placeholder}`}
                                                        </p>
                                                        {field.options && field.options.length > 0 && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Options: {field.options.join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Form Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Preview</CardTitle>
                                <CardDescription>How your form will appear</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <h3 className="font-medium">{formData.title || 'Untitled Form'}</h3>
                                    {formData.description && (
                                        <p className="text-sm text-muted-foreground">{formData.description}</p>
                                    )}
                                    <div className="space-y-2">
                                        {formData.fields.map((field, index) => (
                                            <div key={index} className="space-y-1">
                                                <Label htmlFor={`preview-${field.name}-${index}`} className="text-sm">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                                </Label>
                                                {field.type === 'text' && (
                                                    <Input 
                                                        id={`preview-${field.name}-${index}`}
                                                        name={`preview-${field.name}-${index}`}
                                                        placeholder={field.placeholder} 
                                                        disabled 
                                                    />
                                                )}
                                                {field.type === 'textarea' && (
                                                    <Textarea 
                                                        id={`preview-${field.name}-${index}`}
                                                        name={`preview-${field.name}-${index}`}
                                                        placeholder={field.placeholder} 
                                                        disabled 
                                                        rows={2} 
                                                    />
                                                )}
                                                {field.type === 'select' && (
                                                    <Select disabled>
                                                        <SelectTrigger id={`preview-${field.name}-${index}`} name={`preview-${field.name}-${index}`}>
                                                            <SelectValue placeholder={field.placeholder || "Select an option"} />
                                                        </SelectTrigger>
                                                    </Select>
                                                )}
                                                {field.type === 'checkbox' && (
                                                    <div className="flex items-center space-x-2">
                                                        <input 
                                                            type="checkbox" 
                                                            id={`preview-${field.name}-${index}`}
                                                            name={`preview-${field.name}-${index}`}
                                                            disabled 
                                                        />
                                                        <Label htmlFor={`preview-${field.name}-${index}`} className="text-sm">{field.label}</Label>
                                                    </div>
                                                )}
                                                {field.type === 'radio' && field.options && (
                                                    <div className="space-y-1" role="radiogroup" aria-labelledby={`preview-${field.name}-${index}-label`}>
                                                        <div id={`preview-${field.name}-${index}-label`} className="sr-only">{field.label}</div>
                                                        {field.options.map((option, optionIndex) => (
                                                            <div key={optionIndex} className="flex items-center space-x-2">
                                                                <input 
                                                                    type="radio" 
                                                                    id={`preview-${field.name}-${index}-${optionIndex}`}
                                                                    name={`preview-${field.name}-${index}`}
                                                                    disabled 
                                                                />
                                                                <Label htmlFor={`preview-${field.name}-${index}-${optionIndex}`} className="text-sm">{option}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {field.type === 'date' && (
                                                    <Input 
                                                        type="date" 
                                                        id={`preview-${field.name}-${index}`}
                                                        name={`preview-${field.name}-${index}`}
                                                        disabled 
                                                    />
                                                )}
                                                {field.type === 'number' && (
                                                    <Input 
                                                        type="number" 
                                                        id={`preview-${field.name}-${index}`}
                                                        name={`preview-${field.name}-${index}`}
                                                        placeholder={field.placeholder} 
                                                        disabled 
                                                    />
                                                )}
                                                {field.type === 'email' && (
                                                    <Input 
                                                        type="email" 
                                                        id={`preview-${field.name}-${index}`}
                                                        name={`preview-${field.name}-${index}`}
                                                        placeholder={field.placeholder} 
                                                        disabled 
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Settings</CardTitle>
                                <CardDescription>Additional configuration</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="form-status">Form Status</Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={(value: any) => setFormData({...formData, status: value})}
                                    >
                                        <SelectTrigger id="form-status" name="form-status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="form-statistics">Form Statistics</Label>
                                    <div className="space-y-1 text-sm" id="form-statistics" role="group" aria-labelledby="form-statistics">
                                        <div>Total Fields: {formData.fields.length}</div>
                                        <div>Required Fields: {formData.fields.filter(f => f.required).length}</div>
                                        <div>Target Roles: {formData.target_roles.length}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button 
                                    onClick={handleSave} 
                                    disabled={saving}
                                    className="w-full"
                                    type="button"
                                    aria-label="Update form"
                                >
                                    {saving ? (
                                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Update Form
                                </Button>
                                <Button 
                                    onClick={handleCancel} 
                                    variant="outline"
                                    className="w-full"
                                    type="button"
                                    aria-label="Cancel form editing"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 