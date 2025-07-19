import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from '@/lib/axios';

interface PayAllFeesModalProps {
    isOpen: boolean;
    onClose: () => void;
    pendingFees: any[];
    totalAmount: number;
}

interface PaymentStatus {
    status: 'idle' | 'initiating' | 'pending' | 'successful' | 'failed';
    message: string;
    referenceId?: string;
}

export default function PayAllFeesModal({ isOpen, onClose, pendingFees, totalAmount }: PayAllFeesModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle', message: '' });
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPhoneNumber('');
            setPaymentStatus({ status: 'idle', message: '' });
            setIsCheckingStatus(false);
        }
    }, [isOpen]);

    const handleInitiatePayment = async () => {
        if (!phoneNumber.trim()) {
            setPaymentStatus({ status: 'failed', message: 'Please enter a valid phone number' });
            return;
        }

        try {
            setPaymentStatus({ status: 'initiating', message: 'Initiating payment for all fees...' });

            // Create a combined payment for all pending fees
            const response = await axios.post('/member/payments/initiate', {
                phone_number: phoneNumber,
                amount: totalAmount,
                description: `Payment for ${pendingFees.length} fees - ${pendingFees.map(fee => fee.fee_rule.name).join(', ')}`,
                fee_application_ids: pendingFees.map(fee => fee.id),
                payment_type: 'bulk'
            });

            if (response.data.success) {
                const referenceId = response.data.data.reference_id;
                setPaymentStatus({ 
                    status: 'pending', 
                    message: 'Payment initiated. Please check your phone for the payment prompt.',
                    referenceId 
                });
                
                // Start polling for status updates
                pollPaymentStatus(referenceId);
            } else {
                setPaymentStatus({ status: 'failed', message: response.data.message || 'Failed to initiate payment' });
            }
        } catch (error: any) {
            console.error('Payment initiation error:', error);
            setPaymentStatus({ 
                status: 'failed', 
                message: error.response?.data?.message || 'Failed to initiate payment. Please try again.' 
            });
        }
    };

    const pollPaymentStatus = async (referenceId: string) => {
        setIsCheckingStatus(true);
        
        const checkStatus = async () => {
            try {
                const response = await axios.post('/member/payments/check-status', {
                    reference_id: referenceId
                });

                if (response.data.success) {
                    const status = response.data.data.status;
                    
                    if (status === 'SUCCESSFUL') {
                        setPaymentStatus({ 
                            status: 'successful', 
                            message: 'Payment successful! All fees have been paid.',
                            referenceId 
                        });
                        setIsCheckingStatus(false);
                        return;
                    } else if (status === 'FAILED' || status === 'REJECTED' || status === 'TIMEOUT') {
                        setPaymentStatus({ 
                            status: 'failed', 
                            message: `Payment ${status.toLowerCase()}. Please try again.`,
                            referenceId 
                        });
                        setIsCheckingStatus(false);
                        return;
                    }
                    
                    // If still pending, continue polling
                    setTimeout(checkStatus, 3000);
                } else {
                    setPaymentStatus({ 
                        status: 'failed', 
                        message: 'Failed to check payment status',
                        referenceId 
                    });
                    setIsCheckingStatus(false);
                }
            } catch (error: any) {
                console.error('Status check error:', error);
                setPaymentStatus({ 
                    status: 'failed', 
                    message: 'Failed to check payment status',
                    referenceId 
                });
                setIsCheckingStatus(false);
            }
        };

        // Start polling
        setTimeout(checkStatus, 3000);
    };

    const handleClose = () => {
        if (paymentStatus.status === 'initiating' || paymentStatus.status === 'pending') {
            return; // Don't allow closing during payment
        }
        onClose();
    };

    const getStatusIcon = () => {
        switch (paymentStatus.status) {
            case 'initiating':
                return <Loader2 className="h-6 w-6 animate-spin text-blue-600" />;
            case 'pending':
                return <Clock className="h-6 w-6 text-yellow-600" />;
            case 'successful':
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case 'failed':
                return <XCircle className="h-6 w-6 text-red-600" />;
            default:
                return <DollarSign className="h-6 w-6 text-gray-600" />;
        }
    };

    const getStatusColor = () => {
        switch (paymentStatus.status) {
            case 'initiating':
                return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
            case 'pending':
                return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
            case 'successful':
                return 'border-green-200 bg-green-50 dark:bg-green-900/20';
            case 'failed':
                return 'border-red-200 bg-red-50 dark:bg-red-900/20';
            default:
                return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    if (pendingFees.length === 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Pay All Fees
                    </DialogTitle>
                    <DialogDescription>
                        Pay all your pending fees using MTN Mobile Money
                    </DialogDescription>
                </DialogHeader>

                {paymentStatus.status === 'idle' && (
                    <div className="space-y-4">
                        {/* Fee Summary */}
                        <div className="space-y-3">
                            <h4 className="font-medium">Fees to be paid:</h4>
                            <div className="max-h-32 overflow-y-auto space-y-2">
                                {pendingFees.map((fee) => (
                                    <div key={fee.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <div>
                                            <p className="text-sm font-medium">{fee.fee_rule.name}</p>
                                            <p className="text-xs text-muted-foreground">Due: {new Date(fee.due_date).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {Math.round(fee.amount).toLocaleString()} RWF
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="font-semibold">Total Amount:</span>
                                <span className="font-bold text-lg">{Math.round(totalAmount).toLocaleString()} RWF</span>
                            </div>
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
                            <p className="text-xs text-muted-foreground">
                                Enter the phone number registered with MTN Mobile Money
                            </p>
                        </div>

                        {/* Warning */}
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                You will receive a payment prompt on your phone. Please complete the payment to process all fees.
                            </AlertDescription>
                        </Alert>

                        <div className="flex gap-2">
                            <Button 
                                onClick={handleInitiatePayment}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={!phoneNumber.trim()}
                            >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Pay {Math.round(totalAmount).toLocaleString()} RWF
                            </Button>
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {(paymentStatus.status === 'initiating' || paymentStatus.status === 'pending') && (
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor()}`}>
                            {getStatusIcon()}
                            <div>
                                <p className="font-medium">{paymentStatus.message}</p>
                                {paymentStatus.status === 'pending' && (
                                    <p className="text-sm text-muted-foreground">
                                        Checking payment status...
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {isCheckingStatus && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Checking payment status...
                            </div>
                        )}
                    </div>
                )}

                {paymentStatus.status === 'successful' && (
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor()}`}>
                            {getStatusIcon()}
                            <div>
                                <p className="font-medium text-green-800 dark:text-green-200">{paymentStatus.message}</p>
                                <p className="text-sm text-muted-foreground">
                                    All fees have been successfully paid!
                                </p>
                            </div>
                        </div>
                        
                        <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Done
                        </Button>
                    </div>
                )}

                {paymentStatus.status === 'failed' && (
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor()}`}>
                            {getStatusIcon()}
                            <div>
                                <p className="font-medium text-red-800 dark:text-red-200">{paymentStatus.message}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleInitiatePayment}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
} 