import { Head, router } from '@inertiajs/react';
import { 
    Package,
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
    Sprout,
    DollarSign
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

interface Crop {
    id: number;
    crop_name: string;
    crop_type: string;
    variety: string;
    land_id: number;
    land: {
        land_name: string;
        location: string;
    };
}

interface FormData {
    produce_name: string;
    crop_id: string;
    unit_id: string;
    harvest_date: string;
    quantity_harvested: string;
    unit_of_measure: string;
    quality_grade: string;
    market_price: string;
    total_value: string;
    description: string;
    status: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unit Leader Dashboard',
        href: '/koabiga/leaders/dashboard',
    },
    {
        title: 'Forms',
        href: '/koabiga/leaders/leaders-forms',
    },
    {
        title: 'Produce Creation',
        href: '/koabiga/leaders/leaders-forms/produce-creation',
    },
];

const unitsOfMeasure = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'tons', label: 'Tons' },
    { value: 'bags', label: 'Bags' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'liters', label: 'Liters' },
    { value: 'bunches', label: 'Bunches' },
    { value: 'other', label: 'Other' },
];

const qualityGrades = [
    { value: 'grade_a', label: 'Grade A (Premium)' },
    { value: 'grade_b', label: 'Grade B (Standard)' },
    { value: 'grade_c', label: 'Grade C (Lower)' },
    { value: 'rejected', label: 'Rejected' },
];

