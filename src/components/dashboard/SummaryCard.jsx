import React from 'react';
import Icon from '../ui/Icon';

const SummaryCard = ({ title, value, iconName, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
        <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon name={iconName} size={24} className="currentColor" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
    </div>
);

export default SummaryCard;
