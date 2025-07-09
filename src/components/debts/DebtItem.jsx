import React from 'react';
import Icon from '../ui/Icon';

const DebtItem = ({ debt, onPay, onDelete }) => {
    const { description, totalAmount, paidAmount } = debt;
    const progress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
    const remaining = totalAmount - paidAmount;

    return (
        <li className="bg-slate-50 p-4 rounded-xl mb-3">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{description}</span>
                <span className="text-sm font-mono text-gray-600">
                    {paidAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                    Restante: {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <div>
                    <button onClick={() => onPay(debt)} className="py-1 px-3 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 mr-2">Pagar</button>
                    <button onClick={() => onDelete(debt.id, debt)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                        <Icon name="trash2" size={16} />
                    </button>
                </div>
            </div>
        </li>
    );
};

export default DebtItem;
