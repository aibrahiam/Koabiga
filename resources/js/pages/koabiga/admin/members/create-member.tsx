import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, LoaderCircle, AlertTriangle, CheckCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToastContainer } from '@/components/ui/toast-container';

interface FormData {
    christian_name: string;
    family_name: string;
    id_passport: string;
    phone: string;
    role: 'admin' | 'unit_leader' | 'member';
    status: 'active' | 'inactive';
    zone_id: string | 'none';
    unit_id: string | 'none';
    pin: string;
}

interface FormErrors {
    christian_name?: string;
    family_name?: string;
    id_passport?: string;
    phone?: string;
    role?: string;
    status?: string;
    pin?: string;
    zone_id?: string;
    unit_id?: string;
}

export default function CreateMember() {
    const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [zones, setZones] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [loadingZones, setLoadingZones] = useState(true);
    const [formData, setFormData] = useState<FormData>({
        christian_name: '',
        family_name: '',
        id_passport: '',
        phone: '',
        role: 'member',
        status: 'active',
        zone_id: 'none',
        unit_id: 'none',
        pin: '12123',
    });

    const breadcrumbs = [
        { title: 'Admin Dashboard', href: '/koabiga/admin/dashboard' },
        { title: 'Members Management', href: '/koabiga/admin/members' },
        { title: 'Create Member', href: '/koabiga/admin/members/create' },
    ];

    // Fetch zones and units on component mount
    useEffect(() => {
        fetchZones();
    }, []);

    // Fetch units when zone changes
    useEffect(() => {
        if (formData.zone_id && formData.zone_id !== 'none') {
            fetchUnits(formData.zone_id);
        } else {
            setUnits([]);
            // Reset unit selection when zone is changed to 'none'
            setFormData(prev => ({ ...prev, unit_id: 'none' }));
        }
    }, [formData.zone_id]);

    const fetchZones = async () => {
        try {
            setLoadingZones(true);
            const response = await axios.get('/api/admin/zones');
            if (response.data.success) {
                setZones(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching zones:', err);
        } finally {
            setLoadingZones(false);
        }
    };

    const fetchUnits = async (zoneId: string) => {
        try {
            const response = await axios.get(`/api/admin/units?zone_id=${zoneId}`);
            if (response.data.success) {
                setUnits(response.data.data.data || response.data.data);
            }
        } catch (err) {
            console.error('Error fetching units:', err);
            setUnits([]);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.christian_name.trim()) {
            errors.christian_name = 'Christian name is required';
        } else if (formData.christian_name.length < 2) {
            errors.christian_name = 'Christian name must be at least 2 characters';
        } else if (formData.christian_name.length > 255) {
            errors.christian_name = 'Christian name must be less than 255 characters';
        }

        if (!formData.family_name.trim()) {
            errors.family_name = 'Family name is required';
        } else if (formData.family_name.length < 2) {
            errors.family_name = 'Family name must be at least 2 characters';
        } else if (formData.family_name.length > 255) {
            errors.family_name = 'Family name must be less than 255 characters';
        }

        if (!formData.id_passport.trim()) {
            errors.id_passport = 'ID/Passport number is required';
        } else if (formData.id_passport.length < 3) {
            errors.id_passport = 'ID/Passport number must be at least 3 characters';
        } else if (formData.id_passport.length > 50) {
            errors.id_passport = 'ID/Passport number must be less than 50 characters';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10,12}$/.test(formData.phone.replace(/\s/g, ''))) {
            errors.phone = 'Phone number must be 10-12 digits (with or without country code)';
        }

        if (!formData.pin.trim()) {
            errors.pin = 'PIN/Password is required';
        } else if (formData.pin.length !== 5) {
            errors.pin = 'PIN/Password must be exactly 5 digits';
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
            setSubmitting(true);
            setErrorMessage(null);
            setSuccessMessage(null);
            
            // Prepare the data for submission
            const submitData = {
                christian_name: formData.christian_name.trim(),
                family_name: formData.family_name.trim(),
                id_passport: formData.id_passport.trim(),
                phone: formData.phone.trim(),
                role: formData.role,
                status: formData.status,
                zone_id: formData.zone_id,
                unit_id: formData.unit_id,
                pin: formData.pin,
            };
            
            console.log('Submitting member data:', submitData);
            
            const response = await axios.post('/api/admin/members', submitData);
            console.log('Response:', response.data);
            
            if (response.data.success) {
                showSuccess('Member Created Successfully!', 'The new member has been added to the system.');
                
                // Redirect to members management page after 2 seconds
                setTimeout(() => {
                    router.visit('/koabiga/admin/members');
                }, 2000);
            } else {
                showError('Failed to Create Member', response.data.message || 'An unexpected error occurred.');
            }
            
        } catch (err: any) {
            console.error('Error creating member:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            // Handle validation errors
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
                showError('Validation Error', 'Please fix the validation errors below.');
            } 
            // Handle other API errors
            else if (err.response?.data?.message) {
                showError('API Error', err.response.data.message);
            } 
            // Handle network errors
            else if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
                showError('Network Error', 'Please check your connection and try again.');
            }
            // Handle timeout errors
            else if (err.code === 'ECONNABORTED') {
                showError('Request Timeout', 'The request took too long. Please try again.');
            }
            // Handle 500 server errors
            else if (err.response?.status === 500) {
                showError('Server Error', 'An internal server error occurred. Please try again later.');
            }
            // Generic error
            else {
                showError('Error', 'Failed to create member. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear field-specific error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
        
        // Clear general error when user starts typing
        if (errorMessage) {
            setErrorMessage(null);
        }
    };

    const resetForm = () => {
        setFormData({
            christian_name: '',
            family_name: '',
            id_passport: '',
            phone: '',
            role: 'member',
            status: 'active',
            zone_id: 'none',
            unit_id: 'none',
            pin: '12123',
        });
        setFormErrors({});
        setErrorMessage(null);
        setSuccessMessage(null);
        setShowPassword(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Member - Koabiga Admin" />
            
            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/koabiga/admin/members">
                            <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Members
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Create New Member</h1>
                            <p className="text-green-600 dark:text-green-400">Add a new member to the platform</p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {errorMessage && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {successMessage && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Create Form */}
                <Card className="border-green-200 dark:border-green-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <UserPlus className="h-5 w-5" />
                            Member Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="christian_name" className="text-green-700 dark:text-green-300">
                                        Christian Name *
                                    </Label>
                                    <Input
                                        id="christian_name"
                                        name="christian_name"
                                        value={formData.christian_name}
                                        onChange={(e) => handleInputChange('christian_name', e.target.value)}
                                        placeholder="e.g., John"
                                        autoComplete="given-name"
                                        className={`border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700 dark:focus:border-green-400 dark:focus:ring-green-400 ${
                                            formErrors.christian_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        required
                                        disabled={submitting}
                                    />
                                    {formErrors.christian_name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.christian_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="family_name" className="text-green-700 dark:text-green-300">
                                        Family Name *
                                    </Label>
                                    <Input
                                        id="family_name"
                                        name="family_name"
                                        value={formData.family_name}
                                        onChange={(e) => handleInputChange('family_name', e.target.value)}
                                        placeholder="e.g., Doe"
                                        autoComplete="family-name"
                                        className={`border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700 dark:focus:border-green-400 dark:focus:ring-green-400 ${
                                            formErrors.family_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        required
                                        disabled={submitting}
                                    />
                                    {formErrors.family_name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.family_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="id_passport" className="text-green-700 dark:text-green-300">
                                        ID/Passport Number *
                                    </Label>
                                    <Input
                                        id="id_passport"
                                        name="id_passport"
                                        value={formData.id_passport}
                                        onChange={(e) => handleInputChange('id_passport', e.target.value.toUpperCase())}
                                        placeholder="e.g., A1234567"
                                        autoComplete="off"
                                        className={`border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700 dark:focus:border-green-400 dark:focus:ring-green-400 ${
                                            formErrors.id_passport ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        required
                                        disabled={submitting}
                                    />
                                    {formErrors.id_passport && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.id_passport}</p>
                                    )}
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Enter the member's ID or passport number
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-green-700 dark:text-green-300">
                                        Phone Number *
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                                        placeholder="e.g., 0712345678 or 250781234567"
                                        maxLength={12}
                                        autoComplete="tel"
                                        className={`border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700 dark:focus:border-green-400 dark:focus:ring-green-400 ${
                                            formErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        required
                                        disabled={submitting}
                                    />
                                    {formErrors.phone && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.phone}</p>
                                    )}
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Enter with or without country code (250)
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-green-700 dark:text-green-300">
                                        Role *
                                    </Label>
                                    <Select 
                                        value={formData.role} 
                                        onValueChange={(value: 'admin' | 'unit_leader' | 'member') => handleInputChange('role', value)}
                                        disabled={submitting}
                                    >
                                        <SelectTrigger 
                                            id="role" 
                                            name="role"
                                            className="border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700 dark:focus:border-green-400 dark:focus:ring-green-400"
                                        >
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="unit_leader">Unit Leader</SelectItem>
                                            <SelectItem value="member">Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.role && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.role}</p>
                                    )}
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Assign the member's role in the platform
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-green-700 dark:text-green-300">
                                        Status *
                                    </Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}
                                        disabled={submitting}
                                    >
                                        <SelectTrigger 
                                            id="status" 
                                            name="status"
                                            className="border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700 dark:focus:border-green-400 dark:focus:ring-green-400"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formErrors.status && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.status}</p>
                                    )}
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Set the initial status of the member account
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="zone_id" className="text-green-700 dark:text-green-300">
                                        Assign to Zone *
                                    </Label>
                                    <Select 
                                        value={formData.zone_id} 
                                        onValueChange={(value: string | 'none') => handleInputChange('zone_id', value)}
                                        disabled={submitting || loadingZones}
                                    >
                                        <SelectTrigger 
                                            id="zone_id" 
                                            name="zone_id"
                                            className="border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700 dark:focus:border-green-400 dark:focus:ring-green-400"
                                        >
                                            <SelectValue placeholder={loadingZones ? "Loading zones..." : "Select a zone"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Zone</SelectItem>
                                            {zones.map((zone) => (
                                                <SelectItem key={zone.id} value={zone.id.toString()}>
                                                    {zone.name} ({zone.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.zone_id && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.zone_id}</p>
                                    )}
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Assign the member to a specific zone
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_id" className="text-green-700 dark:text-green-300">
                                        Assign to Unit *
                                    </Label>
                                    <Select 
                                        value={formData.unit_id} 
                                        onValueChange={(value: string | 'none') => handleInputChange('unit_id', value)}
                                        disabled={submitting}
                                    >
                                        <SelectTrigger 
                                            id="unit_id" 
                                            name="unit_id"
                                            className="border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700 dark:focus:border-green-400 dark:focus:ring-green-400"
                                        >
                                            <SelectValue placeholder="Select a unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Unit</SelectItem>
                                            {units.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                                    {unit.name} ({unit.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.unit_id && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.unit_id}</p>
                                    )}
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Assign the member to a specific unit within the zone
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pin" className="text-green-700 dark:text-green-300">
                                    PIN/Password *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="pin"
                                        name="pin"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.pin}
                                        onChange={(e) => handleInputChange('pin', e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                                        placeholder="Default PIN: 12123"
                                        maxLength={5}
                                        autoComplete="off"
                                        className={`border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700 dark:focus:border-green-400 dark:focus:ring-green-400 pr-10 ${
                                            formErrors.pin ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                        required
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={submitting}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {formErrors.pin && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{formErrors.pin}</p>
                                )}
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Default PIN is 12123. Members can change this after their first login.
                                </p>
                            </div>

                            <div className="flex gap-4 justify-end pt-6 border-t border-green-200 dark:border-green-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    disabled={submitting}
                                    className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                                >
                                    Reset Form
                                </Button>
                                <Link href="/koabiga/admin/members">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={submitting}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-green-700 hover:bg-green-800"
                                >
                                    {submitting ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                            Creating Member...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Create Member
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 