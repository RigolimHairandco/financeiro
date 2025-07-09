import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './hooks/useAuth';
import AlertModal from './components/modals/AlertModal.jsx';
import LoginScreen from './pages/LoginScreen.jsx';
import FinancialManager from './pages/FinancialManager.jsx';
import Icon from './components/ui/Icon.jsx';

export default function App() {
    const { user, loading } = useAuth();
    const [alertMessage, setAlertMessage] = useState('');

    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setAlertMessage("Falha no login: " + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            setAlertMessage("Erro ao fazer logout: " + error.message);
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
            <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />
            {user ? (
                <FinancialManager user={user} onLogout={handleLogout} setAlertMessage={setAlertMessage} />
            ) : (
                <LoginScreen onLogin={handleLogin} />
            )}
        </div>
    );
}
