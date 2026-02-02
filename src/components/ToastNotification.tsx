import { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertCircle } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // in milliseconds, default 5000
}

interface ToastNotificationProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastNotification({
  toast,
  onDismiss,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entry animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'error':
        return <AlertCircle className='w-5 h-5 text-red-500' />;
      case 'warning':
        return <AlertCircle className='w-5 h-5 text-orange-500' />;
      default:
        return <Bell className='w-5 h-5 text-blue-500' />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500/30 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-500/30 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-orange-500/30 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-blue-500/30 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
        min-w-[320px] max-w-md
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
        ${getColorClasses()}
      `}
    >
      {/* Icon */}
      <div className='flex-shrink-0 mt-0.5'>{getIcon()}</div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <h4 className='mb-1 text-sm font-semibold text-gray-900 dark:text-white'>
          {toast.title}
        </h4>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className='flex-shrink-0 p-1 transition-all rounded hover:bg-gray-200 dark:hover:bg-gray-700'
      >
        <X className='w-4 h-4 text-gray-600 dark:text-gray-400' />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className='fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none'>
      <div className='flex flex-col gap-3 pointer-events-auto'>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}
