import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';

const DebtForm = ({ onSave }) => {
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState('');

    const resetForm = () => {
        setDescription('');
        setTotalAmount('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !totalAmount || parseFloat(totalAmount) <= 0) return;
        await onSave({
            description: description.toUpperCase(),
            totalAmount: parseFloat(totalAmount),
            paidAmount: 0,
            status: 'active',
            createdAt: Timestamp.now()
        });
        resetForm();
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ADICIONAR NOVA DÍVIDA</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="debt-description" className="block text-sm font-medium text-gray-600 mb-1">Descrição da Dívida</label>
                    <input
                        id="debt-description"
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg uppercase"
                        placeholder="EX: FINANCIAMENTO DO CARRO"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="debt-total" className="block text-sm font-medium text-gray-600 mb-1">Valor Total (R$)</label>
                    <input
                        id="debt-total"
                        type="number"
                        step="0.01"
                        value={totalAmount}
                        onChange={e => setTotalAmount(e.target.value)}
                        placeholder="25000,00"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        required
                    />
                </div>
                <button type="submit" className="w-full py-3 px-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700">Adicionar Dívida</button>
            </form>
        </div>
    );
};

export default DebtForm;
