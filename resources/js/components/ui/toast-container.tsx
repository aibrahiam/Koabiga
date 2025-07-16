import { Toast, ToastClose, ToastDescription, ToastTitle } from './toast';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'destructive':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant} className="min-w-[300px]">
          <div className="flex items-start gap-3">
            {getIcon(toast.variant)}
            <div className="flex-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
          </div>
          <ToastClose onClick={() => onRemove(toast.id)} />
        </Toast>
      ))}
    </div>
  );
} 