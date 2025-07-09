import React from 'react';
import Icon from '../ui/Icon';
import CategoryIcon from '../ui/CategoryIcon';

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
    const isIncome = transaction.type === 'income';
    const date = transaction.timestamp?.toDate ? transaction.timestamp.toDate().toLocaleDateString('pt-BR') : 'Data inválida';

    return (
        <li className="flex items-center justify-between p-4 bg-slate-50 rounded-xl transition-shadow hover:shadow-md">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                    <Icon name={isIncome ? 'arrowupcircle' : 'arrowdowncircle'} className={isIncome ? 'text-green-500' : 'text-red-500'} size={24} />
                    {isIncome ? <CategoryIcon category={transaction.incomeSource} /> : <CategoryIcon category={transaction.category} />}
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{transaction.description}</span>
                    <span className="text-xs text-gray-500">{isIncome ? `Fonte: ${transaction.incomeSource}` : `Categoria: ${transaction.category}`}</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <div className="text-right">
                    <span className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>{isIncome ? '+' : '-'} {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <p className="text-xs text-gray-400">{date}</p>
                </div>
                <button onClick={() => onEdit(transaction)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition disabled:opacity-50" disabled={!!transaction.linkedDebtId}>
                    <Icon name="pencil" size={18} />
                </button>
                <button onClick={() => onDelete(transaction.id, transaction)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                    <Icon name="trash2" size={18} />
                </button>
            </div>
        </li>
    );
};

export default TransactionItem;
