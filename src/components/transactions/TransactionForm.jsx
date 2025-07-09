import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import Icon from '../ui/Icon';

const TransactionForm = ({ onSave, transactionToEdit, setTransactionToEdit, activeDebts, userId, expenseCategories = [], incomeCategories = [] }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState(expenseCategories?.[0]?.name || '');
    const [incomeSource, setIncomeSource] = useState(incomeCategories?.[0]?.name || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [linkedDebtId, setLinkedDebtId] = useState('');
    const isEditing = !!transactionToEdit;

    useEffect(() => {
        if (isEditing) {
            setDescription(transactionToEdit.description);
            setAmount(transactionToEdit.amount);
            setType(transactionToEdit.type);
            setDate(transactionToEdit.timestamp.toDate().toISOString().split('T')[0]);
            if (transactionToEdit.type === 'expense') setCategory(transactionToEdit.category);
            else setIncomeSource(transactionToEdit.incomeSource);
            setLinkedDebtId(transactionToEdit.linkedDebtId || '');
        }
    }, [transactionToEdit, isEditing]);
    
    useEffect(() => {
        if (!isEditing) {
            setCategory(expenseCategories?.[0]?.name || '');
        }
    }, [expenseCategories, isEditing]);

    useEffect(() => {
        if (!isEditing) {
            setIncomeSource(incomeCategories?.[0]?.name || '');
        }
    }, [incomeCategories, isEditing]);

    const resetForm = () => {
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setTransactionToEdit(null);
        setLinkedDebtId('');
        setCategory(expenseCategories?.[0]?.name || '');
        setIncomeSource(incomeCategories?.[0]?.name || '');
        setType('expense');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !amount || parseFloat(amount) <= 0) return;
        const transactionData = {
            description: description.toUpperCase(),
            amount: parseFloat(amount),
            type,
            timestamp: Timestamp.fromDate(new Date(date + 'T00:00:00')),
            ...(type === 'expense' && { category }),
            ...(type === 'income' && { incomeSource }),
            ...(category === 'Pagamento de Dívida' && { category: 'Pagamento de Dívida' }),
            ...(linkedDebtId && { linkedDebtId })
        };
        await onSave(transactionData, transactionToEdit?.id);
        resetForm();
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{isEditing ? 'EDITAR TRANSAÇÃO' : 'ADICIONAR TRANSAÇÃO'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isEditing && (
                    <div>
                        <div className="flex bg-gray-100 rounded-full p-1">
                            <button type="button" onClick={() => setType('expense')} className={`w-full py-2 px-4 rounded-full font-semibold transition ${type === 'expense' ? 'bg-red-500 text-white shadow' : 'text-gray-600'}`}>Despesa</button>
                            <button type="button" onClick={() => setType('income')} className={`w-full py-2 px-4 rounded-full font-semibold transition ${type === 'income' ? 'bg-green-500 text-white shadow' : 'text-gray-600'}`}>Receita</button>
                        </div>
                    </div>
                )}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
                    <input
                        id="description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg uppercase"
                        placeholder="EX: CONTA DE LUZ"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-600 mb-1">Valor (R$)</label>
                        <input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-600 mb-1">Data</label>
                        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                    </div>
                </div>
                <div>
                    {type === 'expense' ? (
                        <>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Categoria</label>
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                {expenseCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                <option value="Pagamento de Dívida">Pagamento de Dívida</option>
                            </select>
                            {category === 'Pagamento de Dívida' && !isEditing && (
                                <div className="mt-4">
                                    <label htmlFor="linked-debt" className="block text-sm font-medium text-gray-600 mb-1">Associar Pagamento a Dívida (Opcional)</label>
                                    <select id="linked-debt" value={linkedDebtId} onChange={(e) => setLinkedDebtId(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <option value="">Pagamento Avulso</option>
                                        {activeDebts.map(debt => <option key={debt.id} value={debt.id}>{debt.description}</option>)}
                                    </select>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <label htmlFor="incomeSource" className="block text-sm font-medium text-gray-600 mb-1">Fonte da Receita</label>
                            <select id="incomeSource" value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                {incomeCategories.map(src => <option key={src.id} value={src.name}>{src.name}</option>)}
                            </select>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4 pt-2">
                    <button type="submit" className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">{isEditing ? 'Guardar Alterações' : 'Adicionar'}</button>
                    {isEditing && (<button type="button" onClick={resetForm} className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">Cancelar</button>)}
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;
