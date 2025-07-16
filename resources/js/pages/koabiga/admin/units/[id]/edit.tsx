import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnitForm from '@/components/units/UnitForm';
import AppLayout from '@/layouts/app-layout';

interface Unit {
    id: number;
    name: string;
    code: string;
    zone_id: number;
    leader_id?: number;
    status: 'active' | 'inactive';
    zone: {
        id: number;
        name: string;
        code: string;
    };
    leader?: {
        id: number;
        christian_name: string;
        family_name: string;
        phone: string;
        secondary_phone?: string;
    };
}

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

interface EditUnitProps {
    unit: Unit;
    zones: Zone[];
    leaders: Leader[];
}

export default function EditUnit({ unit, zones, leaders }: EditUnitProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        setErrors({});

        try {
            await router.put(`/koabiga/admin/units/${unit.id}`, data, {
                onSuccess: () => {
                    router.visit('/koabiga/admin/units');
                },
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error updating unit:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/koabiga/admin' },
            { title: 'Units Management', href: '/koabiga/admin/units' },
            { title: `Edit ${unit.name}`, href: `/koabiga/admin/units/${unit.id}/edit` }
        ]}>
            <Head title={`Edit ${unit.name} - Koabiga Admin`} />
            
            <div className="flex flex-col items-center justify-center min-h-screen py-8">
                <div className="w-full max-w-4xl space-y-6">

                {/* Header */}
                    <div className="text-center space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">
                                Edit Unit: {unit.name}
                            </h1>
                            <p className="text-green-600 dark:text-green-300 mt-1">
                                Update unit information and assignments
                            </p>
                    </div>
                </div>

                    {/* Form */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-4xl space-y-4">
                            {/* Back Button */}
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.visit('/koabiga/admin/units')}
                                    className="flex items-center"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </div>

                            <UnitForm
                                zones={zones}
                                leaders={leaders}
                                unit={unit}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                errors={errors}
                                onCancel={() => router.visit('/koabiga/admin/units')}
                                    />
                                </div>
                            </div>
                            </div>
            </div>
        </AppLayout>
    );
} 