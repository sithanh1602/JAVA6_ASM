// Dashboard.js - Main Container Component
import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import OverviewTab from './OverviewTab';
import RevenueTab from './RevenueTab';
import RevenueService from "../../services/RevenueService";
import DashService from "../../services/DashService";
import TodayOrdersCard from "./TodayOrdersCard";

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
        fetchOrders();
        fetchOrderDetails();
    }, [startDate, endDate]);

    // Fetch data functions
    const fetchOrderDetails = async () => {
        setLoadingOrderDetails(true);
        setErrorOrderDetails(null);
        try {
            const response = await RevenueService.getOrderDetails(startDate, endDate);
            const transformedOrderDetails = response.data.map(order => ({
                orderId: order[0],
                userName: order[1],
                productName: order[2],
                productQuantity: order[3],
                productPrice: order[4],
                totalPricePerProduct: order[5],
            }));
            setOrderDetails(transformedOrderDetails);
        } catch (error) {
            console.error("Error fetching order details:", error);
            setErrorOrderDetails("Unable to fetch order details.");
        } finally {
            setLoadingOrderDetails(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await RevenueService.getDailyRevenue(startDate, endDate);
            const dailyRevenue = response.data;
            const groupedOrders = Object.entries(dailyRevenue).reduce((acc, [fullDate, revenue]) => {
                const date = new Date(fullDate).toISOString().slice(0, 10);
                acc[date] = (acc[date] || 0) + revenue;
                return acc;
            }, {});
            const orders = Object.entries(groupedOrders).map(([date, revenue]) => ({ date, revenue }));
            setOrders(orders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

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
                <Tab label="Top3" />
                <Tab label="Doanh Thu" />
                <Tab label="Doanh Thu theo sản phẩm" />
            </Tabs>

            {/* Tab Content */}
            {tabValue === 0 && (
                <TodayOrdersCard>

                </TodayOrdersCard>
            )}

            {/* Tab Content */}
            {tabValue === 1 && (
                <OverviewTab
                    topCustomers={topCustomers}
                    topSellingProducts={topSellingProducts}
                    loadingTopData={loadingTopData}
                    error={error}
                />
            )}

            {tabValue === 2 && (
                <RevenueTab
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    filteredData={filteredData}
                    loadingRevenue={loadingRevenue}
                    orders={orders}
                    orderDetails={orderDetails}
                    loadingOrderDetails={loadingOrderDetails}
                    errorOrderDetails={errorOrderDetails}
                />
            )}
        </div>
    );
};

export default Dashboard;