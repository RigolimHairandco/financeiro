import React from 'react';
import Icon from '../ui/Icon.jsx';
import CategoryIcon from '../ui/CategoryIcon.jsx';

const RecurringTransactionItem = ({ transaction, onLaunch, onEdit, onDelete, hasBeenLaunched }) => {
    const { type, description, amount, category, incomeSource } = transaction;
    const isIncome = type === 'income';

    return (
        <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${hasBeenLaunched ? 'bg-green-100' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-4">
                <CategoryIcon category={isIncome ? incomeSource : category} />
                <div>
                    <p className="font-bold text-gray-800">{description}</p>
                    <p className="text-sm text-gray-500">
                        {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {hasBeenLaunched ? (
                    <div className="flex items-center gap-2 text-green-600 font-semibold py-2 px-3 text-sm">
                        <Icon name="checkcircle" size={18} />
                        <span>Lançado</span>
                    </div>
                ) : (
                    <button 
                        onClick={() => onLaunch(transaction)} 
                        className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                        Lançar
                    </button>
                )}
                <button onClick={() => onEdit(transaction)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition">
                    <Icon name="pencil" size={18} />
                </button>
                <button onClick={() => onDelete(transaction.id, transaction)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                    <Icon name="trash2" size={18} />
                </button>
            </div>
        </div>
    );
};

export default RecurringTransactionItem;
