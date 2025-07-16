import { Head, router } from '@inertiajs/react';
import { 
    FileText,
    Save,
    X,
    ArrowLeft,
    LoaderCircle,
    AlertTriangle,
    CheckCircle,
    User,
    Calendar,
    MapPin,
    Building2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

import UnitLeaderLayout from '@/layouts/unit-leader-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FormField {
    name: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email';
    label: string;
    required: boolean;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    description?: string;
}

interface Form {
    id: number;
    title: string;
    description: string;
    type: string;
    category: string;
    fields: FormField[];
    status: string;
    target_roles: string[];
    created_at: string;
    updated_at: string;
}

interface FormData {
    [key: string]: string | number | boolean | string[];
}

interface Unit {
    id: number;
    name: string;
    code: string;
}

interface Land {
    id: number;
    land_name: string;
    location: string;
    area_hectares: number;
    member_id: number;
}

interface Member {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
}

interface DynamicFormProps {
    formId: string;
}

export default function DynamicForm({ formId }: DynamicFormProps) {
    const [form, setForm] = useState<Form | null>(null);
    const [formData, setFormData] = useState<FormData>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Additional data for form fields
    const [units, setUnits] = useState<Unit[]>([]);
    const [lands, setLands] = useState<Land[]>([]);
    const [members, setMembers] = useState<Member[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Unit Leader Dashboard',
            href: '/koabiga/leaders/dashboard',
        },
        {
            title: 'Forms',
            href: '/koabiga/leaders/forms',
        },
        {
            title: form?.title || 'Loading...',
            href: `/koabiga/leaders/forms/${formId}`,
        },
    ];

    useEffect(() => {
        fetchForm();
        fetchAdditionalData();
    }, [formId]);

    const fetchForm = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(`/api/admin/forms/${formId}`);
            
            if (response.data.success) {
                const formData = response.data.data;
                setForm(formData);
                
                // Initialize form data with empty values
                const initialData: FormData = {};
                formData.fields.forEach((field: FormField) => {
                    if (field.type === 'checkbox') {
                        initialData[field.name] = false;
                    } else if (field.type === 'radio') {
                        initialData[field.name] = '';
                    } else {
                        initialData[field.name] = '';
                    }
                });
                setFormData(initialData);
            } else {
                setError(response.data.message || 'Failed to fetch form');
            }
        } catch (err: any) {
            console.error('Error fetching form:', err);
            setError('Failed to load form');
        } finally {
            setLoading(false);
        }
    };

    const fetchAdditionalData = async () => {
        try {
            // Fetch units
            const unitsResponse = await axios.get('/api/unit-leader/unit');
            if (unitsResponse.data.success) {
                setUnits([unitsResponse.data.data]);
            }

            // Fetch lands
            const landsResponse = await axios.get('/api/unit-leader/land');
            if (landsResponse.data.success) {
                setLands(landsResponse.data.data || []);
            }

            // Fetch members
            const membersResponse = await axios.get('/api/unit-leader/members');
            if (membersResponse.data.success) {
                setMembers(membersResponse.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching additional data:', err);
        }
    };

    const validateForm = (): boolean => {
        if (!form) return false;

        const errors: Record<string, string> = {};

        form.fields.forEach((field: FormField) => {
            const value = formData[field.name];
            
            if (field.required) {
                if (field.type === 'checkbox') {
                    if (!value) {
                        errors[field.name] = `${field.label} is required`;
                    }
                } else {
                    if (!value || (typeof value === 'string' && !value.trim())) {
                        errors[field.name] = `${field.label} is required`;
                    }
                }
            }

            // Additional validation for specific field types
            if (field.type === 'email' && value && typeof value === 'string') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors[field.name] = 'Please enter a valid email address';
                }
            }

            if (field.type === 'number' && value && typeof value === 'string') {
                if (isNaN(Number(value)) || Number(value) < 0) {
                    errors[field.name] = 'Please enter a valid number';
                }
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form) return;

        if (!validateForm()) {
            setError('Please fix the errors in the form');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await axios.post('/api/unit-leader/forms/submit', {
                form_id: form.id,
                form_data: formData,
                submitted_by: 'unit_leader'
            });

            if (response.data.success) {
                setSuccess('Form submitted successfully!');
                setTimeout(() => {
                    router.visit('/koabiga/leaders/forms');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to submit form');
            }
        } catch (err: any) {
            console.error('Error submitting form:', err);
            setError(err.response?.data?.message || 'Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.visit('/koabiga/leaders/forms');
    };

    const renderField = (field: FormField) => {
        const fieldId = `field_${field.name}`;
        const fieldName = field.name;
        const fieldValue = formData[field.name];
        const fieldError = formErrors[field.name];

        // Get autocomplete attribute based on field type and name
        const getAutocomplete = (): string => {
            const name = field.name.toLowerCase();
            if (name.includes('name')) return 'name';
            if (name.includes('email')) return 'email';
            if (name.includes('phone')) return 'tel';
            if (name.includes('date')) return 'off';
            if (name.includes('address')) return 'street-address';
            if (name.includes('city')) return 'address-level2';
            if (name.includes('state')) return 'address-level1';
            if (name.includes('zip') || name.includes('postal')) return 'postal-code';
            return 'off';
        };

        switch (field.type) {
            case 'text':
            case 'email':
                return (
                    <div key={fieldId} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={fieldId}
                            name={fieldName}
                            type={field.type}
                            value={fieldValue as string}
                            onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
                            placeholder={field.placeholder}
                            autoComplete={getAutocomplete()}
                            className={fieldError ? 'border-red-500' : ''}
                            required={field.required}
                        />
                        {field.description && (
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                        )}
                        {fieldError && (
                            <p className="text-sm text-red-600">{fieldError}</p>
                        )}
                    </div>
                );

            case 'number':
                return (
                    <div key={fieldId} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={fieldId}
                            name={fieldName}
                            type="number"
                            step="0.01"
                            min="0"
                            value={fieldValue as string}
                            onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
                            placeholder={field.placeholder}
                            autoComplete="off"
                            className={fieldError ? 'border-red-500' : ''}
                            required={field.required}
                        />
                        {field.description && (
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                        )}
                        {fieldError && (
                            <p className="text-sm text-red-600">{fieldError}</p>
                        )}
                    </div>
                );

            case 'date':
                return (
                    <div key={fieldId} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={fieldId}
                            name={fieldName}
                            type="date"
                            value={fieldValue as string}
                            onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
                            autoComplete="off"
                            className={fieldError ? 'border-red-500' : ''}
                            required={field.required}
                        />
                        {field.description && (
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                        )}
                        {fieldError && (
                            <p className="text-sm text-red-600">{fieldError}</p>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={fieldId} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Textarea
                            id={fieldId}
                            name={fieldName}
                            value={fieldValue as string}
                            onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
                            placeholder={field.placeholder}
                            autoComplete="off"
                            className={fieldError ? 'border-red-500' : ''}
                            required={field.required}
                            rows={4}
                        />
                        {field.description && (
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                        )}
                        {fieldError && (
                            <p className="text-sm text-red-600">{fieldError}</p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={fieldId} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Select 
                            value={fieldValue as string} 
                            onValueChange={(value) => setFormData({...formData, [fieldName]: value})}
                        >
                            <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
                                <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field.description && (
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                        )}
                        {fieldError && (
                            <p className="text-sm text-red-600">{fieldError}</p>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={fieldId} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={fieldId}
                                name={fieldName}
                                checked={fieldValue as boolean}
                                onCheckedChange={(checked) => setFormData({...formData, [fieldName]: checked})}
                                required={field.required}
                            />
                            <Label htmlFor={fieldId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>
                        </div>
                        {field.description && (
                            <p className="text-sm text-muted-foreground ml-6">{field.description}</p>
                        )}
                        {fieldError && (
                            <p className="text-sm text-red-600 ml-6">{fieldError}</p>
                        )}
                    </div>
                );

            case 'radio':
                return (
                    <div key={fieldId} className="space-y-2">
                        <Label>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <RadioGroup
                            value={fieldValue as string}
                            onValueChange={(value) => setFormData({...formData, [fieldName]: value})}
                            required={field.required}
                        >
                            {field.options?.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={`${fieldId}_${option.value}`} />
                                    <Label htmlFor={`${fieldId}_${option.value}`}>{option.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {field.description && (
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                        )}
                        {fieldError && (
                            <p className="text-sm text-red-600">{fieldError}</p>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <UnitLeaderLayout breadcrumbs={breadcrumbs}>
                <Head title="Loading Form - Unit Leader Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-center py-8">
                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading form...</span>
                    </div>
                </div>
            </UnitLeaderLayout>
        );
    }

    if (!form) {
        return (
            <UnitLeaderLayout breadcrumbs={breadcrumbs}>
                <Head title="Form Not Found - Unit Leader Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                            {error || 'Form not found'}
                        </AlertDescription>
                    </Alert>
                    <Button variant="outline" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Forms
                    </Button>
                </div>
            </UnitLeaderLayout>
        );
    }

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title={`${form.title} - Unit Leader Dashboard`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{form.title}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{form.description}</p>
                    </div>
                    <Button variant="outline" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Forms
                    </Button>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {form.title}
                        </CardTitle>
                        <CardDescription>{form.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6">
                                {form.fields.map((field) => renderField(field))}
                            </div>

                            <Separator />

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={handleCancel} type="button">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Submit Form
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </UnitLeaderLayout>
    );
} 