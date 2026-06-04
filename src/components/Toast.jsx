import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Dismiss automatically after 3.5 seconds
    const autoDismissTimer = setTimeout(() => {
      handleClose();
    }, 3500);

    return () => clearTimeout(autoDismissTimer);
  }, [onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    // Wait for fade out animation before triggering close state
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-ink text-cream border border-gold/30 px-5 py-4 shadow-2xl rounded-sm tracking-wide max-w-sm transition-all duration-300 font-sans ${
        isLeaving 
          ? 'opacity-0 translate-y-4 scale-95' 
          : 'animate-toast-in opacity-100'
      }`}
      role="alert"
    >
      {/* Gold Diamond Sparkle Icon */}
      <span className="text-gold text-lg select-none" aria-hidden="true">✦</span>
      
      <p className="text-sm font-medium pr-4 leading-relaxed">{message}</p>
      
      <button
        onClick={handleClose}
        className="ml-auto text-muted hover:text-gold transition-colors duration-200"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
