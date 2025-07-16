import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    User, 
    Phone, 
    MapPin, 
    Building2, 
    AlertCircle,
    CheckCircle,
    X,
    Eye,
    EyeOff,
    Badge,
    Lock
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface Unit {
    id: number;
    name: string;
    code: string;
    zone_id: number;
    zone?: {
        id: number;
        name: string;
        code: string;
    };
}

interface Zone {
    id: number;
    name: string;
    code: string;
}

interface LeaderUser {
    id: number;
    role: 'unit_leader' | 'zone_leader';
    unit_id?: number;
    zone_id?: number;
}

interface LeaderMemberFormProps {
    units: Unit[];
    zones: Zone[];
    leaderUser: LeaderUser;
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    errors?: Record<string, string>;
}

const leaderMemberSchema = z.object({
    christian_name: z.string().min(1, 'Christian name is required').max(100, 'Christian name must be less than 100 characters'),
    family_name: z.string().min(1, 'Family name is required').max(100, 'Family name must be less than 100 characters'),
    phone: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d+$/, 'Phone number must contain only digits'),
    secondary_phone: z.string().length(10, 'Secondary phone number must be exactly 10 digits').regex(/^\d+$/, 'Secondary phone number must contain only digits').optional().or(z.literal('')),
    gender: z.enum(['male', 'female']),
    national_id: z.string().min(1, 'National ID is required').max(25, 'National ID must be less than 25 characters'),
    unit_id: z.string().optional(),
    zone_id: z.string().optional(),
}).refine((data) => {
    // Ensure secondary phone is not the same as primary phone
    if (data.secondary_phone && data.secondary_phone === data.phone) {
        return false;
    }
    return true;
}, {
    message: "Secondary phone number cannot be the same as primary phone number",
    path: ["secondary_phone"],
});

type LeaderMemberFormData = z.infer<typeof leaderMemberSchema>;

