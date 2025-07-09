import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, writeBatch, deleteDoc, Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../firebase';
import { useTransactions, useDebts } from '../hooks/hooks'; // Assumindo que os hooks estarão em 'hooks.js'
import { useExpenseCategories, useIncomeCategories } from '../hooks/useCategories';
import { useWindowSize } from '../hooks/useWindowSize';
import Icon from '../components/ui/Icon';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import PaymentModal from '../components/modals/PaymentModal';
import SummaryCard from '../components/dashboard/SummaryCard';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionItem from '../components/transactions/TransactionItem';
import DebtForm from '../components/debts/DebtForm';
import DebtItem from '../components/debts/DebtItem';
import Reports from './Reports';
import SettingsPage from './SettingsPage';

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

    const handleAddCategory = async (collectionName, categoryName) => { if (!categoryName) return; try { await addDoc(collection(db, `users/${user.uid}/${collectionName}`), { name: categoryName }); } catch (e) { console.error("Erro ao adicionar categoria:", e); setAlertMessage("Ocorreu um erro ao adicionar a categoria."); } };
    const handleDeleteCategory = async (collectionName, categoryId) => { if (!categoryId) return; try { await deleteDoc(doc(db, `users/${user.uid}/${collectionName}`, categoryId)); } catch (e) { console.error("Erro ao apagar categoria:", e); setAlertMessage("Ocorreu um erro ao apagar a categoria."); } };
    const handleSaveTransaction = async (data, id) => { const batch = writeBatch(db); try { if (id) { if(data.linkedDebtId) { setAlertMessage("Não é possível editar uma transação de pagamento. Apague-a e crie uma nova."); return; } const transRef = doc(db, `users/${user.uid}/transactions`, id); batch.update(transRef, data); } else { const newTransRef = doc(collection(db, `users/${user.uid}/transactions`)); batch.set(newTransRef, data); if (data.category === 'Pagamento de Dívida' && data.linkedDebtId) { const debtRef = doc(db, `users/${user.uid}/debts`, data.linkedDebtId); const debtDoc = await getDoc(debtRef); if(debtDoc.exists()){ const debtData = debtDoc.data(); const newPaidAmount = debtData.paidAmount + data.amount; const newStatus = newPaidAmount >= debtData.totalAmount ? 'paid' : 'active'; batch.update(debtRef, { paidAmount: newPaidAmount, status: newStatus }); } } } await batch.commit(); } catch (e) { console.error("Erro ao guardar transação:", e); setAlertMessage("Ocorreu um erro ao guardar a transação."); } };
    const handleSaveDebt = async (data) => { try { await addDoc(collection(db, `users/${user.uid}/debts`), data); } catch (e) { console.error("Erro ao guardar dívida:", e); setAlertMessage("Ocorreu um erro ao guardar a dívida."); } };
    const handleDeleteConfirmation = (id, type, data = null) => setItemToDelete({id, type, data});
    const handleDelete = async () => { if (!itemToDelete.id) return; const { id, type, data } = itemToDelete; const batch = writeBatch(db); const path = `users/${user.uid}/${type}s`; const docRef = doc(db, path, id); try { if (type === 'transaction' && data?.linkedDebtId) { const debtRef = doc(db, `users/${user.uid}/debts`, data.linkedDebtId); const debtDoc = await getDoc(debtRef); if (debtDoc.exists()) { const debtData = debtDoc.data(); const newPaidAmount = debtData.paidAmount - data.amount; batch.update(debtRef, { paidAmount: newPaidAmount < 0 ? 0 : newPaidAmount, status: 'active' }); } } else if (type === 'debt') { const transQuery = query(collection(db, `users/${user.uid}/transactions`), where("linkedDebtId", "==", id)); const transSnapshot = await getDocs(transQuery); if (!transSnapshot.empty) { setAlertMessage("Não é possível apagar uma dívida com pagamentos registados. Apague primeiro os pagamentos."); setItemToDelete({id: null, type: null, data: null}); return; } } batch.delete(docRef); await batch.commit(); } catch (e) { console.error("Erro ao apagar item:", e); setAlertMessage("Ocorreu um erro ao apagar."); } finally { setItemToDelete({id: null, type: null, data: null}); } };
    const handleMakePayment = async (paymentAmount) => { if (!debtToPay || !paymentAmount || paymentAmount <= 0) return; const batch = writeBatch(db); const newTransRef = doc(collection(db, `users/${user.uid}/transactions`)); batch.set(newTransRef, { description: `Pagamento: ${debtToPay.description}`.toUpperCase(), amount: paymentAmount, type: 'expense', category: 'Pagamento de Dívida', timestamp: Timestamp.now(), linkedDebtId: debtToPay.id }); const debtRef = doc(db, `users/${user.uid}/debts`, debtToPay.id); const newPaidAmount = debtToPay.paidAmount + paymentAmount; const newStatus = newPaidAmount >= debtToPay.totalAmount ? 'paid' : 'active'; batch.update(debtRef, { paidAmount: newPaidAmount, status: newStatus }); try { await batch.commit(); setDebtToPay(null); } catch (e) { console.error("Erro ao processar pagamento:", e); setAlertMessage("Ocorreu um erro ao processar o pagamento."); } };
    
    const filteredTransactions = useMemo(() => { if (filterPeriod === 'month') { const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1); return transactions.filter(t => t.timestamp && t.timestamp.toDate() >= startOfMonth); } return transactions; }, [transactions, filterPeriod]);
    const { totalIncome, totalExpenses, balance } = useMemo(() => { const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0); const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0); return { totalIncome: income, totalExpenses: expenses, balance: income - expenses }; }, [filteredTransactions]);
    const activeDebts = useMemo(() => debts.filter(d => d.status === 'active'), [debts]);
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
                        <button onClick={() => setView('reports')} title="Relatórios" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"><Icon name="barchart" size={20} /></button>
                        <button onClick={() => setView('settings')} title="Configurações" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"><Icon name="settings" size={20} /></button>
                        <div className="text-right"><p className="text-sm text-gray-600 truncate max-w-[150px] md:max-w-full">{user.email}</p></div>
                        <button onClick={onLogout} title="Sair" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"><Icon name="logout" size={20} /></button>
                    </div>
                </div>
            </header>
            
            {view === 'dashboard' && (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <SummaryCard title="Receitas (Mês)" value={totalIncome} iconName="arrowupcircle" colorClass="bg-green-100 text-green-800" />
                        <SummaryCard title="Despesas (Mês)" value={totalExpenses} iconName="arrowdowncircle" colorClass="bg-red-100 text-red-800" />
                        <SummaryCard title="Saldo (Mês)" value={balance} iconName="dollarsign" colorClass="bg-indigo-100 text-indigo-800" />
                        <SummaryCard title="Dívidas Ativas" value={totalActiveDebt} iconName="banknote" colorClass="bg-orange-100 text-orange-800" />
                    </section>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Distribuição de Despesas (Mês)</h2>
                        <ExpensePieChart data={filteredTransactions} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                        <div className="lg:col-span-2">
                            <TransactionForm onSave={handleSaveTransaction} transactionToEdit={transactionToEdit} setTransactionToEdit={setTransactionToEdit} activeDebts={activeDebts} userId={user.uid} expenseCategories={expenseCategories} incomeCategories={incomeCategories}/>
                        </div>
                        <div className="lg:col-span-3">
                            <div className="bg-white p-6 rounded-2xl shadow-md h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Histórico de Transações</h2>
                                    <div className="flex bg-gray-100 rounded-full p-1 shadow-sm border">
                                        <button onClick={() => setFilterPeriod('month')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filterPeriod === 'month' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Mês Atual</button>
                                        <button onClick={() => setFilterPeriod('all')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filterPeriod === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Tudo</button>
                                    </div>
                                </div>
                                {transactions.length === 0 ? <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg h-full flex flex-col justify-center"><Icon name="receipttext" size={40} className="mx-auto text-gray-300" /><p className="mt-2 text-gray-500 font-semibold">Nenhuma transação encontrada.</p></div> : <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">{filteredTransactions.map(t => <TransactionItem key={t.id} transaction={t} onEdit={setTransactionToEdit} onDelete={(id, data) => handleDeleteConfirmation(id, 'transaction', data)} />)}</ul>}
                            </div>
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
            )}
            {view === 'reports' && <Reports transactions={transactions} />}
            {view === 'settings' && <SettingsPage setView={setView} expenseCategories={expenseCategories} incomeCategories={incomeCategories} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />}
        </div>
    );
};

export default FinancialManager;
