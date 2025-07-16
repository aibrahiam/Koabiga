import { Head, router } from '@inertiajs/react';
import { 
    MapPin,
    Save,
    X,
    ArrowLeft,
    LoaderCircle,
    AlertTriangle,
    CheckCircle,
    Building2,
    Users,
    Ruler,
    Calendar
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

interface Unit {
    id: number;
    name: string;
    code: string;
}

interface Member {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
    unit_id: number | null;
}

interface FormData {
    land_number: string;
    zone: string;
    area: string;
    user_id: string;
    unit_id: string;
    notes: string;
    status: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/unit-leader/dashboard',
    },
    {
        title: 'Forms',
        href: '/koabiga/unit-leader/forms',
    },
    {
        title: 'Land Assignment',
        href: '/koabiga/unit-leader/forms/land-assignment',
    },
];

const soilTypes = [
    { value: 'clay', label: 'Clay' },
    { value: 'loam', label: 'Loam' },
    { value: 'sandy', label: 'Sandy' },
    { value: 'silt', label: 'Silt' },
    { value: 'peat', label: 'Peat' },
    { value: 'chalk', label: 'Chalk' },
    { value: 'other', label: 'Other' },
];

export default function LandAssignmentForm() {
    const [formData, setFormData] = useState<FormData>({
        land_number: '',
        zone: '',
        area: '',
        user_id: '',
        unit_id: '',
        notes: '',
        status: 'assigned'
    });

    const [units, setUnits] = useState<Unit[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [unitsLoading, setUnitsLoading] = useState(true);
    const [membersLoading, setMembersLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        if (formData.unit_id) {
            fetchMembers(formData.unit_id);
        } else {
            setMembers([]);
        }
    }, [formData.unit_id]);

    const fetchUnits = async () => {
        try {
            setUnitsLoading(true);
            const response = await axios.get('/api/unit-leader/unit');
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

    const fetchMembers = async (unitId: string) => {
        try {
            setMembersLoading(true);
            const response = await axios.get(`/api/unit-leader/members?unit_id=${unitId}&role=member`);
            if (response.data.success) {
                setMembers(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('Failed to load members');
        } finally {
            setMembersLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.land_number.trim()) {
            errors.land_number = 'Land number is required';
        }

        if (!formData.zone.trim()) {
            errors.zone = 'Zone is required';
        }

        if (!formData.area) {
            errors.area = 'Area is required';
        } else if (parseFloat(formData.area) <= 0) {
            errors.area = 'Area must be greater than 0';
        }

        if (!formData.user_id) {
            errors.user_id = 'Please select a member';
        }

        if (!formData.unit_id) {
            errors.unit_id = 'Please select a unit';
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

            const landData = {
                ...formData,
                area: parseFloat(formData.area),
                user_id: parseInt(formData.user_id),
                unit_id: parseInt(formData.unit_id),
                status: 'assigned'
            };

            const response = await axios.post('/api/unit-leader/land', landData);

            if (response.data.success) {
                setSuccess('Land assigned successfully!');
                setFormData({
                    land_number: '',
                    zone: '',
                    area: '',
                    user_id: '',
                    unit_id: '',
                    notes: '',
                    status: 'assigned'
                });
                setFormErrors({});
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    router.visit('/koabiga/unit-leader/forms');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to assign land');
            }
        } catch (err: any) {
            console.error('Error assigning land:', err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError(err.response?.data?.message || 'Failed to assign land. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.visit('/koabiga/unit-leader/forms');
    };

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Land Assignment Form - Unit Leader" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleCancel} variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Forms
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Land Assignment Form</h1>
                            <p className="text-gray-600 dark:text-gray-400">Assign land plots to unit members</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Unit Leader Form</span>
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
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Land Assignment Information</CardTitle>
                                <CardDescription>Assign land plots to unit members</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Land Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Land Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="land_number">Land Number *</Label>
                                                <Input
                                                    id="land_number"
                                                    value={formData.land_number}
                                                    onChange={(e) => setFormData({...formData, land_number: e.target.value})}
                                                    placeholder="Enter land number"
                                                    className={formErrors.land_number ? 'border-red-500' : ''}
                                                />
                                                {formErrors.land_number && (
                                                    <p className="text-sm text-red-600">{formErrors.land_number}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="zone">Zone *</Label>
                                                <Input
                                                    id="zone"
                                                    value={formData.zone}
                                                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                                                    placeholder="Enter zone"
                                                    className={formErrors.zone ? 'border-red-500' : ''}
                                                />
                                                {formErrors.zone && (
                                                    <p className="text-sm text-red-600">{formErrors.zone}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="area">Area (Hectares) *</Label>
                                                <Input
                                                    id="area"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.area}
                                                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                                                    placeholder="0.00"
                                                    className={formErrors.area ? 'border-red-500' : ''}
                                                />
                                                {formErrors.area && (
                                                    <p className="text-sm text-red-600">{formErrors.area}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Assignment Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Assignment Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="unit_id">Unit *</Label>
                                                <Select 
                                                    value={formData.unit_id} 
                                                    onValueChange={(value) => setFormData({...formData, unit_id: value, user_id: ''})}
                                                >
                                                    <SelectTrigger className={formErrors.unit_id ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select unit" />
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
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="user_id">Assign to Member *</Label>
                                                <Select 
                                                    value={formData.user_id} 
                                                    onValueChange={(value) => setFormData({...formData, user_id: value})}
                                                    disabled={!formData.unit_id || membersLoading}
                                                >
                                                    <SelectTrigger className={formErrors.user_id ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder={membersLoading ? "Loading members..." : "Select member"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {members.map((member) => (
                                                            <SelectItem key={member.id} value={member.id.toString()}>
                                                                {member.christian_name} {member.family_name} ({member.phone})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {formErrors.user_id && (
                                                    <p className="text-sm text-red-600">{formErrors.user_id}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Additional Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Ruler className="h-5 w-5" />
                                            Additional Information
                                        </h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                                placeholder="Additional notes about the land assignment..."
                                                rows={3}
                                            />
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
                                            Assign Land
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
                                    <MapPin className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">Land Assignment</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Use this form to assign land plots to unit members. All required fields are marked with an asterisk (*).
                                </p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Form Type:</span>
                                        <span className="font-medium">Request</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Category:</span>
                                        <span className="font-medium">Land Management</span>
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
                                        <li>• Land Name</li>
                                        <li>• Location</li>
                                        <li>• Area (in hectares)</li>
                                        <li>• Soil Type</li>
                                        <li>• Unit Selection</li>
                                        <li>• Member Assignment</li>
                                        <li>• Assignment Date</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Area Measurement</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Enter area in hectares (1 hectare = 10,000 square meters)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Member Assignment</h4>
                                    <p className="text-xs text-muted-foreground">
                                        First select a unit, then choose a member from that unit
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