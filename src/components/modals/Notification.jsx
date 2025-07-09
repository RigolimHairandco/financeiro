import React, { useEffect } from 'react';
import Icon from '../ui/Icon.jsx';

const Notification = ({ notification, onClear }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onClear();
            }, 4000); // A notificação some após 4 segundos
            return () => clearTimeout(timer);
        }
    }, [notification, onClear]);

    if (!notification) {
        return null;
    }

    const notificationStyles = {
        success: 'border-green-500 bg-green-100 text-green-800',
        error: 'border-red-500 bg-red-100 text-red-800',
    };

    const iconStyles = {
        success: 'checkcircle',
        error: 'alert-triangle',
    }

    const currentStyle = notificationStyles[notification.type] || notificationStyles.success;
    const currentIcon = iconStyles[notification.type] || iconStyles.success;

    return (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm p-4 rounded-xl shadow-lg border-l-4 ${currentStyle} animate-fade-in-down`}>
            <div className="flex items-center">
                <div className="mr-3">
                    <Icon name={currentIcon} size={24} />
                </div>
                <div className="text-sm font-medium">
                    {notification.message}
                </div>
                <button onClick={onClear} className="ml-auto p-1 rounded-md hover:bg-black/10">
                    <Icon name="x" size={18} />
                </button>
            </div>
        </div>
    );
};

export default Notification;
