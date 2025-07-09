import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useWindowSize } from '../../hooks/useWindowSize.js';

const ExpensePieChart = ({ data }) => {
    const { width } = useWindowSize();
    const isMobile = width < 768; // md breakpoint de Tailwind

    const chartData = useMemo(() => {
        const categoryTotals = data.filter(t => t.type === 'expense').reduce((acc, t) => {
            const category = t.category || 'Sem Categoria';
            acc[category] = (acc[category] || 0) + t.amount;
            return acc;
        }, {});
        return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    }, [data]);

    if (chartData.length === 0) {
        return <div className="text-center text-gray-500 py-10 h-[300px] flex items-center justify-center">Sem dados de despesas para exibir no gráfico.</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19D4FF', '#FFD419', '#8884d8', '#82ca9d', '#d88488'];

    return (
        <ResponsiveContainer width="100%" height={isMobile ? 400 : 300}>
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx={isMobile ? "50%" : "40%"}
                    cy="50%"
                    innerRadius={isMobile ? 50 : 60}
                    outerRadius={isMobile ? 70 : 80}
                    fill="#8884d8"
                    paddingAngle={5}
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                <Legend
                    layout={isMobile ? 'horizontal' : 'vertical'}
                    verticalAlign={isMobile ? 'bottom' : 'middle'}
                    align={isMobile ? 'center' : 'right'}
                    wrapperStyle={isMobile ? { paddingTop: '20px' } : {}}
                    iconType="circle"
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ExpensePieChart;
