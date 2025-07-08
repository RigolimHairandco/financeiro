import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, onSnapshot, addDoc, doc, updateDoc, getDoc, writeBatch, deleteDoc, Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { auth, db } from './firebase';
import { useAuth } from './hooks/useAuth';
import { useExpenseCategories, useIncomeCategories } from './hooks/useCategories';

// =============================================================================
//  CONSTANTES
// =============================================================================
const TRANSACTION_TYPES = { INCOME: 'income', EXPENSE: 'expense' };
const DEBT_STATUS = { ACTIVE: 'active', PAID: 'paid' };
// As listas fixas abaixo serão substituídas em breve
const EXPENSE_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte Combustível', 'Transporte Manutenção', 'Lazer', 'Educação', 'Vestuário', 'Saúde', 'Contas', 'Pagamento de Dívida', 'Outros'];
const INCOME_SOURCES = ['Salário', 'Fotografia', 'Freelance', 'Investimentos', 'Outros'];

// =============================================================================
//  HOOKS PERSONALIZADOS
// =============================================================================
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

// =============================================================================
//  COMPONENTES DE UI
// =============================================================================
const Icon = ({ name, size = 24, className = '' }) => {
    const icons = {
        wallet: <path d="M21 12v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1" />,
        eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
        eyeOff: <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></>,
        arrowUpCircle: <><circle cx="12" cy="12" r="10" /><path d="m8 12 4-4 4 4" /><path d="M12 16V8" /></>,
        arrowDownCircle: <><circle cx="12" cy="12" r="10" /><path d="m8 12 4 4 4-4" /><path d="M12 8v8" /></>,
        dollarSign: <><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
        banknote: <><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></>,
        logOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></>,
        home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
        utensils: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" /></>,
        car: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2.1 12.9A3 3 0 0 0 2 15v5c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></>,
        popcorn: <><path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4" /><path d="M18 12h-2" /><path d="M15 12h-2" /><path d="M12 12H8" /><path d="M8 12H6" /><path d="M6 12H4" /><path d="M20 12c0 5.523-4.477 10-10 10S0 17.523 0 12" transform="translate(2 0)" /></>,
        graduationCap: <><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></>,
        shirt: <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />,
        heartPulse: <><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.7-1 2.1 4.4 1.4-2.2H21" /></>,
        receiptText: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1Z" /><path d="M14 8H8" /><path d="M16 12H8" /><path d="M12 16H8" /></>,
        landmark: <><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></>,
        pencil: <><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></>,
        trash2: <><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></>,
        printer: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></>,
        barChart: <><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></>,
        settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
        arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
        plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    };
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{icons[name.toLowerCase()] || <circle cx="12" cy="12" r="10" />}</svg>;
};

const CategoryIcon = ({ category }) => { /* ...código inalterado... */ };
const AlertModal = ({ message, onClose }) => { /* ...código inalterado... */ };
const LoginScreen = ({ onLogin }) => { /* ...código inalterado... */ };
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => { /* ...código inalterado... */ };
const PaymentModal = ({ isOpen, onClose, onConfirm, debt }) => { /* ...código inalterado... */ };
const SummaryCard = ({ title, value, iconName, colorClass }) => { /* ...código inalterado... */ };
const TransactionForm = ({ onSave, transactionToEdit, setTransactionToEdit, activeDebts, userId }) => { /* ...código inalterado... */ };
const TransactionItem = ({ transaction, onEdit, onDelete }) => { /* ...código inalterado... */ };
const ExpensePieChart = ({ data }) => { /* ...código inalterado... */ };
const DebtForm = ({ onSave }) => { /* ...código inalterado... */ };
const DebtItem = ({ debt, onPay, onDelete }) => { /* ...código inalterado... */ };
const Reports = ({ transactions }) => { /* ...código inalterado... */ };

