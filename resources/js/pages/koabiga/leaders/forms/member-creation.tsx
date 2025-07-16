import { Head, router } from '@inertiajs/react';
import { 
    UserPlus,
    Save,
    X,
    ArrowLeft,
    LoaderCircle,
    AlertTriangle,
    CheckCircle,
    Building2,
    Phone,
    User,
    Shield
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface Unit {
    id: number;
    name: string;
    code: string;
}

interface FormData {
    christian_name: string;
    family_name: string;
    phone: string;
    secondary_phone: string;
    id_passport: string;
    pin: string;
    unit_id: string;
}

interface MemberData {
    christian_name: string;
    family_name: string;
    phone: string;
    secondary_phone?: string;
    id_passport: string;
    role: string;
    unit_id: number;
    password: string;
    password_confirmation: string;
}

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
        title: 'Member Creation',
        href: '/koabiga/leaders/forms/member-creation',
    },
];

export default function MemberCreationForm() {
    const [formData, setFormData] = useState<FormData>({
        christian_name: '',
        family_name: '',
        phone: '',
        secondary_phone: '',
        id_passport: '',
        pin: '12123', // Default PIN
        unit_id: ''
    });

    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(false);
    const [unitsLoading, setUnitsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            setUnitsLoading(true);
            const response = await axios.get('/api/leaders/unit');
            if (response.data.success) {
                const unit = response.data.data;
                setUnits([unit]);
                setFormData(prev => ({ ...prev, unit_id: unit.id.toString() }));
            } else {
                setError('No unit assigned to this leader');
            }
        } catch (err) {
            console.error('Error fetching units:', err);
            setError('Failed to load units');
        } finally {
            setUnitsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.christian_name.trim()) {
            errors.christian_name = 'Christian name is required';
        }

        if (!formData.family_name.trim()) {
            errors.family_name = 'Family name is required';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^07\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
            errors.phone = 'Please enter a valid Rwandan phone number (07XXXXXXXX)';
        }

        if (formData.secondary_phone && formData.secondary_phone.trim()) {
            if (!/^07\d{8}$/.test(formData.secondary_phone.replace(/\s/g, ''))) {
                errors.secondary_phone = 'Please enter a valid Rwandan phone number (07XXXXXXXX)';
            }
            if (formData.secondary_phone === formData.phone) {
                errors.secondary_phone = 'Secondary phone number cannot be the same as primary phone number';
            }
        }

        if (!formData.id_passport.trim()) {
            errors.id_passport = 'ID/Passport number is required';
        }

        // Unit ID will be automatically set from the unit leader's unit
        if (!formData.unit_id) {
            errors.unit_id = 'Unit information not available';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const memberData: MemberData = {
                christian_name: formData.christian_name,
                family_name: formData.family_name,
                phone: formData.phone,
                secondary_phone: formData.secondary_phone || undefined,
                id_passport: formData.id_passport,
                role: 'member',
                unit_id: parseInt(formData.unit_id),
                password: formData.pin, // Use PIN as password for member login
                password_confirmation: formData.pin
            };

            const response = await axios.post('/api/leaders/members', memberData);

            if (response.data.success) {
                setSuccess('Member created successfully!');
                setFormData({
                    christian_name: '',
                    family_name: '',
                    phone: '',
                    secondary_phone: '',
                    id_passport: '',
                    pin: '12123', // Reset to default PIN
                    unit_id: ''
                });
                setFormErrors({});
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    router.visit('/koabiga/leaders/leader-members');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to create member');
            }
        } catch (err: any) {
            console.error('Error creating member:', err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError(err.response?.data?.message || 'Failed to create member. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.visit('/koabiga/leaders/leader-members');
    };

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Member Creation Form - Unit Leader" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Member Creation Form</h1>
                            <p className="text-gray-600 dark:text-gray-400">Add new members to your unit</p>
                        </div>
                <div className="mb-4">
                    <Button onClick={handleCancel} variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Members
                    </Button>
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
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Member Information</CardTitle>
                                <CardDescription>Enter the new member's details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Personal Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="christian_name">Christian Name *</Label>
                                                <Input
                                                    id="christian_name"
                                                    name="christian_name"
                                                    type="text"
                                                    autoComplete="given-name"
                                                    value={formData.christian_name}
                                                    onChange={(e) => setFormData({...formData, christian_name: e.target.value})}
                                                    placeholder="Enter christian name"
                                                    className={formErrors.christian_name ? 'border-red-500' : ''}
                                                    required
                                                />
                                                {formErrors.christian_name && (
                                                    <p className="text-sm text-red-600">{formErrors.christian_name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="family_name">Family Name *</Label>
                                                <Input
                                                    id="family_name"
                                                    name="family_name"
                                                    type="text"
                                                    autoComplete="family-name"
                                                    value={formData.family_name}
                                                    onChange={(e) => setFormData({...formData, family_name: e.target.value})}
                                                    placeholder="Enter family name"
                                                    className={formErrors.family_name ? 'border-red-500' : ''}
                                                    required
                                                />
                                                {formErrors.family_name && (
                                                    <p className="text-sm text-red-600">{formErrors.family_name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Contact Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Phone className="h-5 w-5" />
                                            Contact Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number *</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        type="tel"
                                                        autoComplete="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                        placeholder="07XXXXXXXX"
                                                        className={formErrors.phone ? 'border-red-500' : ''}
                                                        required
                                                    />
                                                    {formErrors.phone && (
                                                        <p className="text-sm text-red-600">{formErrors.phone}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        Use Rwandan format: 07XXXXXXXX (10 digits starting with 07)
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="secondary_phone">Secondary Phone (Optional)</Label>
                                                    <Input
                                                        id="secondary_phone"
                                                        name="secondary_phone"
                                                        type="tel"
                                                        autoComplete="tel"
                                                        value={formData.secondary_phone}
                                                        onChange={(e) => setFormData({...formData, secondary_phone: e.target.value})}
                                                        placeholder="07XXXXXXXX"
                                                        className={formErrors.secondary_phone ? 'border-red-500' : ''}
                                                    />
                                                    {formErrors.secondary_phone && (
                                                        <p className="text-sm text-red-600">{formErrors.secondary_phone}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        Can be used for login if different from primary phone
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Security Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Security Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="id_passport">ID/Passport Number *</Label>
                                                <Input
                                                    id="id_passport"
                                                    name="id_passport"
                                                    type="text"
                                                    autoComplete="off"
                                                    value={formData.id_passport}
                                                    onChange={(e) => setFormData({...formData, id_passport: e.target.value})}
                                                    placeholder="Enter ID or passport number"
                                                    className={formErrors.id_passport ? 'border-red-500' : ''}
                                                    required
                                                />
                                                {formErrors.id_passport && (
                                                    <p className="text-sm text-red-600">{formErrors.id_passport}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pin">PIN *</Label>
                                                <Input
                                                    id="pin"
                                                    name="pin"
                                                    type="text"
                                                    autoComplete="off"
                                                    value={formData.pin}
                                                    placeholder="Default PIN"
                                                    className="bg-gray-50 cursor-not-allowed"
                                                    disabled
                                                    readOnly
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Default PIN automatically assigned
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Unit Assignment */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            Unit Assignment
                                        </h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="unit_id">Assign to Unit *</Label>
                                            <Select 
                                                value={formData.unit_id} 
                                                onValueChange={(value) => setFormData({...formData, unit_id: value})}
                                                disabled={true}
                                            >
                                                <SelectTrigger className={formErrors.unit_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Loading unit..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {units.map((unit) => (
                                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                                            {unit.name} ({unit.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.unit_id && (
                                                <p className="text-sm text-red-600">{formErrors.unit_id}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Members will be automatically assigned to your unit.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex items-center gap-4 pt-6">
                                        <Button 
                                            type="submit" 
                                            disabled={loading}
                                            className="flex items-center gap-2"
                                        >
                                            {loading ? (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Create Member
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={handleCancel}
                                            disabled={loading}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Form Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">Member Creation</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Use this form to add new members to your agricultural unit. All required fields are marked with an asterisk (*).
                                </p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Form Type:</span>
                                        <span className="font-medium">Registration</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Category:</span>
                                        <span className="font-medium">Member Management</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Access Level:</span>
                                        <span className="font-medium">Unit Leaders</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Instructions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Instructions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Required Fields</h4>
                                    <ul className="text-xs text-muted-foreground space-y-1">
                                        <li>• Christian Name</li>
                                        <li>• Family Name</li>
                                        <li>• Phone Number (Rwandan format)</li>
                                        <li>• ID/Passport Number</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Phone Number Format</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Use Rwandan format: 07XXXXXXXX (10 digits starting with 07)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">PIN Assignment</h4>
                                    <p className="text-xs text-muted-foreground">
                                        A default PIN (12123) is automatically assigned to all new members
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Unit Assignment</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Members are automatically assigned to your unit and cannot be changed
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </UnitLeaderLayout>
    );
} 