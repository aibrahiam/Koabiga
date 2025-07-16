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
    Badge
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

interface MemberFormProps {
    units: Unit[];
    zones: Zone[];
    member?: {
        id: number;
        christian_name: string;
        family_name: string;
        phone: string;
        secondary_phone?: string;
        national_id: string;
        gender: 'male' | 'female';
        role: 'member' | 'unit_leader' | 'zone_leader';
        status: 'active' | 'inactive';
        unit_id?: number;
        zone_id?: number;
    };
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    errors?: Record<string, string>;
}

const memberSchema = z.object({
    christian_name: z.string().min(1, 'Christian name is required').max(100, 'Christian name must be less than 100 characters'),
    family_name: z.string().min(1, 'Family name is required').max(100, 'Family name must be less than 100 characters'),
    phone: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d+$/, 'Phone number must contain only digits'),
    secondary_phone: z.string().length(10, 'Secondary phone number must be exactly 10 digits').regex(/^\d+$/, 'Secondary phone number must contain only digits').optional().or(z.literal('')),
    pin: z.string().length(5, 'PIN must be exactly 5 digits').regex(/^\d+$/, 'PIN must contain only digits'),
    gender: z.enum(['male', 'female']),
    national_id: z.string().min(1, 'National ID is required').max(25, 'National ID must be less than 25 characters'),
    unit_id: z.string().optional(),
    zone_id: z.string().optional(),
    unit_ids: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive']),
    role: z.enum(['member', 'unit_leader', 'zone_leader']),
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

type MemberFormData = z.infer<typeof memberSchema>;

export default function MemberForm({ units, zones, member, onSubmit, isSubmitting, errors }: MemberFormProps) {
    const [showPin, setShowPin] = useState(false);
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors: formErrors },
    } = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            christian_name: member?.christian_name || '',
            family_name: member?.family_name || '',
            phone: member?.phone || '',
            secondary_phone: member?.secondary_phone || '',
            pin: '12123', // Default PIN
            gender: member?.gender || 'male',
            national_id: member?.national_id || '',
            unit_id: member?.unit_id ? String(member.unit_id) : '',
            zone_id: member?.zone_id ? String(member.zone_id) : '',
            unit_ids: [],
            status: member?.status || 'active',
            role: member?.role || 'member',
        },
    });

    const watchedRole = watch('role');
    const watchedZoneId = watch('zone_id');
    const watchedUnitId = watch('unit_id');

    // Filter units based on selected zone
    const filteredUnits = watchedZoneId 
        ? units.filter(unit => unit.zone_id === parseInt(watchedZoneId))
        : units;

    // Get selected unit's zone info
    const selectedUnit = units.find(unit => unit.id === parseInt(watchedUnitId));
    const selectedZone = zones.find(zone => zone.id === parseInt(watchedZoneId));

    // Auto-fill zone when unit is selected (for member role)
    useEffect(() => {
        if (watchedRole === 'member' && watchedUnitId && selectedUnit) {
            setValue('zone_id', String(selectedUnit.zone_id));
        }
    }, [watchedUnitId, watchedRole, selectedUnit, setValue]);

    // Clear selections when role changes
    useEffect(() => {
        setValue('unit_id', '');
        setValue('zone_id', '');
        setSelectedUnitIds([]);
    }, [watchedRole, setValue]);

    const handleFormSubmit = (data: MemberFormData) => {
        const submitData = {
            ...data,
            unit_id: data.unit_id ? parseInt(data.unit_id) : undefined,
            zone_id: data.zone_id ? parseInt(data.zone_id) : undefined,
            unit_ids: selectedUnitIds.map(id => parseInt(id)),
        };

        // Role-specific data preparation
        if (data.role === 'zone_leader') {
            submitData.zone_id = parseInt(data.zone_id!);
            submitData.unit_ids = selectedUnitIds.map(id => parseInt(id));
        } else if (data.role === 'unit_leader') {
            submitData.zone_id = parseInt(data.zone_id!);
            submitData.unit_id = parseInt(data.unit_id!);
        } else {
            // member role
            submitData.unit_id = parseInt(data.unit_id!);
            submitData.zone_id = selectedUnit?.zone_id;
        }

        onSubmit(submitData);
    };

    const handleUnitSelection = (unitId: string) => {
        if (selectedUnitIds.includes(unitId)) {
            setSelectedUnitIds(selectedUnitIds.filter(id => id !== unitId));
        } else {
            setSelectedUnitIds([...selectedUnitIds, unitId]);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-green-600" />
                    <span>{member ? 'Edit Member' : 'Create New Member'}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Role Selection - Moved to top */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select
                            value={watch('role')}
                            onValueChange={(value) => setValue('role', value as 'member' | 'unit_leader' | 'zone_leader')}
                        >
                            <SelectTrigger className={formErrors.role || errors?.role ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-green-600" />
                                        <span>Member</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="unit_leader">
                                    <div className="flex items-center space-x-2">
                                        <Building2 className="w-4 h-4 text-blue-600" />
                                        <span>Unit Leader</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="zone_leader">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-purple-600" />
                                        <span>Zone Leader</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {(formErrors.role || errors?.role) && (
                            <p className="text-sm text-red-600 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {formErrors.role?.message || errors?.role}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            {watchedRole === 'unit_leader' && 'Unit leaders can manage their assigned unit members.'}
                            {watchedRole === 'zone_leader' && 'Zone leaders can manage all units in their zone.'}
                            {watchedRole === 'member' && 'Regular members can access basic platform features.'}
                        </p>
                    </div>

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
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="phone"
                                    placeholder="10 digits (e.g., 0712345678)"
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    onKeyPress={(e) => {
                                        // Only allow digits
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register('phone')}
                                    className={`pl-10 ${formErrors.phone || errors?.phone ? 'border-red-500' : ''}`}
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
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="secondary_phone"
                                    placeholder="10 digits (e.g., 0712345678)"
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    onKeyPress={(e) => {
                                        // Only allow digits
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register('secondary_phone')}
                                    className={`pl-10 ${formErrors.secondary_phone || errors?.secondary_phone ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {(formErrors.secondary_phone || errors?.secondary_phone) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.secondary_phone?.message || errors?.secondary_phone}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Can be used for login if different from primary phone
                            </p>
                        </div>
                    </div>

                    {/* National ID */}
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

                    {/* PIN and Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="pin">PIN *</Label>
                            <div className="relative">
                                <Input
                                    id="pin"
                                    type={showPin ? 'text' : 'password'}
                                    placeholder="5 digits (default: 12123)"
                                    {...register('pin')}
                                    className={formErrors.pin || errors?.pin ? 'border-red-500 pr-10' : 'pr-10'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {(formErrors.pin || errors?.pin) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.pin?.message || errors?.pin}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                Default PIN is 12123. You can change it to any 5-digit number.
                            </p>
                        </div>

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
                                    <SelectItem value="male">
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-blue-600" />
                                            <span>Male</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="female">
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-pink-600" />
                                            <span>Female</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {(formErrors.gender || errors?.gender) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.gender?.message || errors?.gender}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Role-Based Assignment Fields */}
                    {watchedRole === 'zone_leader' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="zone_id">Zone *</Label>
                                <Select
                                    value={watch('zone_id')}
                                    onValueChange={(value) => setValue('zone_id', value)}
                                >
                                    <SelectTrigger className={formErrors.zone_id || errors?.zone_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {zones
                                            .filter(zone => zone && zone.id && zone.name)
                                            .map((zone) => (
                                                <SelectItem key={zone.id} value={String(zone.id)}>
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{zone.name} ({zone.code})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {(formErrors.zone_id || errors?.zone_id) && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {formErrors.zone_id?.message || errors?.zone_id}
                                    </p>
                                )}
                            </div>

                            {watchedZoneId && (
                                <div className="space-y-2">
                                    <Label>Assign Units *</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                                        {filteredUnits.map((unit) => (
                                            <div key={unit.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`unit-${unit.id}`}
                                                    checked={selectedUnitIds.includes(String(unit.id))}
                                                    onChange={() => handleUnitSelection(String(unit.id))}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor={`unit-${unit.id}`} className="text-sm cursor-pointer">
                                                    {unit.name} ({unit.code})
                                                </label>
                                            </div>
                                        ))}
                                        {filteredUnits.length === 0 && (
                                            <p className="text-sm text-gray-500 col-span-2">No units available in this zone</p>
                                        )}
                                    </div>
                                    {selectedUnitIds.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {selectedUnitIds.map(unitId => {
                                                const unit = units.find(u => u.id === parseInt(unitId));
                                                return unit ? (
                                                    <BadgeComponent key={unitId} variant="secondary" className="text-xs">
                                                        {unit.name}
                                                    </BadgeComponent>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {watchedRole === 'unit_leader' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="zone_id">Zone *</Label>
                                <Select
                                    value={watch('zone_id')}
                                    onValueChange={(value) => setValue('zone_id', value)}
                                >
                                    <SelectTrigger className={formErrors.zone_id || errors?.zone_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {zones
                                            .filter(zone => zone && zone.id && zone.name)
                                            .map((zone) => (
                                                <SelectItem key={zone.id} value={String(zone.id)}>
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{zone.name} ({zone.code})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {(formErrors.zone_id || errors?.zone_id) && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {formErrors.zone_id?.message || errors?.zone_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_id">Unit *</Label>
                                <Select
                                    value={watch('unit_id')}
                                    onValueChange={(value) => setValue('unit_id', value)}
                                    disabled={!watchedZoneId}
                                >
                                    <SelectTrigger className={formErrors.unit_id || errors?.unit_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={watchedZoneId ? "Select unit" : "Select zone first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredUnits
                                            .filter(unit => unit && unit.id && unit.name)
                                            .map((unit) => (
                                                <SelectItem key={unit.id} value={String(unit.id)}>
                                                    <div className="flex items-center space-x-2">
                                                        <Building2 className="w-4 h-4" />
                                                        <span>{unit.name} ({unit.code})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        {filteredUnits.filter(unit => unit && unit.id && unit.name).length === 0 && watchedZoneId && (
                                            <SelectItem value="" disabled>
                                                No units available in this zone
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {(formErrors.unit_id || errors?.unit_id) && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {formErrors.unit_id?.message || errors?.unit_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {watchedRole === 'member' && (
                        <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="unit_id">Unit *</Label>
                            <Select
                                value={watch('unit_id')}
                                onValueChange={(value) => setValue('unit_id', value)}
                            >
                                <SelectTrigger className={formErrors.unit_id || errors?.unit_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units
                                        .filter(unit => unit && unit.id && unit.name)
                                        .map((unit) => (
                                            <SelectItem key={unit.id} value={String(unit.id)}>
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="w-4 h-4" />
                                                    <span>{unit.name} ({unit.code})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    {units.filter(unit => unit && unit.id && unit.name).length === 0 && (
                                        <SelectItem value="" disabled>
                                            No units available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {(formErrors.unit_id || errors?.unit_id) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.unit_id?.message || errors?.unit_id}
                                </p>
                            )}
                        </div>

                            {selectedUnit && selectedUnit.zone && (
                        <div className="space-y-2">
                                    <Label>Auto-Assigned Zone</Label>
                                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                                        <MapPin className="w-4 h-4 text-green-600" />
                                        <BadgeComponent variant="outline" className="text-sm">
                                            {selectedUnit.zone.name} ({selectedUnit.zone.code})
                                        </BadgeComponent>
                                                </div>
                                    <p className="text-xs text-gray-500">
                                        Zone automatically assigned based on selected unit
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                                value={watch('status')}
                                onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
                            >
                                <SelectTrigger className={formErrors.status || errors?.status ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select status" />
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
                            {(formErrors.status || errors?.status) && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.status?.message || errors?.status}
                                </p>
                            )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <User className="w-4 h-4 mr-2" />
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