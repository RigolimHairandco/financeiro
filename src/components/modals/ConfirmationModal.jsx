import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={onConfirm} className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
