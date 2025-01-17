import React from 'react';
import Statistics from "./Statistics";
import MonthlyStats from "./MonthlyStats";
import TodoList from "./TodoList";
import RevenueChart from "./RevenueChart";

const Dashboard = () => {
    return (
        <div className="">
            <Statistics />
            <TodoList/>
            <RevenueChart/>
        </div>
    );
};

export default Dashboard;
