import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeaderMemberForm from '@/components/members/LeaderMemberForm';
import UnitLeaderLayout from '@/layouts/unit-leader-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import axios from '@/lib/axios';

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
    christian_name: string;
    family_name: string;
}

interface MemberCreationProps {
    units: Unit[];
    zones: Zone[];
    leaderUser: LeaderUser;
}

export default function MemberCreation({ units, zones, leaderUser }: MemberCreationProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<string | null>(null);

    const breadcrumbs = [
        { title: 'Unit Leader Dashboard', href: '/koabiga/leaders/dashboard' },
        { title: 'Forms', href: '/koabiga/leaders/leaders-forms' },
        { title: 'Member Creation', href: '/koabiga/leaders/leaders-forms/member-creation' },
    ];

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        setErrors({});
        setSuccess(null);

        try {
            console.log('Submitting member data:', data);

            const response = await axios.post('/api/leaders/members', data);
            
            if (response.data.success) {
                setSuccess('Member created successfully! Redirecting...');
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    router.visit('/koabiga/leaders/leaders-forms');
                }, 2000);
            } else {
                setErrors(response.data.errors || { general: response.data.message || 'Failed to create member' });
            }
        } catch (err: any) {
            console.error('Error creating member:', err);
            
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ 
                    general: err.response?.data?.message || 'Failed to create member. Please try again.' 
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.visit('/koabiga/leaders/leaders-forms');
    };

    return (
        <UnitLeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Member - Koabiga Leaders" />
            
            <div className="flex flex-col items-center justify-center min-h-screen py-8">
                <div className="w-full max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Create New Member</h1>
                            <p className="text-green-600 dark:text-green-300 mt-1">
                                Add a new member to your {leaderUser.role === 'unit_leader' ? 'unit' : 'zone'}
                            </p>
                        </div>
                    </div>

                    {/* Alerts */}
                    {errors.general && (
                        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{errors.general}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Form */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl space-y-4">
                            {/* Back Button */}
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="flex items-center"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Forms
                                </Button>
                            </div>

                            <LeaderMemberForm
                                units={units}
                                zones={zones}
                                leaderUser={leaderUser}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                errors={errors}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </UnitLeaderLayout>
    );
} 