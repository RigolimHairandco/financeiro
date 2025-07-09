import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, writeBatch, deleteDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTransactions, useDebts, useBudgets, useRecurringTransactions, useGoals } from '../hooks/dataHooks.js';
import { useExpenseCategories, useIncomeCategories } from '../hooks/useCategories.js';
import Icon from '../components/ui/Icon.jsx';
import ConfirmationModal from '../components/modals/ConfirmationModal.jsx';
import PaymentModal from '../components/modals/PaymentModal.jsx';
import ContributeToGoalModal from '../components/modals/ContributeToGoalModal.jsx';
import SummaryCard from '../components/dashboard/SummaryCard.jsx';
import ExpensePieChart from '../components/dashboard/ExpensePieChart.jsx';
import BudgetProgress from '../components/dashboard/BudgetProgress.jsx';
import TransactionForm from '../components/transactions/TransactionForm.jsx';
import TransactionItem from '../components/transactions/TransactionItem.jsx';
import RecurringTransactionItem from '../components/transactions/RecurringTransactionItem.jsx';
import DebtForm from '../components/debts/DebtForm.jsx';
import DebtItem from '../components/debts/DebtItem.jsx';
import GoalForm from '../components/goals/GoalForm.jsx';
import GoalItem from '../components/goals/GoalItem.jsx';
import Reports from './Reports.jsx';
import SettingsPage from './SettingsPage.jsx';

const FinancialManager = ({ user, onLogout, setAlertMessage }) => {
    // ... (toda a parte de hooks e estados permanece a mesma)
    const [goalToContribute, setGoalToContribute] = useState(null);

    // ... (todas as outras funções 'handle' permanecem as mesmas)
    const handleSaveGoal = async (goalData) => { /* ...código inalterado... */ };
    const handleDeleteGoal = async (goalId) => { /* ...código inalterado... */ };
    
    // NOVA FUNÇÃO PARA PROCESSAR A CONTRIBUIÇÃO
    const handleContributeToGoal = async (goal, amount) => {
        if (!goal || !amount || amount <= 0) return;

        const batch = writeBatch(db);

        // 1. Cria a transação de despesa para a poupança
        const newTransactionRef = doc(collection(db, `users/${user.uid}/transactions`));
        batch.set(newTransactionRef, {
            description: `CONTRIBUIÇÃO PARA META: ${goal.name}`.toUpperCase(),
            amount: amount,
            type: 'expense',
            category: 'Poupança',
            timestamp: Timestamp.now(),
            isRecurring: false
        });

        // 2. Atualiza o valor atual da meta
        const goalRef = doc(db, `users/${user.uid}/goals`, goal.id);
        const newCurrentAmount = goal.currentAmount + amount;
        batch.update(goalRef, { currentAmount: newCurrentAmount });

        try {
            await batch.commit();
            setGoalToContribute(null); // Fecha o modal
            setAlertMessage("Contribuição registada com sucesso!");
        } catch (e) {
            console.error("Erro ao contribuir para a meta:", e);
            setAlertMessage("Ocorreu um erro ao registar a contribuição.");
        }
    };

    // ... (toda a parte de useMemo permanece a mesma)

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
            {/* ... (outros modais) ... */}
            <ContributeToGoalModal 
                isOpen={!!goalToContribute} 
                onClose={() => setGoalToContribute(null)} 
                onConfirm={handleContributeToGoal} 
                goal={goalToContribute} 
            />
            
            <header>
                {/* ... cabeçalho inalterado ... */}
            </header>
            
            {view === 'dashboard' && ( 
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* ... todo o resto do dashboard ... */}
                    <hr className="my-8" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Metas de Poupança</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-2"><GoalForm onSave={handleSaveGoal} /></div>
                            <div className="lg:col-span-3">
                                <div className="bg-white p-6 rounded-2xl shadow-md">
                                    {goals.length === 0 ? (
                                        <div className="text-center py-8"><Icon name="flag" size={40} className="mx-auto text-gray-300" /><p className="mt-2 text-gray-500 font-semibold">Nenhuma meta criada.</p><p className="text-sm text-gray-400">Crie sua primeira meta para começar a poupar!</p></div>
                                    ) : (
                                        <ul className="space-y-3">
                                            {goals.map(g => <GoalItem key={g.id} goal={g} onContribute={setGoalToContribute} onDelete={() => handleDeleteGoal(g.id)} />)}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ... resto do dashboard ... */}
                </main> 
            )}
            {view === 'reports' && <Reports transactions={transactions} />}
            {view === 'settings' && <SettingsPage /* ...props inalteradas... */ />}
        </div>
    );
};

export default FinancialManager;
