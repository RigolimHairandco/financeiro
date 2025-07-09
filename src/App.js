import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './hooks/useAuth';
import Notification from './components/modals/Notification.jsx';
import LoginScreen from './pages/LoginScreen.jsx';
import FinancialManager from './pages/FinancialManager.jsx';
import Icon from './components/ui/Icon.jsx';

export default function App() {
    const { user, loading } = useAuth();
    const [notification, setNotification] = useState(null);

    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setNotification({ message: "Falha no login: Verifique as suas credenciais.", type: 'error' });
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setNotification({ message: "Sessão terminada com sucesso!", type: 'success' });
        } catch (error) {
            setNotification({ message: "Erro ao fazer logout.", type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <Icon name="wallet" size={48} className="mx-auto text-indigo-500 animate-bounce" />
                    <p className="mt-4 text-lg font-semibold text-gray-700">A ligar...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Notification notification={notification} onClear={() => setNotification(null)} />
            
            {user ? (
                <FinancialManager user={user} onLogout={handleLogout} setNotification={setNotification} />
            ) : (
                <LoginScreen onLogin={handleLogin} />
            )}
        </div>
    );
}
