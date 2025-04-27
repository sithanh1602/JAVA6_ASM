// Dashboard.js - Main Container Component
import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import TopProductsChart from "./dashProductUser/TopProductsChart";
import RevenueService from "../../services/RevenueService";
import DashService from "../../services/DashService";
import TodayOrdersCard from "./TodayOrdersCard";
import OrderDashDay from "./dashOrder/orderDashDay";
import RevenueCharts from "./dashOrder/RevenueCharts";
import TotalCompletedRevenue from "./dashOrder/TotalCompletedRevenue";
import TopCustomersChart from "./dashProductUser/TopCustomersChart";

const Dashboard = () => {
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    oneYearAgo.setDate(1);

    // Date format function
    const formatDate = (date) => date.toISOString().slice(0, 10);

    // State management
    const [startDate, setStartDate] = useState(formatDate(oneYearAgo));
    const [endDate, setEndDate] = useState(formatDate(currentDate));
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loadingRevenue, setLoadingRevenue] = useState(true);
    const [loadingTopData, setLoadingTopData] = useState(true);
    const [topCustomers, setTopCustomers] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
    const [error, setError] = useState(null);
    const [errorOrderDetails, setErrorOrderDetails] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchMonthlyRevenue();
        fetchTopData();
    }, [startDate, endDate]);

    const fetchMonthlyRevenue = async () => {
        setLoadingRevenue(true);
        setError(null);
        try {
            const response = await RevenueService.getDailyRevenue(startDate, endDate);
            const dailyRevenue = response.data;
            const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
                date: new Date(date),
                revenue,
            }));

            // Aggregating data for monthly charts
            const aggregatedData = [];
            chartData.forEach(item => {
                const monthYear = `${item.date.getMonth() + 1}-${item.date.getFullYear()}`;
                const existingItem = aggregatedData.find(i => i.date === monthYear);
                if (existingItem) {
                    existingItem.revenue += item.revenue;
                } else {
                    aggregatedData.push({
                        date: monthYear,
                        revenue: item.revenue,
                    });
                }
            });

            setData(aggregatedData);
            setFilteredData(aggregatedData);
        } catch (error) {
            console.error("Error loading revenue data:", error);
            setError("Unable to load revenue data.");
        } finally {
            setLoadingRevenue(false);
        }
    };

    const fetchTopData = async () => {
        setLoadingTopData(true);
        setError(null);
        try {
            const customers = await DashService.getTopCustomers();
            const products = await DashService.getTopSellingProducts();
            setTopCustomers(customers.slice(0, 3));
            setTopSellingProducts(products.slice(0, 3));
        } catch (error) {
            console.error("Error fetching top customers/products:", error);
            setError("Unable to load customer or product data.");
        } finally {
            setLoadingTopData(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <div style={{ padding: "10px" }}>
            {/* Tab Navigation */}
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Tổng Quan" />
                <Tab label="Thống kê sản phẩm" />
            </Tabs>

            {/* Tab Content */}
            {tabValue === 0 && (
                <>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className="flex-1 min-w-[300px]">
                            <TodayOrdersCard />
                        </div>
                        <div className="flex-1 min-w-[300px]">
                            <TotalCompletedRevenue />
                        </div>
                    </div>
                    <div>
                        <RevenueCharts />
                    </div>
                </>
            )}



            {/* Tab Content */}
            {tabValue === 1 && (
                <div className="flex flex-row justify-between items-center gap-4 w-full">
                    <div className="flex-1">
                        <TopProductsChart />
                    </div>
                    <div className="flex-1">
                        <TopCustomersChart />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;