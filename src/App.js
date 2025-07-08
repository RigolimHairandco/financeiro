import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, onSnapshot, addDoc, doc, updateDoc, getDoc, writeBatch, deleteDoc, Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { auth, db } from './firebase';
import { useAuth } from './hooks/useAuth';
// Vamos manter os hooks aqui, mas eles não serão a causa do problema se a tela carregar
import { useExpenseCategories, useIncomeCategories } from './hooks/useCategories';

// --- MANTEMOS OS HOOKS ORIGINAIS ---
function useTransactions(userId) {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        if (!userId) { setTransactions([]); return; }
        const q = query(collection(db, `users/${userId}/transactions`), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [userId]);
    return transactions;
}

function useDebts(userId) {
    const [debts, setDebts] = useState([]);
    useEffect(() => {
        if (!userId) { setDebts([]); return; }
        const q = query(collection(db, `users/${userId}/debts`), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setDebts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [userId]);
    return debts;
}

// --- TODOS OS COMPONENTES DE UI PERMANECEM AQUI ---
// (Eles não estão sendo usados no render, então não podem quebrar a aplicação)
const Icon = ({ name, size = 24, className = '' }) => { /* ...código completo dos ícones... */ };
const CategoryIcon = ({ category }) => { /* ...código completo... */ };
const AlertModal = ({ message, onClose }) => { /* ...código completo... */ };
const LoginScreen = ({ onLogin }) => { /* ...código completo... */ };
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => { /* ...código completo... */ };
const PaymentModal = ({ isOpen, onClose, onConfirm, debt }) => { /* ...código completo... */ };
const SummaryCard = ({ title, value, iconName, colorClass }) => { /* ...código completo... */ };
const TransactionForm = ({ onSave, transactionToEdit, setTransactionToEdit, activeDebts, userId, expenseCategories, incomeCategories }) => { /* ...código completo... */ };
const TransactionItem = ({ transaction, onEdit, onDelete }) => { /* ...código completo... */ };
const ExpensePieChart = ({ data }) => { /* ...código completo... */ };
const DebtForm = ({ onSave }) => { /* ...código completo... */ };
const DebtItem = ({ debt, onPay, onDelete }) => { /* ...código completo... */ };
const Reports = ({ transactions }) => { /* ...código completo... */ };
const SettingsPage = ({ setView, expenseCategories, incomeCategories, onAddExpenseCategory, onAddIncomeCategory, onDeleteCategory }) => { /* ...código completo... */ };


// --- FINANCIAL MANAGER COM RENDERIZAÇÃO DE TESTE ---
const FinancialManager = ({ user, onLogout, setAlertMessage }) => {
    // Mantemos os hooks e estados para garantir que eles não quebrem a aplicação
    const transactions = useTransactions(user.uid);
    const debts = useDebts(user.uid);
    const expenseCategories = useExpenseCategories(user.uid);
    const incomeCategories = useIncomeCategories(user.uid);
    const [view, setView] = useState('dashboard');
    
    // O retorno é a única coisa que muda. Renderizamos um texto simples.
    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
            <h1 style={{ color: 'green', fontSize: '28px' }}>Componente FinancialManager Carregado!</h1>
            <p>Isto confirma que o problema está em um dos componentes filhos (como o SummaryCard, TransactionForm, etc.).</p>
            <p>Utilizador: {user.email}</p>
            <button onClick={onLogout} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Sair</button>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (APP) ---
export default function App() {
    const { user, loading } = useAuth();
    const [alertMessage, setAlertMessage] = useState('');
    const handleLogin = async (email, password) => {
        try { await signInWithEmailAndPassword(auth, email, password); }
        catch (error) { alert("Falha no login: " + error.message); }
    };
    const handleLogout = async () => {
        try { await signOut(auth); }
        catch (error) { console.error("Erro ao fazer logout:", error); }
    };

    if (loading) {
        return <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}><h2>A verificar autenticação...</h2></div>;
    }

    return (
        <div>
            <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />
            {user ? (<FinancialManager user={user} onLogout={handleLogout} setAlertMessage={setAlertMessage} />)
                : (<LoginScreen onLogin={handleLogin} />)}
        </div>
    );
}
