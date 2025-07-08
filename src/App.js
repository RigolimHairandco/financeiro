import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase'; // Importa a conexão
import { useAuth } from './hooks/useAuth'; // Importa nosso hook de autenticação

// --- Componentes de Teste Simplificados ---

// Um Icon placeholder para não dar erro
const Icon = ({ name, size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /></svg>
);

// Uma tela de Login funcional, mas simplificada
const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
            <h2>Ecrã de Login de Teste</h2>
            <form onSubmit={handleLoginSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '10px', width: '250px' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required style={{ padding: '10px', width: '250px' }} />
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Entrar</button>
            </form>
        </div>
    );
};

// Um FinancialManager placeholder que só mostra que o login funcionou
const FinancialManagerPlaceholder = ({ user, onLogout }) => {
    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif', fontSize: '24px', textAlign: 'center', color: '#16a34a' }}>
            <h1>Login com Sucesso!</h1>
            <p style={{ marginTop: '20px', fontSize: '18px' }}>Utilizador: {user.email}</p>
            <button onClick={onLogout} style={{ marginTop: '30px', padding: '10px 20px', cursor: 'pointer' }}>Sair</button>
        </div>
    );
};


// --- Componente Principal da Aplicação ---

export default function App() {
    const { user, loading } = useAuth(); // Usa o hook para saber se o utilizador está logado

    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Falha no login:", error);
            alert("Falha no login: " + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    // Ecrã de "A carregar..."
    if (loading) {
        return (
            <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
                <h2>A verificar autenticação...</h2>
            </div>
        );
    }

    // Renderiza a tela de Login ou o Dashboard de teste
    return (
        <div>
            {user ? (
                <FinancialManagerPlaceholder user={user} onLogout={handleLogout} />
            ) : (
                <LoginScreen onLogin={handleLogin} />
            )}
        </div>
    );
}
