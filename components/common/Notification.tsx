
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;

  return (
    <div className={`fixed top-5 right-5 z-[100] w-full max-w-sm flex items-center p-4 rounded-lg text-white shadow-lg animate-slide-in ${bgColor}`}>
      <Icon className="mr-3 flex-shrink-0" />
      <p className="flex-grow text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20">
        <X size={20} />
      </button>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Notification;
