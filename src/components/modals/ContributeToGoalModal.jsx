import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon.jsx';

const ContributeToGoalModal = ({ isOpen, onClose, onConfirm, goal }) => {
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Contribuir para Meta</h3>
                    <button onClick={onClose} className="p-1">
                        <Icon name="x" className="text-gray-500 hover:text-gray-800" />
                    </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Meta: <span className="font-semibold">{goal.name}</span></p>
                <label htmlFor="contribution-amount" className="block text-sm font-medium text-gray-600 mb-1">Valor da Contribuição (R$)</label>
                <input
                    id="contribution-amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="100,00"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    required
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button
                        onClick={() => onConfirm(goal, parseFloat(amount))}
                        disabled={!amount || parseFloat(amount) <= 0}
                        className="py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400"
                    >
                        Confirmar Contribuição
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContributeToGoalModal;
