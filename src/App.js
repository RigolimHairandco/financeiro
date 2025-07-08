import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy, onSnapshot, addDoc, doc, updateDoc, getDoc, writeBatch, deleteDoc, Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// =============================================================================
//  CONFIGURAÇÃO DO FIREBASE
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
const db = getFirestore(app);

// =============================================================================
//  CONSTANTES
// =============================================================================
const TRANSACTION_TYPES = { INCOME: 'income', EXPENSE: 'expense' };
const DEBT_STATUS = { ACTIVE: 'active', PAID: 'paid' };
const EXPENSE_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte Combustível', 'Transporte Manutenção', 'Lazer', 'Educação', 'Vestuário', 'Saúde', 'Contas', 'Pagamento de Dívida', 'Outros'];
const INCOME_SOURCES = ['Salário', 'Fotografia', 'Freelance', 'Investimentos', 'Outros'];

// =============================================================================
//  HOOKS PERSONALIZADOS
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

function useTransactions(userId) {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        if (!userId) {
            setTransactions([]);
            return;
        }
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
        if (!userId) {
            setDebts([]);
            return;
        }
        const q = query(collection(db, `users/${userId}/debts`), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setDebts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [userId]);
    return debts;
}

// =============================================================================
//  COMPONENTES DE UI (Definidos antes de serem usados)
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

