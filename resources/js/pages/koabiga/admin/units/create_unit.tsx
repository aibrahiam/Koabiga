import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    ArrowLeft, 
    Save, 
    Building2, 
    User, 
    AlertCircle,
    CheckCircle,
    X,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

interface Leader {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
    secondary_phone?: string;
}

interface Zone {
    id: number;
    name: string;
    code: string;
}

interface CreateUnitProps {
    availableLeaders?: Leader[];
    zones?: Zone[];
}

export default function CreateUnit({ availableLeaders = [], zones = [] }: CreateUnitProps) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        zone_id: '',
        leader_id: '',
        status: 'active'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);



    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Auto-generate code when zone is selected
        if (field === 'zone_id' && value) {
            generateUnitCode(value);
        }
    };

    const generateUnitCode = async (zoneId: string) => {
        setIsGeneratingCode(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch('/koabiga/admin/units/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ zone_id: zoneId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setFormData(prev => ({ ...prev, code: data.code }));
                setErrors(prev => ({ ...prev, code: '' }));
            } else {
                setErrors(prev => ({ ...prev, code: data.message || 'Failed to generate code' }));
            }
        } catch (error) {
            console.error('Error generating code:', error);
            setErrors(prev => ({ ...prev, code: 'Failed to generate code' }));
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Unit name is required';
        }

        if (!formData.zone_id) {
            newErrors.zone_id = 'Zone is required';
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
            await router.post('/koabiga/admin/units', {
                ...formData,
                leader_id: formData.leader_id === 'none' ? null : formData.leader_id
            }, {
                onSuccess: () => {
                    router.visit('/koabiga/admin/units');
                },
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error creating unit:', error);
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
            { title: 'Units Management', href: '/koabiga/admin/units' },
            { title: 'Create Unit', href: '/koabiga/admin/units/create' }
        ]}>
            <Head title="Create Unit - Koabiga Admin" />
            
            <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 p-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create New Unit</h1>
                    </div>
                </div>

                {/* Form Container with Back Button */}
                <div className="w-full max-w-2xl space-y-2">
                    {/* Back Button */}
                    <div className="flex justify-start">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit('/koabiga/admin/units')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                                <span>Unit Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Unit Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            autoComplete="off"
                                            placeholder="Enter unit name"
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

                                    <div className="space-y-2">
                                        <Label htmlFor="code">Unit Code (auto-generated)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="code"
                                                name="code"
                                                autoComplete="off"
                                                placeholder={isGeneratingCode ? "Generating..." : "Select a zone to generate code"}
                                                value={formData.code}
                                                className={errors.code ? 'border-red-500' : 'bg-gray-50 dark:bg-gray-800'}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                        {errors.code && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {errors.code}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Zone Assignment */}
                                <div className="space-y-2">
                                    <Label htmlFor="zone_id">Zone *</Label>
                                    <Select
                                        value={formData.zone_id}
                                        onValueChange={(value) => handleInputChange('zone_id', value)}
                                    >
                                        <SelectTrigger id="zone_id" className={errors.zone_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select a zone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {zones
                                                .filter(zone => zone && zone.id && zone.name)
                                                .map((zone) => (
                                                    <SelectItem key={zone.id} value={String(zone.id)}>
                                                        <div className="flex items-center space-x-2">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{zone.name}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {zone.code}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            {zones.filter(zone => zone && zone.id && zone.name).length === 0 && (
                                                <SelectItem value="none" disabled>
                                                    No available zones
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.zone_id && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            {errors.zone_id}
                                        </p>
                                    )}
                                    {zones.length === 0 && (
                                        <p className="text-sm text-yellow-600 flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            No available zones found. Please create zones first.
                                        </p>
                                    )}
                                </div>

                                {/* Leader Assignment */}
                                <div className="space-y-2">
                                    <Label htmlFor="leader_id">Unit Leader</Label>
                                    <Select
                                        value={formData.leader_id}
                                        onValueChange={(value) => handleInputChange('leader_id', value)}
                                    >
                                        <SelectTrigger id="leader_id" className={errors.leader_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select a leader (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Leader Assigned</SelectItem>
                                            {availableLeaders
                                                .filter(leader => leader && leader.id && leader.christian_name)
                                                .map((leader) => (
                                                    <SelectItem key={leader.id} value={String(leader.id)}>
                                                        <div className="flex items-center space-x-2">
                                                            <User className="w-4 h-4" />
                                                            <span>{leader.christian_name} {leader.family_name}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {leader.phone}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            {availableLeaders.filter(leader => leader && leader.id && leader.christian_name).length === 0 && (
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
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger id="status">
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
                                        Active units can be assigned members and participate in operations
                                    </p>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit('/koabiga/admin/units')}
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
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Create Unit
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 