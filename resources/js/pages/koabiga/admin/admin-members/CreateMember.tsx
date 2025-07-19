import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
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
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [createdMember, setCreatedMember] = useState<{ 
        christian_name: string; 
        family_name: string;
        date_of_birth?: string;
        address?: string;
    } | null>(null);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        setErrors({});

        try {
            await router.post('/koabiga/admin/admin-members', data, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    // Store the created member info for the success dialog
                    setCreatedMember({
                        christian_name: data.christian_name,
                        family_name: data.family_name,
                        date_of_birth: data.date_of_birth,
                        address: data.address
                    });
                    setShowSuccessDialog(true);
                },
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error creating member:', error);
            setIsSubmitting(false);
        }
    };

    const handleSuccessDialogClose = () => {
        setShowSuccessDialog(false);
        setCreatedMember(null);
        // Redirect to member management page
        router.visit('/koabiga/admin/admin-members');
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Admin', href: '/koabiga/admin' },
            { title: 'Members Management', href: '/koabiga/admin/admin-members' },
            { title: 'Create Member', href: '/koabiga/admin/admin-members/create' }
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
                                    onClick={() => router.visit('/koabiga/admin/admin-members')}
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

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            Member Created Successfully!
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            The new member has been added to the platform and can now access their account.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        {/* Member Info */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                                    <Users className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-green-800 dark:text-green-200">
                                        {createdMember?.christian_name} {createdMember?.family_name}
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        Member account activated
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <p>✅ Member profile created successfully</p>
                            <p>✅ Account credentials generated</p>
                            <p>✅ Role-based permissions assigned</p>
                            <p>✅ Ready for platform access</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleSuccessDialogClose}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                View All Members
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
} 