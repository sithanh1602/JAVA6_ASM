import React from 'react';

const MonthlyStats = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-2/3">
            <h2 className="text-lg font-semibold mb-4">Monthly Stats</h2>
            <img
                src="https://placehold.co/600x300?text=Graph+Image"
                alt="Graph showing monthly stats"
                className="w-full mb-4"
            />
            <div className="flex justify-between text-sm">
                <span className="text-green-500">10% <i className="fas fa-arrow-up"></i> APPL</span>
                <span className="text-red-500">2% <i className="fas fa-arrow-down"></i> Average</span>
                <span className="text-green-500">15% <i className="fas fa-arrow-up"></i> Sales</span>
                <span className="text-red-500">8% <i className="fas fa-arrow-down"></i> Profit</span>
            </div>
        </div>
    );
};

export default MonthlyStats;
