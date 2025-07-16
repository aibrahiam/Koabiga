import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Building2, 
    MapPin, 
    Users, 
    AlertCircle,
    Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

interface Zone {
    id: number;
    name: string;
    code: string;
}

interface Leader {
    id: number;
    christian_name: string;
    family_name: string;
    phone: string;
    secondary_phone?: string;
}

interface Unit {
    id: number;
    name: string;
    code: string;
    zone_id: number;
    leader_id?: number;
    status: 'active' | 'inactive';
}

interface UnitFormProps {
    unit?: Unit;
    zones: Zone[];
    leaders: Leader[];
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    errors?: Record<string, string>;
}

const unitSchema = z.object({
    name: z.string().min(1, 'Unit name is required').max(100, 'Unit name must be less than 100 characters'),
    code: z.string().min(1, 'Unit code is required').max(50, 'Unit code must be less than 50 characters'),
    zone_id: z.string().min(1, 'Zone is required'),
    leader_id: z.string().optional(),
    status: z.enum(['active', 'inactive']),
});

type UnitFormData = z.infer<typeof unitSchema>;

export default function UnitForm({ unit, zones, leaders, onSubmit, onCancel, isSubmitting: externalIsSubmitting, errors: externalErrors }: UnitFormProps) {
    const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
    const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UnitFormData>({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            name: unit?.name || '',
            code: unit?.code || '',
            zone_id: unit?.zone_id ? String(unit.zone_id) : '',
            leader_id: unit?.leader_id ? String(unit.leader_id) : '',
            status: unit?.status || 'active',
        },
    });

    const handleFormSubmit = async (data: UnitFormData) => {
        if (externalIsSubmitting === undefined) {
            setInternalIsSubmitting(true);
        }
        try {
            const submitData = {
                ...data,
                zone_id: parseInt(data.zone_id),
                leader_id: data.leader_id ? parseInt(data.leader_id) : null,
            };
            await onSubmit(submitData);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            if (externalIsSubmitting === undefined) {
                setInternalIsSubmitting(false);
            }
        }
    };

    const selectedLeaderId = watch('leader_id');
    const selectedLeader = leaders.find(leader => String(leader.id) === selectedLeaderId);

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <Card>
                <CardContent className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Basic Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Unit Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter unit name"
                                    {...register('name')}
                                    className={(errors.name || externalErrors?.name) ? 'border-red-500' : ''}
                                />
                                {(errors.name || externalErrors?.name) && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {errors.name?.message || externalErrors?.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">Unit Code *</Label>
                                <Input
                                    id="code"
                                    placeholder="Enter unit code"
                                    {...register('code')}
                                    className={(errors.code || externalErrors?.code) ? 'border-red-500' : ''}
                                />
                                {(errors.code || externalErrors?.code) && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {errors.code?.message || externalErrors?.code}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zone_id">Zone *</Label>
                            <Select
                                value={watch('zone_id')}
                                onValueChange={(value) => setValue('zone_id', value)}
                            >
                                <SelectTrigger className={(errors.zone_id || externalErrors?.zone_id) ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select zone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {zones.map((zone) => (
                                        <SelectItem key={zone.id} value={String(zone.id)}>
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{zone.name} ({zone.code})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(errors.zone_id || externalErrors?.zone_id) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {errors.zone_id?.message || externalErrors?.zone_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Leader Assignment */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Leader Assignment
                        </h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="leader_id">Unit Leader (Optional)</Label>
                            <Select
                                value={watch('leader_id')}
                                onValueChange={(value) => setValue('leader_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select unit leader" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No leader assigned</SelectItem>
                                    {leaders.map((leader) => (
                                        <SelectItem key={leader.id} value={String(leader.id)}>
                                            <div className="flex items-center space-x-2">
                                                <Users className="w-4 h-4" />
                                                <span>{leader.christian_name} {leader.family_name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Assign a unit leader to manage this unit's operations
                            </p>
                        </div>

                        {/* Selected Leader Info */}
                        {selectedLeader && (
                            <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Selected Leader</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                            {selectedLeader.christian_name} {selectedLeader.family_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-600 dark:text-green-400">
                                            {selectedLeader.phone}
                                        </span>
                                    </div>
                                    {selectedLeader.secondary_phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-green-600 dark:text-green-400">
                                                {selectedLeader.secondary_phone} (Secondary)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                            value={watch('status')}
                            onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Active</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="inactive">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                        <span>Inactive</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            Active units can be assigned members and participate in operations
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : unit ? 'Update Unit' : 'Create Unit'}
                </Button>
            </div>
        </form>
    );
} 