const FinancialManager = ({ user, onLogout, setAlertMessage }) => {
    const transactions = useTransactions(user.uid);
    const debts = useDebts(user.uid);
    
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState({id: null, type: null, data: null});
    const [filterPeriod, setFilterPeriod] = useState('month');
    const [debtToPay, setDebtToPay] = useState(null);
    const [view, setView] = useState('dashboard');

    const handleSaveTransaction = async (data, id) => {
        const batch = writeBatch(db);
        try {
            if (id) {
                if(data.linkedDebtId) {
                    setAlertMessage("Não é possível editar uma transação de pagamento. Apague-a e crie uma nova.");
                    return;
                }
                const transRef = doc(db, `users/${user.uid}/transactions`, id);
                batch.update(transRef, data);
            } else {
                const newTransRef = doc(collection(db, `users/${user.uid}/transactions`));
                batch.set(newTransRef, data);
                if (data.category === 'Pagamento de Dívida' && data.linkedDebtId) {
                    const debtRef = doc(db, `users/${user.uid}/debts`, data.linkedDebtId);
                    const debtDoc = await getDoc(debtRef);
                    if(debtDoc.exists()){
                        const debtData = debtDoc.data();
                        const newPaidAmount = debtData.paidAmount + data.amount;
                        const newStatus = newPaidAmount >= debtData.totalAmount ? DEBT_STATUS.PAID : DEBT_STATUS.ACTIVE;
                        batch.update(debtRef, { paidAmount: newPaidAmount, status: newStatus });
                    }
                }
            }
            await batch.commit();
        } catch (e) {
            console.error("Erro ao guardar transação:", e);
            setAlertMessage("Ocorreu um erro ao guardar a transação.");
        }
    };

    const handleSaveDebt = async (data) => {
        try {
            await addDoc(collection(db, `users/${user.uid}/debts`), data);
        } catch (e) {
            console.error("Erro ao guardar dívida:", e);
            setAlertMessage("Ocorreu um erro ao guardar a dívida.");
        }
    };

    const handleDeleteConfirmation = (id, type, data = null) => setItemToDelete({id, type, data});

    const handleDelete = async () => {
        if (!itemToDelete.id) return;
        const { id, type, data } = itemToDelete;
        const batch = writeBatch(db);
        const path = `users/${user.uid}/${type}s`;
        const docRef = doc(db, path, id);

        try {
            if (type === 'transaction' && data?.linkedDebtId) {
                const debtRef = doc(db, `users/${user.uid}/debts`, data.linkedDebtId);
                const debtDoc = await getDoc(debtRef);
                if (debtDoc.exists()) {
                    const debtData = debtDoc.data();
                    const newPaidAmount = debtData.paidAmount - data.amount;
                    batch.update(debtRef, { 
                        paidAmount: newPaidAmount < 0 ? 0 : newPaidAmount, 
                        status: DEBT_STATUS.ACTIVE 
                    });
                }
            } else if (type === 'debt') {
                const transQuery = query(collection(db, `users/${user.uid}/transactions`), where("linkedDebtId", "==", id));
                const transSnapshot = await getDocs(transQuery);
                if (!transSnapshot.empty) {
                    setAlertMessage("Não é possível apagar uma dívida que já possui pagamentos registados. Apague primeiro os pagamentos.");
                    setItemToDelete({id: null, type: null, data: null});
                    return;
                }
            }
            
            batch.delete(docRef);
            await batch.commit();

        } catch (e) {
            console.error("Erro ao apagar item:", e);
            setAlertMessage("Ocorreu um erro ao apagar.");
        } finally {
            setItemToDelete({id: null, type: null, data: null});
        }
    };
    
    const handleMakePayment = async (paymentAmount) => {
        if (!debtToPay || !paymentAmount || paymentAmount <= 0) return;
        const batch = writeBatch(db);
        const newTransRef = doc(collection(db, `users/${user.uid}/transactions`));
        batch.set(newTransRef, { 
            description: `Pagamento: ${debtToPay.description}`, 
            amount: paymentAmount, type: TRANSACTION_TYPES.EXPENSE, category: 'Pagamento de Dívida', 
            timestamp: Timestamp.now(), linkedDebtId: debtToPay.id 
        });
        const debtRef = doc(db, `users/${user.uid}/debts`, debtToPay.id);
        const newPaidAmount = debtToPay.paidAmount + paymentAmount;
        const newStatus = newPaidAmount >= debtToPay.totalAmount ? DEBT_STATUS.PAID : DEBT_STATUS.ACTIVE;
        batch.update(debtRef, { paidAmount: newPaidAmount, status: newStatus });
        try {
            await batch.commit();
            setDebtToPay(null);
        } catch (e) {
            console.error("Erro ao processar pagamento:", e);
            setAlertMessage("Ocorreu um erro ao processar o pagamento.");
        }
    };

    const filteredTransactions = useMemo(() => {
        if (filterPeriod === 'month') {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            return transactions.filter(t => t.timestamp && t.timestamp.toDate() >= startOfMonth);
        }
        return transactions;
    }, [transactions, filterPeriod]);

    const { totalIncome, totalExpenses, balance } = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === TRANSACTION_TYPES.INCOME).reduce((acc, t) => acc + t.amount, 0);
        const expenses = filteredTransactions.filter(t => t.type === TRANSACTION_TYPES.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
        return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
    }, [filteredTransactions]);

    const activeDebts = useMemo(() => debts.filter(d => d.status === DEBT_STATUS.ACTIVE), [debts]);
    const totalActiveDebt = useMemo(() => activeDebts.reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0), [activeDebts]);

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
            <ConfirmationModal isOpen={!!itemToDelete.id} onClose={() => setItemToDelete({id: null, type: null, data: null})} onConfirm={handleDelete} title="Confirmar Exclusão" message="Tem a certeza que deseja apagar este item? Esta ação não pode ser desfeita." />
            <PaymentModal isOpen={!!debtToPay} onClose={() => setDebtToPay(null)} onConfirm={handleMakePayment} debt={debtToPay} />
            <header className="bg-white shadow-sm sticky top-0 z-20 no-print">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Icon name="wallet" className="text-indigo-600" size={32} />
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">O Meu Gestor</h1>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button onClick={() => setView(view === 'dashboard' ? 'reports' : 'dashboard')} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            <Icon name={view === 'dashboard' ? 'barChart' : 'wallet'} size={18} />
                            <span>{view === 'dashboard' ? 'Relatórios' : 'Dashboard'}</span>
                        </button>
                       <div className="text-right">
                         <p className="text-sm text-gray-600 truncate max-w-[150px] md:max-w-full">{user.email}</p>
                       </div>
                       <button onClick={onLogout} title="Sair" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                         <Icon name="logOut" size={20} />
                       </button>
                    </div>
                </div>
            </header>
            {view === 'dashboard' ? (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-end mb-4"><div className="flex bg-white rounded-full p-1 shadow-sm border"><button onClick={() => setFilterPeriod('month')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filterPeriod === 'month' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Mês Atual</button><button onClick={() => setFilterPeriod('all')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filterPeriod === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Desde o Início</button></div></div>
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <SummaryCard title="Receitas" value={totalIncome} iconName="arrowUpCircle" colorClass="bg-green-100 text-green-800"/>
                        <SummaryCard title="Despesas" value={totalExpenses} iconName="arrowDownCircle" colorClass="bg-red-100 text-red-800"/>
                        <SummaryCard title="Saldo" value={balance} iconName="dollarSign" colorClass="bg-indigo-100 text-indigo-800"/>
                        <SummaryCard title="Dívidas Ativas" value={totalActiveDebt} iconName="banknote" colorClass="bg-orange-100 text-orange-800"/>
                    </section>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                        <div className="lg:col-span-2"><TransactionForm onSave={handleSaveTransaction} transactionToEdit={transactionToEdit} setTransactionToEdit={setTransactionToEdit} activeDebts={activeDebts} /></div>
                        <div className="lg:col-span-3">
                            <div className="bg-white p-6 rounded-2xl shadow-md mb-8"><h2 className="text-xl font-bold text-gray-800 mb-4">Distribuição de Despesas</h2><ExpensePieChart data={filteredTransactions} /></div>
                            <div className="bg-white p-6 rounded-2xl shadow-md"><h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Transações</h2>{transactions.length === 0 ? <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg"><Icon name="receiptText" size={40} className="mx-auto text-gray-300" /><p className="mt-2 text-gray-500 font-semibold">Nenhuma transação neste período.</p></div> : <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">{filteredTransactions.map(t => <TransactionItem key={t.id} transaction={t} onEdit={setTransactionToEdit} onDelete={(id, data) => handleDeleteConfirmation(id, 'transaction', data)} />)}</ul>}</div>
                        </div>
                    </div>
                    <hr className="my-8" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dívidas Ativas</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-2"><DebtForm onSave={handleSaveDebt} /></div>
                            <div className="lg:col-span-3"><div className="bg-white p-6 rounded-2xl shadow-md">{debts.length === 0 ? <div className="text-center py-8"><Icon name="landmark" size={40} className="mx-auto text-gray-300" /><p className="mt-2 text-gray-500 font-semibold">Nenhuma dívida ativa.</p><p className="text-sm text-gray-400">Adicione as suas dívidas para começar a acompanhá-las.</p></div> : <ul className="space-y-3">{activeDebts.map(d => <DebtItem key={d.id} debt={d} onPay={setDebtToPay} onDelete={(id, data) => handleDeleteConfirmation(id, 'debt', data)} />)}</ul>}</div></div>
                        </div>
                    </div>
                </main>
            ) : (
                <Reports transactions={transactions} />
            )}
        </div>
    );
};

// ... (Restante dos componentes)

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
