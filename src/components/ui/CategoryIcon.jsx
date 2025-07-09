import React from 'react';
import Icon from './Icon';

const CategoryIcon = ({ category = '' }) => {
    const catLower = category.toLowerCase();
    if (catLower.includes('combustível')) return <Icon name="fuel" size={20} className="text-gray-500" />;
    if (catLower.includes('manutenção')) return <Icon name="wrench" size={20} className="text-gray-500" />;
    if (catLower.includes('alimentação')) return <Icon name="utensils" size={20} className="text-gray-500" />;
    if (catLower.includes('moradia')) return <Icon name="home" size={20} className="text-gray-500" />;
    if (catLower.includes('saúde')) return <Icon name="heart" size={20} className="text-gray-500" />;
    if (catLower.includes('lazer')) return <Icon name="gift" size={20} className="text-gray-500" />;
    if (catLower.includes('educação')) return <Icon name="bookopen" size={20} className="text-gray-500" />;
    if (catLower.includes('vestuário')) return <Icon name="shoppingbag" size={20} className="text-gray-500" />;
    if (catLower.includes('conta')) return <Icon name="filetext" size={20} className="text-gray-500" />;
    if (catLower.includes('dívida')) return <Icon name="landmark" size={20} className="text-gray-500" />;
    if (catLower.includes('salário')) return <Icon name="briefcase" size={20} className="text-gray-500" />;
    if (catLower.includes('freelance')) return <Icon name="pentool" size={20} className="text-gray-500" />;
    if (catLower.includes('fotografia')) return <Icon name="camera" size={20} className="text-gray-500" />;
    if (catLower.includes('investimento')) return <Icon name="trendingup" size={20} className="text-gray-500" />;
    if (catLower.includes('venda')) return <Icon name="tag" size={20} className="text-gray-500" />;
    if (catLower.includes('poupança')) return <Icon name="piggy-bank" size={20} className="text-gray-500" />;
    
    return <Icon name="morehorizontal" size={20} className="text-gray-500" />;
};

export default CategoryIcon;
