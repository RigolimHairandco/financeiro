import React, { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, onConfirm, debt }) => {
    const [amount, setAmount] = useState('');
    useEffect(() => {
        if (isOpen) {
            setAmount('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const remaining = debt.totalAmount - debt.paidAmount;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-bold mb-2">Registar Pagamento</h3>
                <p className="text-sm text-gray-600 mb-4">Dívida: <span className="font-semibold">{debt.description}</span></p>
                <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-600 mb-1">Valor do Pagamento</label>
                <input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder={`Restante: ${remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    required
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button
                        onClick={() => onConfirm(parseFloat(amount))}
                        disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > remaining}
                        className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