// ATUALIZADO: SettingsPage agora tem formulários
const SettingsPage = ({ setView, expenseCategories, incomeCategories, onAddExpenseCategory, onAddIncomeCategory, onDeleteCategory }) => {
    const [newExpenseCat, setNewExpenseCat] = useState('');
    const [newIncomeCat, setNewIncomeCat] = useState('');

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (newExpenseCat.trim()) {
            onAddExpenseCategory(newExpenseCat.trim());
            setNewExpenseCat('');
        }
    };

    const handleAddIncome = (e) => {
        e.preventDefault();
        if (newIncomeCat.trim()) {
            onAddIncomeCategory(newIncomeCat.trim());
            setNewIncomeCat('');
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={() => setView('dashboard')} className="mb-6 inline-flex items-center gap-2 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
                <Icon name="arrowLeft" size={18} />
                Voltar
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
                Gerir Categorias
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Coluna de Despesas */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Categorias de Despesa</h2>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <form onSubmit={handleAddExpense} className="flex gap-2 mb-4">
                            <input type="text" value={newExpenseCat} onChange={(e) => setNewExpenseCat(e.target.value)} placeholder="Nova categoria de despesa" className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                            <button type="submit" className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"><Icon name="plus" /></button>
                        </form>
                        <ul className="space-y-3">
                            {expenseCategories.length > 0 ? (
                                expenseCategories.map(cat => (
                                    <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-800">{cat.name}</span>
                                        <button onClick={() => onDeleteCategory('expenseCategories', cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                                            <Icon name="trash2" size={18} />
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Nenhuma categoria de despesa encontrada.</p>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Coluna de Receitas */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Fontes de Receita</h2>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <form onSubmit={handleAddIncome} className="flex gap-2 mb-4">
                            <input type="text" value={newIncomeCat} onChange={(e) => setNewIncomeCat(e.target.value)} placeholder="Nova fonte de receita" className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                            <button type="submit" className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"><Icon name="plus" /></button>
                        </form>
                        <ul className="space-y-3">
                            {incomeCategories.length > 0 ? (
                                incomeCategories.map(cat => (
                                    <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-800">{cat.name}</span>
                                        <button onClick={() => onDeleteCategory('incomeCategories', cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                                            <Icon name="trash2" size={18} />
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Nenhuma fonte de receita encontrada.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
};

// ATUALIZADO: FinancialManager agora tem as funções para salvar e deletar categorias
const FinancialManager = ({ user, onLogout, setAlertMessage }) => {
    const transactions = useTransactions(user.uid);
    const debts = useDebts(user.uid);
    const expenseCategories = useExpenseCategories(user.uid);
    const incomeCategories = useIncomeCategories(user.uid);
    
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState({id: null, type: null, data: null});
    const [filterPeriod, setFilterPeriod] = useState('month');
    const [debtToPay, setDebtToPay] = useState(null);
    const [view, setView] = useState('dashboard');

    // FUNÇÕES DE SALVAR E DELETAR CATEGORIAS
    const handleAddCategory = async (collectionName, categoryName) => {
        if (!categoryName) return;
        try {
            await addDoc(collection(db, `users/${user.uid}/${collectionName}`), {
                name: categoryName
            });
        } catch (e) {
            console.error("Erro ao adicionar categoria:", e);
            setAlertMessage("Ocorreu um erro ao adicionar a categoria.");
        }
    };

    const handleDeleteCategory = async (collectionName, categoryId) => {
        if (!categoryId) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/${collectionName}`, categoryId));
        } catch (e) {
            console.error("Erro ao apagar categoria:", e);
            setAlertMessage("Ocorreu um erro ao apagar a categoria.");
        }
    };

    const handleSaveTransaction = async (data, id) => { /* ...código inalterado... */ };
    const handleSaveDebt = async (data) => { /* ...código inalterado... */ };
    const handleDeleteConfirmation = (id, type, data = null) => setItemToDelete({id, type, data});
    const handleDelete = async () => { /* ...código inalterado... */ };
    const handleMakePayment = async (paymentAmount) => { /* ...código inalterado... */ };

    const filteredTransactions = useMemo(() => { /* ...código inalterado... */ }, [transactions, filterPeriod]);
    const { totalIncome, totalExpenses, balance } = useMemo(() => { /* ...código inalterado... */ }, [filteredTransactions]);
    const activeDebts = useMemo(() => debts.filter(d => d.status === DEBT_STATUS.ACTIVE), [debts]);
    const totalActiveDebt = useMemo(() => activeDebts.reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0), [activeDebts]);

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
            <ConfirmationModal isOpen={!!itemToDelete.id} onClose={() => setItemToDelete({id: null, type: null, data: null})} onConfirm={handleDelete} title="Confirmar Exclusão" message="Tem a certeza que deseja apagar este item? Esta ação não pode ser desfeita." />
            <PaymentModal isOpen={!!debtToPay} onClose={() => setDebtToPay(null)} onConfirm={handleMakePayment} debt={debtToPay} />
            
            <header className="bg-white shadow-sm sticky top-0 z-20 no-print">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setView('dashboard')} className="flex items-center gap-3">
                            <Icon name="wallet" className="text-indigo-600" size={32} />
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800">O Meu Gestor</h1>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button onClick={() => setView('reports')} title="Relatórios" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors">
                            <Icon name="barChart" size={20} />
                        </button>
                        <button onClick={() => setView('settings')} title="Configurações" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors">
                            <Icon name="settings" size={20} />
                        </button>
                        <div className="text-right"><p className="text-sm text-gray-600 truncate max-w-[150px] md:max-w-full">{user.email}</p></div>
                        <button onClick={onLogout} title="Sair" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                            <Icon name="logOut" size={20} />
                        </button>
                    </div>
                </div>
            </header>
            
            {view === 'dashboard' && (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* ...dashboard inalterado... */}
                </main>
            )}

            {view === 'reports' && <Reports transactions={transactions} />}
            
            {view === 'settings' && 
                <SettingsPage 
                    setView={setView} 
                    expenseCategories={expenseCategories} 
                    incomeCategories={incomeCategories}
                    onAddExpenseCategory={(name) => handleAddCategory('expenseCategories', name)}
                    onAddIncomeCategory={(name) => handleAddCategory('incomeCategories', name)}
                    onDeleteCategory={handleDeleteCategory}
                />
            }
        </div>
    );
};

// COMPONENTE PRINCIPAL (Wrapper da Aplicação)
export default function App() {
    const { user, loading } = useAuth();
    const [alertMessage, setAlertMessage] = useState('');
    const handleLogin = async (email, password) => {
        try { await signInWithEmailAndPassword(auth, email, password); }
        catch (error) { setAlertMessage("Falha no login: Verifique as suas credenciais."); console.error("Login error:", error.message); }
    };
    const handleLogout = async () => {
        try { await signOut(auth); }
        catch (error) { setAlertMessage("Erro ao fazer logout: " + error.message); }
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
            {user ? (<FinancialManager user={user} onLogout={handleLogout} setAlertMessage={setAlertMessage} />)
                : (<LoginScreen onLogin={handleLogin} />)}
        </div>
    );
}
