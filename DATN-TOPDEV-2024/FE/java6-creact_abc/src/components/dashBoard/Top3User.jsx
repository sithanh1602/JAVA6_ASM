import React, { useState, useEffect } from 'react';
import { Avatar, Box, Typography, Paper, Grid, CircularProgress, TextField } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RevenueService from "../../services/RevenueService";
import DashService from "../../services/DashService";
const Dashboard = () => {
    // Lấy ngày hiện tại và 12 tháng trước
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    oneYearAgo.setDate(1); // Ngày đầu tiên của tháng

    // Định dạng ngày theo yyyy-MM-dd
    const formatDate = (date) => date.toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState(formatDate(oneYearAgo));
    const [endDate, setEndDate] = useState(formatDate(currentDate));
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loadingRevenue, setLoadingRevenue] = useState(true);
    const [loadingTopData, setLoadingTopData] = useState(true);
    const [topCustomers, setTopCustomers] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [error, setError] = useState(null);

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
            console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
            setError("Không thể tải dữ liệu doanh thu.");
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
            console.error("Lỗi khi lấy dữ liệu khách hàng và sản phẩm:", error);
            setError("Không thể tải dữ liệu khách hàng hoặc sản phẩm.");
        } finally {
            setLoadingTopData(false);
        }
    };

    const totalRevenue = filteredData.reduce((total, item) => total + item.revenue, 0);

    return (
        <div>
            {/* Top Customers and Products */}
            <Paper
                elevation={3}
                sx={{
                    padding: 2,
                    backgroundColor: "#f9f9f9",
                    borderRadius: "10px",
                    marginBottom: 3,
                }}
            >
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: 2,
                    }}
                >
                    Top 3 Khách Hàng & Sản Phẩm Bán Chạy
                </Typography>
                {loadingTopData ? (
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            {topCustomers.map((customer, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: 2,
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        sx={{ marginRight: 2, fontSize: "1.5rem" }}
                                    >
                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                    </Typography>
                                    <Avatar
                                        src={customer.image}
                                        alt={customer.name}
                                        sx={{ width: 80, height: 80, marginRight: 2 }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: "#555",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {customer.fullName} -{" "}
                                        {customer.totalSpent.toLocaleString()} VND
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {topSellingProducts.map((product, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: 2,
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        sx={{ marginRight: 2, fontSize: "1.5rem" }}
                                    >
                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                    </Typography>
                                    <Avatar
                                        src={product.imageUrl}
                                        alt={product.name}
                                        sx={{ width: 80, height: 80, marginRight: 2 }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: "#555",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {product.name} - {product.purchaseCount} lượt mua
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                    </Grid>
                )}
            </Paper>

            {/* Tổng doanh thu */}
            {/* Revenue Chart */}
            <Paper
                elevation={3}
                sx={{
                    padding: 3,
                    backgroundColor: "#f9f9f9",
                    borderRadius: "10px",
                }}
            >
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: 2,
                    }}
                >
                    Biểu Đồ Doanh Thu
                </Typography>
                <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 1 }}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Ngày bắt đầu"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Ngày kết thúc"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box
                            sx={{
                                color: "#007bff",
                                padding: 2,
                                borderRadius: "8px",
                                textAlign: "center",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold" }}
                            >
                                Tổng Doanh Thu
                            </Typography>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: "bold",
                                    marginTop: 1,
                                    fontSize: "1.8rem",
                                }}
                            >
                                {totalRevenue.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </Typography>
                        </Box>
                    </Grid>


                </Grid>

                <div style={{ overflowX: "auto", width: "100%" }}>
                    <div style={{ minWidth: `${filteredData.length * 70}px` }}>
                        <ResponsiveContainer width="100%" height={500}>
                            {loadingRevenue ? (
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <CircularProgress />
                                </Box>
                            ) : filteredData.length > 0 ? (
                                <BarChart
                                    data={filteredData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 50,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 15, fill: "#333" }}
                                        textAnchor="middle"
                                        height={50}
                                        angle={0}
                                        interval={0}
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(value)
                                        }
                                        tick={{ fontSize: 15, fill: "#333" }}
                                        width={100}
                                    />
                                    <Tooltip
                                        formatter={(value) =>
                                            new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(value)
                                        }
                                        labelStyle={{ fontWeight: "bold", color: "#555" }}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Bar

                                        fill="#007bff"
                                        radius={[8, 8, 0, 0]}
                                        barSize={70}
                                        dataKey="revenue"
                                        name="Doanh thu"
                                    />
                                </BarChart>
                            ) : (
                                <Typography color="textSecondary">Không có dữ liệu.</Typography>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </Paper>
        </div>
    );
};

export default Dashboard;
