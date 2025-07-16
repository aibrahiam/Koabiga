import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    MapPin, 
    Save, 
    X, 
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react';
import axios from 'axios';

const zoneSchema = z.object({
    name: z.string().min(1, 'Zone name is required').max(255, 'Zone name must be less than 255 characters'),
    code: z.string().min(1, 'Zone code is required').max(50, 'Zone code must be less than 50 characters'),
    description: z.string().optional(),
    location: z.string().optional(),
    leader_id: z.string().optional(),
    status: z.enum(['active', 'inactive']),
});

type ZoneFormData = z.infer<typeof zoneSchema>;

interface Leader {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface ZoneFormProps {
    zone?: {
        id: number;
        name: string;
        code: string;
        description?: string;
        location?: string;
        leader_id?: number;
        status: 'active' | 'inactive';
    };
    availableLeaders?: Leader[];
    onSuccess?: () => void;
    onCancel?: () => void;
    mode?: 'create' | 'edit';
}

export default function ZoneForm({ 
    zone, 
    availableLeaders = [], 
    onSuccess, 
    onCancel,
    mode = 'create' 
}: ZoneFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [leaders, setLeaders] = useState<Leader[]>(availableLeaders);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<ZoneFormData>({
        resolver: zodResolver(zoneSchema),
        defaultValues: {
            name: zone?.name || '',
            code: zone?.code || '',
            description: zone?.description || '',
            location: zone?.location || '',
            leader_id: zone?.leader_id?.toString() || '',
            status: zone?.status || 'active',
        },
    });

    // Fetch available leaders if not provided
    useEffect(() => {
        if (availableLeaders.length === 0) {
            const fetchLeaders = async () => {
                try {
                    const response = await axios.get('/api/zones/available-leaders');
                    if (response.data.success) {
                        setLeaders(response.data.data);
                    }
                } catch (err) {
                    console.error('Failed to fetch available leaders:', err);
                }
            };
            fetchLeaders();
        }
    }, [availableLeaders]);

    const onSubmit = async (data: ZoneFormData) => {
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            const payload = {
                ...data,
                leader_id: data.leader_id ? parseInt(data.leader_id) : null,
            };

            let response;
            if (mode === 'edit' && zone) {
                response = await axios.put(`/api/zones/${zone.id}`, payload);
            } else {
                response = await axios.post('/api/zones', payload);
            }

            if (response.data.success) {
                setSuccess(
                    mode === 'edit' 
                        ? 'Zone updated successfully!' 
                        : 'Zone created successfully!'
                );
                
                // Reset form for create mode
                if (mode === 'create') {
                    setValue('name', '');
                    setValue('code', '');
                    setValue('description', '');
                    setValue('location', '');
                    setValue('leader_id', '');
                    setValue('status', 'active');
                }

                // Call success callback after a short delay
                setTimeout(() => {
                    onSuccess?.();
                }, 1500);
            } else {
                throw new Error(response.data.message || 'Operation failed');
            }
        } catch (err: any) {
            console.error('Zone form submission error:', err);
            setError(
                err.response?.data?.message || 
                err.message || 
                'An error occurred while saving the zone'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            // Default behavior - go back
            window.history.back();
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {mode === 'edit' ? 'Edit Zone' : 'Create New Zone'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Success Alert */}
                    {success && (
                        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 dark:text-green-200">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Zone Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Zone Name *</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="Enter zone name"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Zone Code */}
                    <div className="space-y-2">
                        <Label htmlFor="code">Zone Code *</Label>
                        <Input
                            id="code"
                            {...register('code')}
                            placeholder="Enter zone code (e.g., ZONE-001)"
                            className={errors.code ? 'border-red-500' : ''}
                        />
                        {errors.code && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.code.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Enter zone description (optional)"
                            rows={3}
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            {...register('location')}
                            placeholder="Enter zone location (optional)"
                        />
                    </div>

                    {/* Leader Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="leader_id">Zone Leader</Label>
                        <Select
                            value={watch('leader_id')}
                            onValueChange={(value) => setValue('leader_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a leader (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">No Leader</SelectItem>
                                {leaders.map((leader) => (
                                    <SelectItem key={leader.id} value={leader.id.toString()}>
                                        {leader.name} ({leader.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {leaders.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No available leaders found. Create a unit leader first.
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={watch('status')}
                            onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Zone' : 'Create Zone'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
} 