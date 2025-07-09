import React, { useEffect } from 'react';
import Icon from '../ui/Icon.jsx';

const Notification = ({ notification, onClear }) => {
    // Se não houver notificação, não renderiza nada.
    if (!notification) {
        return null;
    }

    // Efeito para limpar a notificação após 4 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            onClear();
        }, 4000);

        // Limpa o timer se o componente for desmontado
        return () => clearTimeout(timer);
    }, [notification, onClear]);

    const notificationStyles = {
        success: {
            bg: 'bg-green-100',
            border: 'border-green-500',
            text: 'text-green-800',
            icon: 'checkcircle',
            iconColor: 'text-green-500',
        },
        error: {
            bg: 'bg-red-100',
            border: 'border-red-500',
            text: 'text-red-800',
            icon: 'alert-triangle', // Você precisará adicionar este ícone
            iconColor: 'text-red-500',
        },
    };

    const styles = notificationStyles[notification.type] || notificationStyles.success;

    return (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm p-4 rounded-xl shadow-lg border-l-4 ${styles.bg} ${styles.border}`}>
            <div className="flex items-center">
                <div className={`mr-3 ${styles.iconColor}`}>
                    <Icon name={styles.icon} size={24} />
                </div>
                <div className={`text-sm font-medium ${styles.text}`}>
                    {notification.message}
                </div>
                <button onClick={onClear} className="ml-auto p-1 rounded-md hover:bg-black/10">
                    <Icon name="x" size={18} className={styles.text} />
                </button>
            </div>
        </div>
    );
};

export default Notification;
