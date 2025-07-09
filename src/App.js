import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Toaster, toast } from 'react-hot-toast';
import { auth } from './firebase';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './pages/LoginScreen.jsx';
import FinancialManager from './pages/FinancialManager.jsx';
import Icon from './components/ui/Icon.jsx';

export default function App() {
    const { user, loading } = useAuth();

    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Login efetuado com sucesso!");
        } catch (error) {
            toast.error("Falha no login: Verifique as suas credenciais.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Sessão terminada com sucesso!");
        } catch (error) {
            toast.error("Erro ao fazer logout.");
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
            <Toaster 
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
            
            {user ? (
                <FinancialManager user={user} onLogout={handleLogout} />
            ) : (
                <LoginScreen onLogin={handleLogin} />
            )}
        </div>
    );
}
