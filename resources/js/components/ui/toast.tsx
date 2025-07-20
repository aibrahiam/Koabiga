import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onDismiss?: () => void;
    autoDismiss?: boolean;
    dismissDelay?: number;
    className?: string;
}

export function Toast({ 
    message, 
    type = 'success',
    onDismiss, 
    autoDismiss = true, 
    dismissDelay = 5000,
    className = ''
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoDismiss) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onDismiss?.();
            }, dismissDelay);

            return () => clearTimeout(timer);
        }
    }, [autoDismiss, dismissDelay, onDismiss]);

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-green-50 border-green-200 text-green-800';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error':
                return <X className="w-5 h-5 text-red-400" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-400" />;
            default:
                return <CheckCircle className="w-5 h-5 text-green-400" />;
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${className}`}>
            <div className={`border rounded-lg p-4 shadow-lg ${getToastStyles()}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {getIcon()}
                        <p className="ml-2 font-medium">{message}</p>
                    </div>
                    {onDismiss && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsVisible(false);
                                onDismiss();
                            }}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
} 