import React from 'react';
import Statistics from "./Statistics";
import MonthlyStats from "./MonthlyStats";
import TodoList from "./TodoList";

const Dashboard = () => {
    return (
        <div className="p-6">
            <Statistics />
            <TodoList/>
        </div>
    );
};

export default Dashboard;
