import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import FinancialManager from './FinancialManager.jsx'; // Corrigido para importar do ficheiro .jsx

// =============================================================================
//  CONFIGURAÇÃO DO FIREBASE - v1
// =============================================================================
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// =============================================================================
//  HOOK DE AUTENTICAÇÃO
// =============================================================================
function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    return { user, loading };
}

// =============================================================================
//  COMPONENTES DE UI BÁSICOS
// =============================================================================
const Icon = ({ name, size = 24, className = '' }) => {
    const icons = {
        wallet: <path d="M21 12v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1" />,
        eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
        eyeOff: <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></>,
    };
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{icons[name.toLowerCase()] || <circle cx="12" cy="12" r="10" />}</svg>;
};

const AlertModal = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Aviso</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center">
                    <button onClick={onClose} className="py-2 px-8 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">OK</button>
                </div>
            </div>
        </div>
    );
};

const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor, preencha e-mail e senha.');
            return;
        }
        onLogin(email, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <Icon name="wallet" className="mx-auto text-indigo-600" size={48} />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Aceder ao Gestor Financeiro</h2>
                    <p className="mt-2 text-sm text-gray-600">Use as suas credenciais do Firebase para entrar.<br /><strong className="text-indigo-600">Importante:</strong> Precisa de ter criado um utilizador no painel do seu Firebase.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div><input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                        <div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">{showPassword ? <Icon name="eyeOff" className="h-5 w-5 text-gray-500" /> : <Icon name="eye" className="h-5 w-5 text-gray-500" />}</button></div>
                    </div>
                    {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><span className="block sm:inline">{error}</span></div>)}
                    <div><button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Entrar</button></div>
                </form>
            </div>
        </div>
    );
};


// =============================================================================
//  COMPONENTE PRINCIPAL (Wrapper da Aplicação)
// =============================================================================
export default function App() {
    const { user, loading } = useAuth();
    const [alertMessage, setAlertMessage] = useState('');
    
    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setAlertMessage("Falha no login: Verifique as suas credenciais.");
            console.error("Login error:", error.message);
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
            <div className="flex justify-center items-center h-screen bg-gray-100">
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
