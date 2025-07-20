import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface SuccessMessageProps {
    message: string;
    onDismiss?: () => void;
    autoDismiss?: boolean;
    dismissDelay?: number;
    className?: string;
}

export function SuccessMessage({ 
    message, 
    onDismiss, 
    autoDismiss = true, 
    dismissDelay = 5000,
    className = ''
}: SuccessMessageProps) {
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

    if (!isVisible) return null;

    return (
        <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    <p className="text-green-800 font-medium">{message}</p>
                </div>
                {onDismiss && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsVisible(false);
                            onDismiss();
                        }}
                        className="text-green-600 hover:text-green-700 hover:bg-green-100"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
} 