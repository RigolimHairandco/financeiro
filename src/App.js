import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './hooks/useAuth';
import AlertModal from './components/modals/AlertModal.jsx'; // Caminho corrigido
import LoginScreen from './pages/LoginScreen.jsx';
import FinancialManager from './pages/FinancialManager.jsx';
import Icon from './components/ui/Icon.jsx';

export default function App() {
    const { user, loading } = useAuth();
    const [alertMessage, setAlertMessage] = useState(null); // Corrigido para null para consistência

    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            // Usando o novo sistema de notificação
            setAlertMessage({ message: "Falha no login: Verifique as suas credenciais.", type: 'error' });
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Usando o novo sistema de notificação
            setAlertMessage({ message: "Sessão terminada com sucesso!", type: 'success' });
        } catch (error) {
            setAlertMessage({ message: "Erro ao fazer logout.", type: 'error' });
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
            {/* Passando a prop correta para o novo componente de Notificação */}
            <AlertModal notification={alertMessage} onClear={() => setAlertMessage(null)} />
            
            {user ? (
                <FinancialManager user={user} onLogout={handleLogout} setNotification={setAlertMessage} />
            ) : (
                <LoginScreen onLogin={handleLogin} />
            )}
        </div>
    );
}
