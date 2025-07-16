import { Head, router } from '@inertiajs/react';
import { 
    Sprout,
    Save,
    X,
    ArrowLeft,
    LoaderCircle,
    AlertTriangle,
    CheckCircle,
    Building2,
    MapPin,
    Calendar,
    Ruler,
    Package
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

interface Land {
    id: number;
    land_name: string;
    location: string;
    area_hectares: number;
    member_id: number;
}

interface FormData {
    crop_name: string;
    crop_type: string;
    variety: string;
    land_id: string;
    unit_id: string;
    planting_date: string;
    expected_harvest_date: string;
    area_planted: string;
    seed_quantity: string;
    description: string;
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
        title: 'Crop Creation',
        href: '/koabiga/unit-leader/forms/crop-creation',
    },
];

const cropTypes = [
    { value: 'maize', label: 'Maize' },
    { value: 'beans', label: 'Beans' },
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'potatoes', label: 'Potatoes' },
    { value: 'cassava', label: 'Cassava' },
    { value: 'sweet_potatoes', label: 'Sweet Potatoes' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'tea', label: 'Tea' },
    { value: 'other', label: 'Other' },
];

export default function CropCreationForm() {
    const [formData, setFormData] = useState<FormData>({
        crop_name: '',
        crop_type: '',
        variety: '',
        land_id: '',
        unit_id: '',
        planting_date: new Date().toISOString().split('T')[0],
        expected_harvest_date: '',
        area_planted: '',
        seed_quantity: '',
        description: '',
        status: 'active'
    });

    const [units, setUnits] = useState<Unit[]>([]);
    const [lands, setLands] = useState<Land[]>([]);
    const [loading, setLoading] = useState(false);
    const [unitsLoading, setUnitsLoading] = useState(true);
    const [landsLoading, setLandsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        if (formData.unit_id) {
            fetchLands(formData.unit_id);
        } else {
            setLands([]);
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

    const fetchLands = async (unitId: string) => {
        try {
            setLandsLoading(true);
            const response = await axios.get(`/api/unit-leader/land?unit_id=${unitId}`);
            if (response.data.success) {
                setLands(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching lands:', err);
            setError('Failed to load lands');
        } finally {
            setLandsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.crop_name.trim()) {
            errors.crop_name = 'Crop name is required';
        }

        if (!formData.crop_type) {
            errors.crop_type = 'Crop type is required';
        }

        if (!formData.variety.trim()) {
            errors.variety = 'Crop variety is required';
        }

        if (!formData.land_id) {
            errors.land_id = 'Please select a land plot';
        }

        if (!formData.unit_id) {
            errors.unit_id = 'Please select a unit';
        }

        if (!formData.planting_date) {
            errors.planting_date = 'Planting date is required';
        }

        if (!formData.expected_harvest_date) {
            errors.expected_harvest_date = 'Expected harvest date is required';
        }

        if (!formData.area_planted) {
            errors.area_planted = 'Area planted is required';
        } else if (parseFloat(formData.area_planted) <= 0) {
            errors.area_planted = 'Area planted must be greater than 0';
        }

        if (!formData.seed_quantity) {
            errors.seed_quantity = 'Seed quantity is required';
        } else if (parseFloat(formData.seed_quantity) <= 0) {
            errors.seed_quantity = 'Seed quantity must be greater than 0';
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

            const cropData = {
                ...formData,
                area_planted: parseFloat(formData.area_planted),
                seed_quantity: parseFloat(formData.seed_quantity),
                land_id: parseInt(formData.land_id),
                unit_id: parseInt(formData.unit_id),
                status: 'active'
            };

            const response = await axios.post('/api/unit-leader/crops', cropData);

            if (response.data.success) {
                setSuccess('Crop created successfully!');
                setFormData({
                    crop_name: '',
                    crop_type: '',
                    variety: '',
                    land_id: '',
                    unit_id: '',
                    planting_date: new Date().toISOString().split('T')[0],
                    expected_harvest_date: '',
                    area_planted: '',
                    seed_quantity: '',
                    description: '',
                    status: 'active'
                });
                setFormErrors({});
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    router.visit('/koabiga/unit-leader/forms');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to create crop');
            }
        } catch (err: any) {
            console.error('Error creating crop:', err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError(err.response?.data?.message || 'Failed to create crop. Please try again.');
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
            <Head title="Crop Creation Form - Unit Leader" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleCancel} variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Forms
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crop Creation Form</h1>
                            <p className="text-gray-600 dark:text-gray-400">Add new crops to your unit</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sprout className="h-6 w-6 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600">Unit Leader Form</span>
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
                                <CardTitle>Crop Information</CardTitle>
                                <CardDescription>Add new crops to your unit</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Crop Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Sprout className="h-5 w-5" />
                                            Crop Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="crop_name">Crop Name *</Label>
                                                <Input
                                                    id="crop_name"
                                                    value={formData.crop_name}
                                                    onChange={(e) => setFormData({...formData, crop_name: e.target.value})}
                                                    placeholder="Enter crop name"
                                                    className={formErrors.crop_name ? 'border-red-500' : ''}
                                                />
                                                {formErrors.crop_name && (
                                                    <p className="text-sm text-red-600">{formErrors.crop_name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="crop_type">Crop Type *</Label>
                                                <Select 
                                                    value={formData.crop_type} 
                                                    onValueChange={(value) => setFormData({...formData, crop_type: value})}
                                                >
                                                    <SelectTrigger className={formErrors.crop_type ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select crop type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {cropTypes.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {formErrors.crop_type && (
                                                    <p className="text-sm text-red-600">{formErrors.crop_type}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="variety">Crop Variety *</Label>
                                                <Input
                                                    id="variety"
                                                    value={formData.variety}
                                                    onChange={(e) => setFormData({...formData, variety: e.target.value})}
                                                    placeholder="Enter crop variety"
                                                    className={formErrors.variety ? 'border-red-500' : ''}
                                                />
                                                {formErrors.variety && (
                                                    <p className="text-sm text-red-600">{formErrors.variety}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Land Assignment */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Land Assignment
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="unit_id">Unit *</Label>
                                                <Select 
                                                    value={formData.unit_id} 
                                                    onValueChange={(value) => setFormData({...formData, unit_id: value, land_id: ''})}
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
                                                <Label htmlFor="land_id">Land Plot *</Label>
                                                <Select 
                                                    value={formData.land_id} 
                                                    onValueChange={(value) => setFormData({...formData, land_id: value})}
                                                    disabled={!formData.unit_id || landsLoading}
                                                >
                                                    <SelectTrigger className={formErrors.land_id ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder={landsLoading ? "Loading lands..." : "Select land plot"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {lands.map((land) => (
                                                            <SelectItem key={land.id} value={land.id.toString()}>
                                                                {land.land_name} - {land.location} ({land.area_hectares} ha)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {formErrors.land_id && (
                                                    <p className="text-sm text-red-600">{formErrors.land_id}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Planting Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Planting Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="planting_date">Planting Date *</Label>
                                                <Input
                                                    id="planting_date"
                                                    type="date"
                                                    value={formData.planting_date}
                                                    onChange={(e) => setFormData({...formData, planting_date: e.target.value})}
                                                    className={formErrors.planting_date ? 'border-red-500' : ''}
                                                />
                                                {formErrors.planting_date && (
                                                    <p className="text-sm text-red-600">{formErrors.planting_date}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="expected_harvest_date">Expected Harvest Date *</Label>
                                                <Input
                                                    id="expected_harvest_date"
                                                    type="date"
                                                    value={formData.expected_harvest_date}
                                                    onChange={(e) => setFormData({...formData, expected_harvest_date: e.target.value})}
                                                    className={formErrors.expected_harvest_date ? 'border-red-500' : ''}
                                                />
                                                {formErrors.expected_harvest_date && (
                                                    <p className="text-sm text-red-600">{formErrors.expected_harvest_date}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Area and Quantity */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Ruler className="h-5 w-5" />
                                            Area and Quantity
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="area_planted">Area Planted (Hectares) *</Label>
                                                <Input
                                                    id="area_planted"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.area_planted}
                                                    onChange={(e) => setFormData({...formData, area_planted: e.target.value})}
                                                    placeholder="0.00"
                                                    className={formErrors.area_planted ? 'border-red-500' : ''}
                                                />
                                                {formErrors.area_planted && (
                                                    <p className="text-sm text-red-600">{formErrors.area_planted}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="seed_quantity">Seed Quantity (kg) *</Label>
                                                <Input
                                                    id="seed_quantity"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.seed_quantity}
                                                    onChange={(e) => setFormData({...formData, seed_quantity: e.target.value})}
                                                    placeholder="0.00"
                                                    className={formErrors.seed_quantity ? 'border-red-500' : ''}
                                                />
                                                {formErrors.seed_quantity && (
                                                    <p className="text-sm text-red-600">{formErrors.seed_quantity}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Additional Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Additional Information
                                        </h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                placeholder="Additional notes about the crop..."
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
                                            Create Crop
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
                                    <Sprout className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium">Crop Creation</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Use this form to add new crops to your unit. All required fields are marked with an asterisk (*).
                                </p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Form Type:</span>
                                        <span className="font-medium">Registration</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Category:</span>
                                        <span className="font-medium">Crop Management</span>
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
                                        <li>• Crop Name</li>
                                        <li>• Crop Type</li>
                                        <li>• Crop Variety</li>
                                        <li>• Unit Selection</li>
                                        <li>• Land Plot</li>
                                        <li>• Planting Date</li>
                                        <li>• Expected Harvest Date</li>
                                        <li>• Area Planted</li>
                                        <li>• Seed Quantity</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Area Measurement</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Enter area in hectares (1 hectare = 10,000 square meters)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Land Assignment</h4>
                                    <p className="text-xs text-muted-foreground">
                                        First select a unit, then choose a land plot from that unit
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