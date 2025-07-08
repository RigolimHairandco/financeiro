import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, onSnapshot, addDoc, doc, updateDoc, getDoc, writeBatch, deleteDoc, Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { auth, db } from './firebase';
import { useAuth } from './hooks/useAuth';
// ADICIONADO: Importa os novos hooks de categoria
import { useExpenseCategories, useIncomeCategories } from './hooks/useCategories';


// =============================================================================
//  CONSTANTES (Inalterado)
// =============================================================================
const TRANSACTION_TYPES = { INCOME: 'income', EXPENSE: 'expense' };
const DEBT_STATUS = { ACTIVE: 'active', PAID: 'paid' };
// As listas fixas abaixo serão substituídas em breve
const EXPENSE_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte Combustível', 'Transporte Manutenção', 'Lazer', 'Educação', 'Vestuário', 'Saúde', 'Contas', 'Pagamento de Dívida', 'Outros'];
const INCOME_SOURCES = ['Salário', 'Fotografia', 'Freelance', 'Investimentos', 'Outros'];


// =============================================================================
//  HOOKS PERSONALIZADOS (Inalterado)
// =============================================================================
function useTransactions(userId) { /* ...código inalterado... */ }
function useDebts(userId) { /* ...código inalterado... */ }


// =============================================================================
//  COMPONENTES DE UI (Apenas SettingsPage foi atualizada)
// =============================================================================
const Icon = ({ name, size = 24, className = '' }) => { /* ...código inalterado... */ };
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


// ATUALIZADO: SettingsPage agora mostra as listas de categorias
const SettingsPage = ({ setView, expenseCategories, incomeCategories }) => {
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
                        <ul className="space-y-3">
                            {expenseCategories.length > 0 ? (
                                expenseCategories.map(cat => (
                                    <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-800">{cat.name}</span>
                                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
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
                        <ul className="space-y-3">
                            {incomeCategories.length > 0 ? (
                                incomeCategories.map(cat => (
                                    <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-800">{cat.name}</span>
                                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
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


// ATUALIZADO: FinancialManager agora busca as categorias e as passa para a SettingsPage
const FinancialManager = ({ user, onLogout, setAlertMessage }) => {
    const transactions = useTransactions(user.uid);
    const debts = useDebts(user.uid);
    // ADICIONADO: Busca as categorias dinâmicas
    const expenseCategories = useExpenseCategories(user.uid);
    const incomeCategories = useIncomeCategories(user.uid);
    
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState({id: null, type: null, data: null});
    const [filterPeriod, setFilterPeriod] = useState('month');
    const [debtToPay, setDebtToPay] = useState(null);
    const [view, setView] = useState('dashboard');

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
                {/* ...cabeçalho inalterado... */}
            </header>
            
            {view === 'dashboard' && (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* ...dashboard inalterado... */}
                </main>
            )}

            {view === 'reports' && <Reports transactions={transactions} />}
            {/* ATUALIZADO: Passa as categorias para a página de configurações */}
            {view === 'settings' && <SettingsPage setView={setView} expenseCategories={expenseCategories} incomeCategories={incomeCategories} />}
        </div>
    );
};


// COMPONENTE PRINCIPAL (Wrapper da Aplicação) - Inalterado
export default function App() { /* ...código inalterado... */ }
