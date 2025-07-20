import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Save, 
    MapPin, 
    User, 
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';

interface Leader {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface Zone {
    id: number;
    name: string;
    code: string;
    leader_id: number | null;
    status: string;
    description: string;
    location: string;
}

interface EditZoneProps {
    zone: Zone;
    availableLeaders: Leader[];
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
}

export default function EditZone({ zone, availableLeaders, flash }: EditZoneProps) {
    const [formData, setFormData] = useState({
        name: zone.name,
        code: zone.code,
        description: zone.description || '',
        location: zone.location || '',
        leader_id: zone.leader_id ? String(zone.leader_id) : 'none',
        status: zone.status
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Handle flash messages from server
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
        }
        if (flash?.error) {
            setErrorMessage(flash.error);
            // Clear error message after 5 seconds
            setTimeout(() => setErrorMessage(null), 5000);
        }
    }, [flash]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Zone name is required';
        }

        if (!formData.code.trim()) {
            newErrors.code = 'Zone code is required';
        } else if (formData.code.length < 2) {
            newErrors.code = 'Zone code must be at least 2 characters';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await router.put(`/koabiga/admin/admin-zones/${zone.id}`, {
                ...formData,
                leader_id: formData.leader_id === 'none' ? null : formData.leader_id
            }, {
                onSuccess: () => {
                    router.visit(`/koabiga/admin/admin-zones/${zone.id}`);
                },
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error updating zone:', error);
            setErrorMessage('An error occurred while updating the zone');
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'inactive': return <X className="w-4 h-4 text-red-600" />;
            default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/koabiga/admin' },
            { title: 'Zones Management', href: '/koabiga/admin/admin-zones' },
            { title: 'Edit Zone', href: `/koabiga/admin/admin-zones/${zone.id}/edit` }
        ]}>
            <Head title={`Edit ${zone.name} - Koabiga Admin`} />
            
            <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 p-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Zone</h1>
                    </div>
                </div>

                {/* Form Container with Back Button */}
                <div className="w-full max-w-2xl space-y-2">
                    {/* Back Button */}
                    <div className="flex justify-start">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit(`/koabiga/admin/admin-zones/${zone.id}`)}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                                <span>Zone Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-2">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="name">Zone Name *</Label>
                                        <Input
                                            id="name"
                                            placeholder="Enter zone name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="code">Zone Code *</Label>
                                        <Input
                                            id="code"
                                            placeholder="e.g., NAZ, SVZ"
                                            value={formData.code}
                                            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                            className={errors.code ? 'border-red-500' : ''}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {errors.code}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* Location */}
                                <div className="space-y-1">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g., Northern Region, District A"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        className={errors.location ? 'border-red-500' : ''}
                                    />
                                    {errors.location && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            {errors.location}
                                        </p>
                                    )}
                                </div>
                                {/* Description */}
                                <div className="space-y-1">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the zone's characteristics, climate, soil type, etc."
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            {errors.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        {formData.description.length}/500 characters
                                    </p>
                                </div>
                                {/* Leader Assignment */}
                                <div className="space-y-1">
                                    <Label htmlFor="leader">Zone Leader</Label>
                                    <Select
                                        value={formData.leader_id}
                                        onValueChange={(value) => handleInputChange('leader_id', value)}
                                    >
                                        <SelectTrigger className={errors.leader_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select a leader (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Leader Assigned</SelectItem>
                                            {availableLeaders
                                                .filter(leader => leader && leader.id && leader.name)
                                                .map((leader) => (
                                                    <SelectItem key={leader.id} value={String(leader.id)}>
                                                        <div className="flex items-center space-x-2">
                                                            <User className="w-4 h-4" />
                                                            <span>{leader.name}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {leader.email}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            {availableLeaders.filter(leader => leader && leader.id && leader.name).length === 0 && (
                                                <SelectItem value="none" disabled>
                                                    No available leaders
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.leader_id && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            {errors.leader_id}
                                        </p>
                                    )}
                                    {availableLeaders.length === 0 && (
                                        <p className="text-sm text-yellow-600 flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            No available leaders found. You can assign a leader later.
                                        </p>
                                    )}
                                </div>
                                {/* Status */}
                                <div className="space-y-1">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span>Active</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                <div className="flex items-center space-x-2">
                                                    <X className="w-4 h-4 text-red-600" />
                                                    <span>Inactive</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500">
                                        Active zones can be assigned units and members
                                    </p>
                                </div>
                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-4 pt-2 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(`/koabiga/admin/admin-zones/${zone.id}`)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Update Zone
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            {/* Toast Notifications */}
            {successMessage && (
                <Toast 
                    message={successMessage} 
                    type="success"
                    onDismiss={() => setSuccessMessage(null)}
                />
            )}
            {errorMessage && (
                <Toast 
                    message={errorMessage} 
                    type="error"
                    onDismiss={() => setErrorMessage(null)}
                />
            )}
        </AppLayout>
    );
} 