import React from 'react';
import { FaChartBar } from 'react-icons/fa';

const StatisticCard = ({ title, value, change, color }) => {
    return (
        <div className="bg-white shadow-md rounded-md p-4 w-full md:w-1/4 flex flex-col items-center">
            <FaChartBar className={`text-2xl ${color} mb-2`} />
            <h3 className="text-gray-600 text-lg font-semibold">{title}</h3>
            <p className="text-2xl font-bold mt-2">{value}</p>
            <span className={`text-sm font-semibold mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? `+${change}%` : `${change}%`}
            </span>
        </div>
    );
};

export default StatisticCard;
