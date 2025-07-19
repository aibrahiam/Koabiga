import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from '@/lib/axios';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    feeApplication: {
        id: number;
        fee_rule: {
            name: string;
            description: string;
        };
        amount: number;
        due_date: string;
        status: string;
    } | null;
}

interface PaymentStatus {
    status: 'idle' | 'initiating' | 'pending' | 'success' | 'failed';
    message: string;
    referenceId?: string;
}

export default function PaymentModal({ isOpen, onClose, feeApplication }: PaymentModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
        status: 'idle',
        message: ''
    });
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setPaymentStatus({ status: 'idle', message: '' });
            setPhoneNumber('');
        }
    }, [isOpen]);

    const handleInitiatePayment = async () => {
        if (!feeApplication || !phoneNumber.trim()) {
            setPaymentStatus({
                status: 'failed',
                message: 'Please enter a valid phone number'
            });
            return;
        }

        setPaymentStatus({
            status: 'initiating',
            message: 'Initiating payment request...'
        });

        try {
            const response = await axios.post('/member/payments/initiate', {
                fee_application_ids: [feeApplication.id],
                phone_number: phoneNumber.trim(),
                amount: feeApplication.amount,
                description: `Payment for ${feeApplication.fee_rule.name} - ${feeApplication.fee_rule.description}`,
                payment_type: 'single'
            });

            if (response.data.success) {
                setPaymentStatus({
                    status: 'pending',
                    message: 'Payment request sent to MTN Mobile Money. Please check your phone and complete the payment.',
                    referenceId: response.data.data.reference_id
                });

                // Start polling for payment status
                pollPaymentStatus(response.data.data.reference_id);
            } else {
                setPaymentStatus({
                    status: 'failed',
                    message: response.data.message || 'Failed to initiate payment'
                });
            }
        } catch (error: any) {
            console.error('Payment initiation error:', error);
            setPaymentStatus({
                status: 'failed',
                message: error.response?.data?.message || 'Payment initiation failed'
            });
        }
    };

    const pollPaymentStatus = async (referenceId: string) => {
        const maxAttempts = 30; // 5 minutes with 10-second intervals
        let attempts = 0;

        const checkStatus = async () => {
            if (attempts >= maxAttempts) {
                setPaymentStatus({
                    status: 'failed',
                    message: 'Payment timeout. Please try again or contact support.',
                    referenceId
                });
                return;
            }

            try {
                setIsCheckingStatus(true);
                const response = await axios.post('/member/payments/check-status', {
                    reference_id: referenceId
                });

                if (response.data.success) {
                    const status = response.data.data.status;
                    
                    if (status === 'SUCCESSFUL') {
                        setPaymentStatus({
                            status: 'success',
                            message: 'Payment completed successfully!',
                            referenceId
                        });
                        return;
                    } else if (status === 'FAILED' || status === 'REJECTED' || status === 'TIMEOUT') {
                        setPaymentStatus({
                            status: 'failed',
                            message: `Payment ${status.toLowerCase()}. Please try again.`,
                            referenceId
                        });
                        return;
                    }
                    // If still pending, continue polling
                }
            } catch (error) {
                console.error('Status check error:', error);
            } finally {
                setIsCheckingStatus(false);
            }

            attempts++;
            setTimeout(checkStatus, 10000); // Check every 10 seconds
        };

        checkStatus();
    };

    const handleClose = () => {
        if (paymentStatus.status === 'success') {
            // Refresh the page or update the fees list
            window.location.reload();
        }
        onClose();
    };

    const getStatusIcon = () => {
        switch (paymentStatus.status) {
            case 'success':
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case 'failed':
                return <XCircle className="h-6 w-6 text-red-600" />;
            case 'pending':
            case 'initiating':
                return <Clock className="h-6 w-6 text-yellow-600" />;
            default:
                return <DollarSign className="h-6 w-6 text-blue-600" />;
        }
    };

    const getStatusColor = () => {
        switch (paymentStatus.status) {
            case 'success':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            case 'pending':
            case 'initiating':
                return 'text-yellow-600';
            default:
                return 'text-blue-600';
        }
    };

    if (!feeApplication) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getStatusIcon()}
                        <span className={getStatusColor()}>
                            {paymentStatus.status === 'success' && 'Payment Successful'}
                            {paymentStatus.status === 'failed' && 'Payment Failed'}
                            {paymentStatus.status === 'pending' && 'Payment Pending'}
                            {paymentStatus.status === 'initiating' && 'Initiating Payment'}
                            {paymentStatus.status === 'idle' && 'Pay with MTN Mobile Money'}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        {paymentStatus.status === 'idle' && 'Enter your MTN Mobile Money phone number to pay this fee.'}
                        {paymentStatus.status !== 'idle' && paymentStatus.message}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {paymentStatus.status === 'idle' && (
                        <>
                            {/* Fee Details */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold">{feeApplication.fee_rule.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {feeApplication.fee_rule.description}
                                        </p>
                                    </div>
                                    <Badge variant="outline">
                                        {feeApplication.amount.toLocaleString()} RWF
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Due: {new Date(feeApplication.due_date).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Phone Number Input */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">MTN Mobile Money Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="e.g., 0789123456"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-500">
                                    Enter the phone number registered with MTN Mobile Money
                                </p>
                            </div>

                            {/* Payment Button */}
                            <Button 
                                onClick={handleInitiatePayment}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={!phoneNumber.trim()}
                            >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Pay {feeApplication.amount.toLocaleString()} RWF
                            </Button>
                        </>
                    )}

                    {paymentStatus.status === 'initiating' && (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-sm text-gray-600">Initiating payment request...</p>
                        </div>
                    )}

                    {paymentStatus.status === 'pending' && (
                        <div className="space-y-4">
                            <div className="text-center py-4">
                                <Clock className="h-8 w-8 mx-auto mb-4 text-yellow-600" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Payment request sent to MTN Mobile Money
                                </p>
                                <p className="text-xs text-gray-500">
                                    Please check your phone and complete the payment
                                </p>
                            </div>

                            {isCheckingStatus && (
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Checking payment status...
                                </div>
                            )}

                            <Alert>
                                <AlertDescription>
                                    <strong>Reference ID:</strong> {paymentStatus.referenceId}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {paymentStatus.status === 'success' && (
                        <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                            <h3 className="font-semibold text-green-600 mb-2">Payment Successful!</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Your payment of {feeApplication.amount.toLocaleString()} RWF has been processed.
                            </p>
                            <Button onClick={handleClose} className="w-full">
                                Close
                            </Button>
                        </div>
                    )}

                    {paymentStatus.status === 'failed' && (
                        <div className="space-y-4">
                            <div className="text-center py-4">
                                <XCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
                                <p className="text-sm text-red-600 mb-2">Payment Failed</p>
                                <p className="text-xs text-gray-500">{paymentStatus.message}</p>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => setPaymentStatus({ status: 'idle', message: '' })}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Try Again
                                </Button>
                                <Button onClick={handleClose} className="flex-1">
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 