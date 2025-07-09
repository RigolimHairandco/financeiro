import React from 'react';

const AlertModal = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Aviso</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center">
                    <button onClick={onClose} className="py-2 px-8 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">OK</button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
