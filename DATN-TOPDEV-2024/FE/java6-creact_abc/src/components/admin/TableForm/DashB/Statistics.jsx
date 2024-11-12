import React from 'react';
import StatisticCard from './StatisticCard';

const Statistics = () => {
    const statsData = [
        { title: 'Total Visits', value: '10K', change: 10, color: 'text-green-500' },
        { title: 'Total Page Views', value: '8K', change: -7, color: 'text-red-500' },
        { title: 'Unique Visitor', value: '5K', change: -12, color: 'text-purple-500' },
    ];

    return (
        <div className="flex flex-wrap gap-4">
            {statsData.map((stat, index) => (
                <StatisticCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    change={stat.change}
                    color={stat.color}
                />
            ))}
        </div>
    );
};

export default Statistics;
