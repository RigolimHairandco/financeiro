import React from 'react';
import CategoryIcon from '../ui/CategoryIcon.jsx';

const BudgetProgress = ({ budget, currentSpending }) => {
    const { categoryName, amount: budgetAmount } = budget;
    const spent = currentSpending || 0;
    const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
    const remaining = budgetAmount - spent;

    const getProgressBarColor = (percentage) => {
        if (percentage > 100) return 'bg-red-600';
        if (percentage > 80) return 'bg-yellow-500';
        return 'bg-blue-600';
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <CategoryIcon category={categoryName} />
                    <span className="font-bold text-gray-800">{categoryName}</span>
                </div>
                <span className={`font-semibold ${progress > 100 ? 'text-red-600' : 'text-gray-600'}`}>
                    {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor(progress)}`} 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
            </div>
            <div className="text-right text-sm text-gray-500">
                Orçamento: {budgetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
        </div>
    );
};

export default BudgetProgress;