export default function LeaderMemberForm({ units, zones, leaderUser, onSubmit, isSubmitting, errors }: LeaderMemberFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors: formErrors },
    } = useForm<LeaderMemberFormData>({
        resolver: zodResolver(leaderMemberSchema),
        defaultValues: {
            christian_name: '',
            family_name: '',
            phone: '',
            secondary_phone: '',
            gender: 'male',
            national_id: '',
            unit_id: leaderUser.role === 'unit_leader' ? String(leaderUser.unit_id) : '',
            zone_id: leaderUser.role === 'zone_leader' ? String(leaderUser.zone_id) : '',
        },
    });

    const watchedZoneId = watch('zone_id');

    // Filter units based on leader's role and selected zone
    const getAvailableUnits = () => {
        if (leaderUser.role === 'unit_leader') {
            // Unit leaders can only assign to their own unit
            return units.filter(unit => unit.id === leaderUser.unit_id);
        } else if (leaderUser.role === 'zone_leader') {
            // Zone leaders can assign to any unit in their zone
            return units.filter(unit => unit.zone_id === leaderUser.zone_id);
        }
        return [];
    };

    const availableUnits = getAvailableUnits();

    // Auto-fill zone when unit is selected
    useEffect(() => {
        if (watchedZoneId && leaderUser.role === 'zone_leader') {
            const selectedUnit = units.find(unit => unit.id === parseInt(watchedZoneId));
            if (selectedUnit) {
                setValue('zone_id', String(selectedUnit.zone_id));
            }
        }
    }, [watchedZoneId, leaderUser.role, units, setValue]);

    const handleFormSubmit = (data: LeaderMemberFormData) => {
        const submitData = {
            ...data,
            // Auto-assign role and PIN
            role: 'member' as const,
            pin: '12123',
            status: 'active' as const,
            // Auto-assign unit and zone based on leader's role
            unit_id: leaderUser.role === 'unit_leader' 
                ? leaderUser.unit_id 
                : (data.unit_id ? parseInt(data.unit_id) : undefined),
            zone_id: leaderUser.role === 'zone_leader' 
                ? leaderUser.zone_id 
                : (data.unit_id ? availableUnits.find(u => u.id === parseInt(data.unit_id))?.zone_id : undefined),
        };

        onSubmit(submitData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-green-600" />
                    <span>Create New Member</span>
                    <BadgeComponent variant="outline" className="ml-2">
                        {leaderUser.role === 'unit_leader' ? 'Unit Leader' : 'Zone Leader'}
                    </BadgeComponent>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Role Information - Read Only */}
                    <div className="space-y-2">
                        <Label>Role Assignment</Label>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <User className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Member</span>
                            <BadgeComponent variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Auto-assigned
                            </BadgeComponent>
                        </div>
                        <p className="text-xs text-gray-500">
                            All new members created by leaders are automatically assigned the 'Member' role.
                        </p>
                    </div>

                    {/* PIN Information - Read Only */}
                    <div className="space-y-2">
                        <Label>PIN Assignment</Label>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Lock className="w-4 h-4 text-blue-600" />
                            <span className="font-mono font-medium">12123</span>
                            <BadgeComponent variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Default PIN
                            </BadgeComponent>
                        </div>
                        <p className="text-xs text-gray-500">
                            Default PIN will be assigned. Members can change this after first login.
                        </p>
                    </div>

                    {/* Zone/Unit Assignment based on Leader Role */}
                    {leaderUser.role === 'zone_leader' && (
                        <div className="space-y-2">
                            <Label htmlFor="unit_id">Assign to Unit *</Label>
                            <Select
                                value={watch('unit_id')}
                                onValueChange={(value) => setValue('unit_id', value)}
                            >
                                <SelectTrigger className={formErrors.unit_id || errors?.unit_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUnits.map((unit) => (
                                        <SelectItem key={unit.id} value={String(unit.id)}>
                                            <div className="flex items-center space-x-2">
                                                <Building2 className="w-4 h-4 text-blue-600" />
                                                <span>{unit.name} ({unit.code})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(formErrors.unit_id || errors?.unit_id) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.unit_id?.message || errors?.unit_id}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                Select which unit this member will be assigned to within your zone.
                            </p>
                        </div>
                    )}

                    {leaderUser.role === 'unit_leader' && (
                        <div className="space-y-2">
                            <Label>Unit Assignment</Label>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">
                                    {availableUnits[0]?.name} ({availableUnits[0]?.code})
                                </span>
                                <BadgeComponent variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Your Unit
                                </BadgeComponent>
                            </div>
                            <p className="text-xs text-gray-500">
                                Members will be automatically assigned to your unit.
                            </p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="christian_name">Christian Name *</Label>
                            <Input
                                id="christian_name"
                                placeholder="Enter christian name"
                                {...register('christian_name')}
                                className={formErrors.christian_name || errors?.christian_name ? 'border-red-500' : ''}
                            />
                            {(formErrors.christian_name || errors?.christian_name) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.christian_name?.message || errors?.christian_name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="family_name">Family Name *</Label>
                            <Input
                                id="family_name"
                                placeholder="Enter family name"
                                {...register('family_name')}
                                className={formErrors.family_name || errors?.family_name ? 'border-red-500' : ''}
                            />
                            {(formErrors.family_name || errors?.family_name) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.family_name?.message || errors?.family_name}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    placeholder="07XXXXXXXX"
                                    className={`pl-10 ${formErrors.phone || errors?.phone ? 'border-red-500' : ''}`}
                                    {...register('phone')}
                                    maxLength={10}
                                />
                            </div>
                            {(formErrors.phone || errors?.phone) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.phone?.message || errors?.phone}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secondary_phone">Secondary Phone (Optional)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="secondary_phone"
                                    placeholder="07XXXXXXXX"
                                    className={`pl-10 ${formErrors.secondary_phone || errors?.secondary_phone ? 'border-red-500' : ''}`}
                                    {...register('secondary_phone')}
                                    maxLength={10}
                                />
                            </div>
                            {(formErrors.secondary_phone || errors?.secondary_phone) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.secondary_phone?.message || errors?.secondary_phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <Select
                                value={watch('gender')}
                                onValueChange={(value) => setValue('gender', value as 'male' | 'female')}
                            >
                                <SelectTrigger className={formErrors.gender || errors?.gender ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            {(formErrors.gender || errors?.gender) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.gender?.message || errors?.gender}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="national_id">National ID *</Label>
                            <Input
                                id="national_id"
                                placeholder="Enter national ID"
                                {...register('national_id')}
                                className={formErrors.national_id || errors?.national_id ? 'border-red-500' : ''}
                            />
                            {(formErrors.national_id || errors?.national_id) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.national_id?.message || errors?.national_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating Member...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Create Member
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
} 