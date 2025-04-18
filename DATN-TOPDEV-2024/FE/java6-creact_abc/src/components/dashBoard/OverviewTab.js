// OverviewTab.js
import React from 'react';
import {
    Typography,
    Box,
    Grid,
    CircularProgress,
    Avatar,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';

const OverviewTab = ({ topCustomers, topSellingProducts, loadingTopData, error }) => {
    // Colors for pie charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Prepare data for pie charts
    const topCustomersData = topCustomers.map(customer => ({
        name: customer.fullName,
        value: customer.totalSpent
    }));

    const topProductsData = topSellingProducts.map(product => ({
        name: product.name,
        value: product.purchaseCount
    }));

    // Custom card for top customers
    const TopCustomersCard = ({ title, data, loading, error, pieData }) => (
        <Card elevation={2} sx={{ height: '100%', backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{title}</Typography>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <CircularProgress size={30} />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <Box>
                        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={2}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => value.toLocaleString("vi-VN") + " VND"} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ mt: 1 }}>
                            {data.map((item, index) => (
                                <Box key={index} sx={{ display: "flex", alignItems: "center", p: 0.5 }}>
                                    <Box
                                        sx={{
                                            width: '10px',
                                            height: '10px',
                                            backgroundColor: COLORS[index % COLORS.length],
                                            mr: 1,
                                            borderRadius: '2px'
                                        }}
                                    />
                                    <Avatar
                                        src={item.image || `/api/placeholder/30/30`}
                                        alt={item.fullName}
                                        sx={{ width: 20, height: 20, mr: 1 }}
                                    />
                                    <Typography variant="caption" noWrap>
                                        {item.fullName}: {item.totalSpent.toLocaleString()} VND
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    // Custom card for top products with images
    const TopProductsCard = ({ title, data, loading, error, pieData }) => (
        <Card elevation={2} sx={{ height: '100%', backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{title}</Typography>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <CircularProgress size={30} />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <Box>
                        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={2}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => value + " lượt mua"} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ mt: 1 }}>
                            {data.map((product, index) => (
                                <Box key={index} sx={{ display: "flex", alignItems: "center", p: 0.5 }}>
                                    <Box
                                        sx={{
                                            width: '10px',
                                            height: '10px',
                                            backgroundColor: COLORS[index % COLORS.length],
                                            mr: 1,
                                            borderRadius: '2px'
                                        }}
                                    />
                                    <Avatar
                                        src={product.imageUrl || `/api/placeholder/30/30`}
                                        alt={product.name}
                                        variant="rounded"
                                        sx={{ width: 25, height: 25, mr: 1 }}
                                    />
                                    <Typography variant="caption" noWrap>
                                        {product.name}: {product.purchaseCount} lượt mua
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Grid container spacing={2}>
            {/* Top Customers Card */}
            <Grid item xs={12} md={6}>
                <TopCustomersCard
                    title="Top 3 Khách Hàng"
                    data={topCustomers}
                    loading={loadingTopData}
                    error={error}
                    pieData={topCustomersData}
                />
            </Grid>

            {/* Top Products Card */}
            <Grid item xs={12} md={6}>
                <TopProductsCard
                    title="Top 3 Sản Phẩm"
                    data={topSellingProducts}
                    loading={loadingTopData}
                    error={error}
                    pieData={topProductsData}
                />
            </Grid>
        </Grid>
    );
};

export default OverviewTab;