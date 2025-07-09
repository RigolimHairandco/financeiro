import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';

const GoalForm = ({ onSave }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !targetAmount || parseFloat(targetAmount) <= 0 || !targetDate) {
            alert('Por favor, preencha todos os campos da meta.');
            return;
        }
        onSave({
            name: name.toUpperCase(),
            targetAmount: parseFloat(targetAmount),
            currentAmount: 0,
            createdAt: Timestamp.now(),
            targetDate: Timestamp.fromDate(new Date(targetDate + 'T00:00:00'))
        });
        setName('');
        setTargetAmount('');
        setTargetDate('');
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Criar Nova Meta de Poupança</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="goal-name" className="block text-sm font-medium text-gray-600 mb-1">Nome da Meta</label>
                    <input id="goal-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg uppercase" placeholder="EX: VIAGEM DE FÉRIAS" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="goal-target-amount" className="block text-sm font-medium text-gray-600 mb-1">Valor Alvo (R$)</label>
                        <input id="goal-target-amount" type="number" step="0.01" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="5000,00" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="goal-target-date" className="block text-sm font-medium text-gray-600 mb-1">Data Alvo</label>
                        <input id="goal-target-date" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                    </div>
                </div>
                <button type="submit" className="w-full py-3 px-4 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700">Adicionar Meta</button>
            </form>
        </div>
    );
};

export default GoalForm; // <-- ADICIONE ESTA LINHA
