import React, { useState, useMemo } from 'react';
import Icon from '../components/ui/Icon';

const Reports = ({ transactions }) => {
    const getMonthStartEnd = () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
    };

    const [startDate, setStartDate] = useState(getMonthStartEnd().start);
    const [endDate, setEndDate] = useState(getMonthStartEnd().end);

    const filteredTransactions = useMemo(() => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        return transactions.filter(t => {
            const transDate = t.timestamp.toDate();
            return transDate >= start && transDate <= end;
        });
    }, [transactions, startDate, endDate]);

    const incomes = useMemo(() => filteredTransactions.filter(t => t.type === 'income'), [filteredTransactions]);
    const expenses = useMemo(() => filteredTransactions.filter(t => t.type === 'expense'), [filteredTransactions]);
    const totalIncome = useMemo(() => incomes.reduce((acc, t) => acc + t.amount, 0), [incomes]);
    const totalExpenses = useMemo(() => expenses.reduce((acc, t) => acc + t.amount, 0), [expenses]);
    const handlePrint = () => { window.print(); };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-6 rounded-2xl shadow-md no-print">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Relatório de Transações</h2>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-600 mb-1">Data de Início</label>
                        <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-600 mb-1">Data de Fim</label>
                        <input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg" />
                    </div>
                    <div className="self-end">
                        <button onClick={handlePrint} className="flex items-center space-x-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                            <Icon name="printer" size={18} /><span>Imprimir</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-8 printable">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-bold text-green-600 mb-4">Entradas</h3>
                        <ul className="space-y-2">
                            {incomes.map(t => (<li key={t.id} className="flex justify-between items-center border-b pb-2"><span>{t.description}</span><span className="font-semibold">{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></li>))}
                        </ul>
                        <div className="flex justify-between items-center mt-4 pt-2 border-t-2 font-bold"><span>Total de Entradas:</span><span>{totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-bold text-red-600 mb-4">Saídas</h3>
                        <ul className="space-y-2">
                            {expenses.map(t => (<li key={t.id} className="flex justify-between items-center border-b pb-2"><span>{t.description}</span><span className="font-semibold">{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></li>))}
                        </ul>
                        <div className="flex justify-between items-center mt-4 pt-2 border-t-2 font-bold"><span>Total de Saídas:</span><span>{totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Reports;
