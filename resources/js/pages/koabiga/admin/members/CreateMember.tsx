import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MemberForm from '@/components/members/MemberForm';
import AppLayout from '@/layouts/app-layout';

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

interface CreateMemberProps {
    units: Unit[];
    zones: Zone[];
}

export default function CreateMember({ units, zones }: CreateMemberProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        setErrors({});

        try {
            await router.post('/koabiga/admin/members', data, {
                onSuccess: () => {
                    router.visit('/koabiga/admin/members');
                },
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error creating member:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/koabiga/admin' },
            { title: 'Members Management', href: '/koabiga/admin/members' },
            { title: 'Create Member', href: '/koabiga/admin/members/create' }
        ]}>
            <Head title="Create Member - Koabiga Admin" />
            
            <div className="flex flex-col items-center justify-center min-h-screen py-8">
                <div className="w-full max-w-4xl space-y-6">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Create New Member</h1>
                            <p className="text-green-600 dark:text-green-300 mt-1">
                                Add a new member to the platform with role-based access
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl space-y-4">
                            {/* Back Button */}
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.visit('/koabiga/admin/members')}
                                    className="flex items-center"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </div>

                            <MemberForm
                                zones={zones}
                                units={units}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                errors={errors}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 