export default function ProduceCreationForm() {
    const [formData, setFormData] = useState<FormData>({
        produce_name: '',
        crop_id: '',
        unit_id: '',
        harvest_date: new Date().toISOString().split('T')[0],
        quantity_harvested: '',
        unit_of_measure: 'kg',
        quality_grade: 'grade_b',
        market_price: '',
        total_value: '',
        description: '',
        status: 'active'
    });

    const [units, setUnits] = useState<Unit[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(false);
    const [unitsLoading, setUnitsLoading] = useState(true);
    const [cropsLoading, setCropsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        if (formData.unit_id) {
            fetchCrops(formData.unit_id);
        } else {
            setCrops([]);
        }
    }, [formData.unit_id]);

    useEffect(() => {
        // Calculate total value when quantity and price change
        if (formData.quantity_harvested && formData.market_price) {
            const quantity = parseFloat(formData.quantity_harvested);
            const price = parseFloat(formData.market_price);
            if (!isNaN(quantity) && !isNaN(price)) {
                setFormData(prev => ({
                    ...prev,
                    total_value: (quantity * price).toFixed(2)
                }));
            }
        }
    }, [formData.quantity_harvested, formData.market_price]);

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

    const fetchCrops = async (unitId: string) => {
        try {
            setCropsLoading(true);
            const response = await axios.get(`/api/unit-leader/crops?unit_id=${unitId}&status=active`);
            if (response.data.success) {
                setCrops(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching crops:', err);
            setError('Failed to load crops');
        } finally {
            setCropsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.produce_name.trim()) {
            errors.produce_name = 'Produce name is required';
        }

        if (!formData.crop_id) {
            errors.crop_id = 'Please select a crop';
        }

        if (!formData.unit_id) {
            errors.unit_id = 'Please select a unit';
        }

        if (!formData.harvest_date) {
            errors.harvest_date = 'Harvest date is required';
        }

        if (!formData.quantity_harvested) {
            errors.quantity_harvested = 'Quantity harvested is required';
        } else if (parseFloat(formData.quantity_harvested) <= 0) {
            errors.quantity_harvested = 'Quantity must be greater than 0';
        }

        if (!formData.unit_of_measure) {
            errors.unit_of_measure = 'Unit of measure is required';
        }

        if (!formData.quality_grade) {
            errors.quality_grade = 'Quality grade is required';
        }

        if (!formData.market_price) {
            errors.market_price = 'Market price is required';
        } else if (parseFloat(formData.market_price) < 0) {
            errors.market_price = 'Market price cannot be negative';
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

            const produceData = {
                ...formData,
                quantity_harvested: parseFloat(formData.quantity_harvested),
                market_price: parseFloat(formData.market_price),
                total_value: parseFloat(formData.total_value),
                crop_id: parseInt(formData.crop_id),
                unit_id: parseInt(formData.unit_id),
                status: 'active'
            };

            const response = await axios.post('/api/unit-leader/produce', produceData);

            if (response.data.success) {
                setSuccess('Produce recorded successfully!');
                setFormData({
                    produce_name: '',
                    crop_id: '',
                    unit_id: '',
                    harvest_date: new Date().toISOString().split('T')[0],
                    quantity_harvested: '',
                    unit_of_measure: 'kg',
                    quality_grade: 'grade_b',
                    market_price: '',
                    total_value: '',
                    description: '',
                    status: 'active'
                });
                setFormErrors({});
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    router.visit('/koabiga/leaders/leaders-forms');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to record produce');
            }
        } catch (err: any) {
            console.error('Error recording produce:', err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError(err.response?.data?.message || 'Failed to record produce. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
                        router.visit('/koabiga/leaders/leaders-forms');
    };

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Produce Creation Form - Unit Leader" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleCancel} variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Forms
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Produce Creation Form</h1>
                            <p className="text-gray-600 dark:text-gray-400">Record produce output from your unit</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Package className="h-6 w-6 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">Unit Leader Form</span>
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
                                <CardTitle>Produce Information</CardTitle>
                                <CardDescription>Record produce output from your unit</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Produce Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Produce Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="produce_name">Produce Name *</Label>
                                                <Input
                                                    id="produce_name"
                                                    value={formData.produce_name}
                                                    onChange={(e) => setFormData({...formData, produce_name: e.target.value})}
                                                    placeholder="Enter produce name"
                                                    className={formErrors.produce_name ? 'border-red-500' : ''}
                                                />
                                                {formErrors.produce_name && (
                                                    <p className="text-sm text-red-600">{formErrors.produce_name}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="unit_id">Unit *</Label>
                                                    <Select 
                                                        value={formData.unit_id} 
                                                        onValueChange={(value) => setFormData({...formData, unit_id: value, crop_id: ''})}
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
                                                    <Label htmlFor="crop_id">Source Crop *</Label>
                                                    <Select 
                                                        value={formData.crop_id} 
                                                        onValueChange={(value) => setFormData({...formData, crop_id: value})}
                                                        disabled={!formData.unit_id || cropsLoading}
                                                    >
                                                        <SelectTrigger className={formErrors.crop_id ? 'border-red-500' : ''}>
                                                            <SelectValue placeholder={cropsLoading ? "Loading crops..." : "Select crop"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {crops.map((crop) => (
                                                                <SelectItem key={crop.id} value={crop.id.toString()}>
                                                                    {crop.crop_name} ({crop.variety}) - {crop.land.land_name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {formErrors.crop_id && (
                                                        <p className="text-sm text-red-600">{formErrors.crop_id}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Harvest Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Harvest Information
                                        </h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="harvest_date">Harvest Date *</Label>
                                            <Input
                                                id="harvest_date"
                                                type="date"
                                                value={formData.harvest_date}
                                                onChange={(e) => setFormData({...formData, harvest_date: e.target.value})}
                                                className={formErrors.harvest_date ? 'border-red-500' : ''}
                                            />
                                            {formErrors.harvest_date && (
                                                <p className="text-sm text-red-600">{formErrors.harvest_date}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Quantity and Quality */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Ruler className="h-5 w-5" />
                                            Quantity and Quality
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="quantity_harvested">Quantity Harvested *</Label>
                                                <Input
                                                    id="quantity_harvested"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.quantity_harvested}
                                                    onChange={(e) => setFormData({...formData, quantity_harvested: e.target.value})}
                                                    placeholder="0.00"
                                                    className={formErrors.quantity_harvested ? 'border-red-500' : ''}
                                                />
                                                {formErrors.quantity_harvested && (
                                                    <p className="text-sm text-red-600">{formErrors.quantity_harvested}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="unit_of_measure">Unit of Measure *</Label>
                                                <Select 
                                                    value={formData.unit_of_measure} 
                                                    onValueChange={(value) => setFormData({...formData, unit_of_measure: value})}
                                                >
                                                    <SelectTrigger className={formErrors.unit_of_measure ? 'border-red-500' : ''}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {unitsOfMeasure.map((unit) => (
                                                            <SelectItem key={unit.value} value={unit.value}>
                                                                {unit.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {formErrors.unit_of_measure && (
                                                    <p className="text-sm text-red-600">{formErrors.unit_of_measure}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="quality_grade">Quality Grade *</Label>
                                                <Select 
                                                    value={formData.quality_grade} 
                                                    onValueChange={(value) => setFormData({...formData, quality_grade: value})}
                                                >
                                                    <SelectTrigger className={formErrors.quality_grade ? 'border-red-500' : ''}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {qualityGrades.map((grade) => (
                                                            <SelectItem key={grade.value} value={grade.value}>
                                                                {grade.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {formErrors.quality_grade && (
                                                    <p className="text-sm text-red-600">{formErrors.quality_grade}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Financial Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Financial Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="market_price">Market Price per Unit (RWF) *</Label>
                                                <Input
                                                    id="market_price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.market_price}
                                                    onChange={(e) => setFormData({...formData, market_price: e.target.value})}
                                                    placeholder="0.00"
                                                    className={formErrors.market_price ? 'border-red-500' : ''}
                                                />
                                                {formErrors.market_price && (
                                                    <p className="text-sm text-red-600">{formErrors.market_price}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="total_value">Total Value (RWF)</Label>
                                                <Input
                                                    id="total_value"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.total_value}
                                                    placeholder="Calculated automatically"
                                                    disabled
                                                    className="bg-gray-50"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Calculated automatically from quantity × price
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Additional Information */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                            <Sprout className="h-5 w-5" />
                                            Additional Information
                                        </h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                placeholder="Additional notes about the produce..."
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
                                            Record Produce
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
                                    <Package className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium">Produce Creation</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Use this form to record produce output from your unit. All required fields are marked with an asterisk (*).
                                </p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Form Type:</span>
                                        <span className="font-medium">Report</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Category:</span>
                                        <span className="font-medium">Harvest</span>
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
                                        <li>• Produce Name</li>
                                        <li>• Unit Selection</li>
                                        <li>• Source Crop</li>
                                        <li>• Harvest Date</li>
                                        <li>• Quantity Harvested</li>
                                        <li>• Unit of Measure</li>
                                        <li>• Quality Grade</li>
                                        <li>• Market Price</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Crop Selection</h4>
                                    <p className="text-xs text-muted-foreground">
                                        First select a unit, then choose a crop from that unit
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Financial Calculation</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Total value is automatically calculated from quantity × price
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