import React, { useState, useMemo } from 'react';
import Icon from '../components/ui/Icon';
import CategoryIcon from '../components/ui/CategoryIcon';

const SettingsPage = ({ setView, expenseCategories, incomeCategories, onAddCategory, onDeleteCategory }) => {
    const [newExpenseCat, setNewExpenseCat] = useState('');
    const [newIncomeCat, setNewIncomeCat] = useState('');

    const expenseSuggestions = ['Moradia', 'Alimentação', 'Transporte - Combustível', 'Transporte - Manutenção', 'Lazer', 'Educação', 'Saúde', 'Contas', 'Vestuário', 'Outros'];
    const incomeSuggestions = ['Salário', 'Freelance', 'Fotografia', 'Investimentos', 'Vendas', 'Outros'];

    const handleAddExpense = (e) => { e.preventDefault(); if (newExpenseCat.trim()) { onAddCategory('expenseCategories', newExpenseCat.trim()); setNewExpenseCat(''); } };
    const handleAddIncome = (e) => { e.preventDefault(); if (newIncomeCat.trim()) { onAddCategory('incomeCategories', newIncomeCat.trim()); setNewIncomeCat(''); } };

    const userExpenseNames = useMemo(() => expenseCategories.map(c => c.name), [expenseCategories]);
    const userIncomeNames = useMemo(() => incomeCategories.map(c => c.name), [incomeCategories]);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={() => setView('dashboard')} className="mb-6 inline-flex items-center gap-2 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
                <Icon name="arrowleft" size={18} /> Voltar
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-8"> Gerir Categorias </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Categorias de Despesa</h2>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <form onSubmit={handleAddExpense} className="flex gap-2 mb-4">
                            <input type="text" value={newExpenseCat} onChange={(e) => setNewExpenseCat(e.target.value.toUpperCase())} placeholder="NOVA CATEGORIA" className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-lg uppercase" required />
                            <button type="submit" className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"><Icon name="plus" /></button>
                        </form>
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Sugestões</h3>
                            <div className="flex flex-wrap gap-2">
                                {expenseSuggestions.filter(s => !userExpenseNames.includes(s)).map(suggestion => (
                                    <button key={suggestion} onClick={() => onAddCategory('expenseCategories', suggestion)} className="flex items-center gap-2 text-sm py-1 px-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
                                        <CategoryIcon category={suggestion} /> {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Suas Categorias</h3>
                        <ul className="space-y-3">
                            {expenseCategories.length > 0 ? (
                                expenseCategories.map(cat => (
                                    <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-800">{cat.name}</span>
                                        <button onClick={() => onDeleteCategory('expenseCategories', cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Icon name="trash2" size={18} /></button>
                                    </li>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Nenhuma categoria de despesa encontrada.</p>
                            )}
                        </ul>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Fontes de Receita</h2>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <form onSubmit={handleAddIncome} className="flex gap-2 mb-4">
                            <input type="text" value={newIncomeCat} onChange={(e) => setNewIncomeCat(e.target.value.toUpperCase())} placeholder="NOVA FONTE DE RECEITA" className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-lg uppercase" required />
                            <button type="submit" className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"><Icon name="plus" /></button>
                        </form>
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Sugestões</h3>
                            <div className="flex flex-wrap gap-2">
                                {incomeSuggestions.filter(s => !userIncomeNames.includes(s)).map(suggestion => (
                                    <button key={suggestion} onClick={() => onAddCategory('incomeCategories', suggestion)} className="flex items-center gap-2 text-sm py-1 px-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
                                        <CategoryIcon category={suggestion} /> {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Suas Fontes</h3>
                        <ul className="space-y-3">
                            {incomeCategories.length > 0 ? (
                                incomeCategories.map(cat => (
                                    <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-800">{cat.name}</span>
                                        <button onClick={() => onDeleteCategory('incomeCategories', cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Icon name="trash2" size={18} /></button>
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

export default SettingsPage;
