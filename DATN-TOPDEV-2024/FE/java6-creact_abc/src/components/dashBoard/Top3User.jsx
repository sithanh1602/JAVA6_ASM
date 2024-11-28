import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, Grid } from '@mui/material';
import DashService from "../../services/DashService";

const TopCustomersAndProductsChart = () => {
    const [topCustomers, setTopCustomers] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch top customers and top-selling products
        const fetchTopData = async () => {
            try {
                const customers = await DashService.getTopCustomers();
                const products = await DashService.getTopSellingProducts();

                setTopCustomers(customers.slice(0, 3));  // Only top 3 customers
                setTopSellingProducts(products.slice(0, 3));  // Only top 3 products
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);  // Stop loading regardless of success or failure
            }
        };

        fetchTopData();  // Fetch the data when the component mounts
    }, []);

    return (
        <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', marginBottom: 2 }}>
                Top 3 Khách Hàng & Sản Phẩm Bán Chạy
            </Typography>
            {loading ? (
                <Typography variant="body1" sx={{ color: '#555', textAlign: 'center' }}>Đang tải...</Typography>
            ) : topCustomers.length === 0 || topSellingProducts.length === 0 ? (
                <Typography variant="body1" sx={{ color: '#d32f2f', textAlign: 'center' }}>Không có dữ liệu để hiển thị.</Typography>
            ) : (
                <Grid container spacing={4}>
                    {/* Left side: Top Customers */}
                    <Grid item xs={12} md={6}>
                        {topCustomers.map((customer, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 2,
                                    borderBottom: '1px solid #eee',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#f0f0f0', // Light background color on hover
                                        transform: 'scale(1.05)', // Slight scale-up effect
                                        boxShadow: 3, // Add shadow on hover
                                    }
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        marginRight: 2,
                                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </Typography>
                                <Avatar
                                    src={customer.image}
                                    alt={customer.name}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        marginRight: 2,
                                        border: '3px solid #fff',
                                        boxShadow: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.1)', // Avatar scaling on hover
                                        }
                                    }}
                                />
                                <Typography variant="body1" sx={{ color: '#555', fontWeight: 'bold' }}>
                                    {customer.fullName} - {customer.totalSpent.toLocaleString()} VND
                                </Typography>
                            </Box>
                        ))}
                    </Grid>

                    {/* Right side: Top Selling Products */}
                    <Grid item xs={12} md={6}>
                        {topSellingProducts.map((product, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 2,
                                    borderBottom: '1px solid #eee',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#f0f0f0', // Light background color on hover
                                        transform: 'scale(1.05)', // Slight scale-up effect
                                        boxShadow: 3, // Add shadow on hover
                                    }
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        marginRight: 2,
                                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </Typography>
                                <Avatar
                                    src={product.imageUrl}
                                    alt={product.name}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        marginRight: 2,
                                        border: '3px solid #fff',
                                        boxShadow: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.1)', // Avatar scaling on hover
                                        }
                                    }}
                                />
                                <Typography variant="body1" sx={{ color: '#555', fontWeight: 'bold' }}>
                                    {product.name} - {product.purchaseCount} lượt mua
                                </Typography>
                            </Box>
                        ))}
                    </Grid>
                </Grid>
            )}
        </Paper>
    );
};

export default TopCustomersAndProductsChart;
