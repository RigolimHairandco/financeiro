import React from 'react';
import Icon from '../ui/Icon.jsx';

const GoalItem = ({ goal, onContribute, onDelete }) => {
    const { name, targetAmount, currentAmount, targetDate } = goal;
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const remaining = targetAmount - currentAmount;
    const date = targetDate?.toDate ? targetDate.toDate().toLocaleDateString('pt-BR') : 'Data inválida';

    return (
        <li className="bg-slate-50 p-4 rounded-xl mb-3 transition-shadow hover:shadow-lg">
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Icon name="flag" className="text-amber-600" /> {name}
                </span>
                <span className="text-sm text-gray-500">
                    Até {date}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-1 relative">
                <div className="bg-amber-500 h-4 rounded-full flex items-center justify-center" style={{ width: `${Math.min(progress, 100)}%` }}>
                    <span className="text-xs font-bold text-white px-2">{progress.toFixed(0)}%</span>
                </div>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">
                    {currentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={() => onContribute(goal)} className="py-1 px-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 text-xs">Contribuir</button>
                    <button onClick={() => onDelete(goal.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                        <Icon name="trash2" size={16} />
                    </button>
                </div>
            </div>
        </li>
    );
};

export default GoalItem;
