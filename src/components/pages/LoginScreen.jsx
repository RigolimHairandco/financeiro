import React, { useState } from 'react';
import Icon from '../components/ui/Icon';

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
                    <p className="mt-2 text-sm text-gray-600">Use as suas credenciais para entrar.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="relative">
                            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                                {showPassword ? <Icon name="eyeoff" className="h-5 w-5 text-gray-500" /> : <Icon name="eye" className="h-5 w-5 text-gray-500" />}
                            </button>
                        </div>
                    </div>
                    {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><span className="block sm:inline">{error}</span></div>)}
                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Entrar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
