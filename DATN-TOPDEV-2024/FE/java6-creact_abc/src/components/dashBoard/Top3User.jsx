import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    CircularProgress,
    TextField,
    Button,
    Tabs,
    Tab,
    Avatar,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import RevenueService from "../../services/RevenueService";
import DashService from "../../services/DashService";
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from 'react-data-table-component';

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
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    // Colors for pie charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

    const exportToExcel = async () => {
        try {
            const formattedData = orderDetails.map(({ orderId, userName, productName, productQuantity, productPrice, totalPricePerProduct }) => ({
                'Mã Đơn Hàng': orderId,
                'Tên Khách Hàng': userName,
                'Tên Sản Phẩm': productName,
                'Số Lượng': productQuantity,
                'Giá': productPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                'Tổng Giá': totalPricePerProduct.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
            }));

            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'ThongKe');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            const formData = new FormData();
            formData.append('file', new File([blob], 'ThongKe.xlsx'));

            await axios.post('http://localhost:8080/api/templates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Để tải vui lòng vào mục Drive Excel!',
            });
        } catch (error) {
            console.error('Lỗi khi lưu file:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể lưu file vào cơ sở dữ liệu!',
            });
        }
    };


    // Định nghĩa các cột cho DataTable
    const columnsOrderDetails = [
        { name: 'Mã ĐH', selector: row => row.orderId, sortable: true },
        { name: 'Khách Hàng', selector: row => row.userName, sortable: true },
        { name: 'Sản Phẩm', selector: row => row.productName, sortable: true },
        { name: 'SL', selector: row => row.productQuantity, sortable: true },
        { name: 'Giá', selector: row => row.productPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }), sortable: true },
        { name: 'Tổng', selector: row => row.totalPricePerProduct.toLocaleString("vi-VN", { style: "currency", currency: "VND" }), sortable: true },
    ];

    const columnsDailyRevenue = [
        { name: 'Ngày', selector: row => new Date(row.date).toLocaleDateString("vi-VN"), sortable: true },
        { name: 'Doanh Thu', selector: row => row.revenue.toLocaleString("vi-VN", { style: "currency", currency: "VND" }), sortable: true },
    ];

    const totalRevenue = filteredData.reduce((total, item) => total + item.revenue, 0);

    // Prepare data for pie charts
    const topCustomersData = topCustomers.map(customer => ({
        name: customer.fullName,
        value: customer.totalSpent
    }));

    const topProductsData = topSellingProducts.map(product => ({
        name: product.name,
        value: product.purchaseCount
    }));

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

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
                        {/* Increased height from 140px to 200px */}
                        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                        // Increased radius from 50 to 70
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                        // Added padding
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
                        {/* Increased height from 140px to 200px */}
                        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                        // Increased radius from 50 to 70
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                        // Added padding
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
        <div style={{ padding: "10px" }}>
            {/* Tab Navigation */}
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Tổng Quan" />
                <Tab label="Doanh Thu" />
            </Tabs>

            {/* Tab Content */}
            {/* Tab 0: Overview with Top Customers & Products */}
            {tabValue === 0 && (
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
            )}

            {/* Tab 1: Revenue Charts and Order Details Combined */}
            {tabValue === 1 && (
                <>
                    {/* Date Picker Row */}
                    <Box display="flex" gap={1} alignItems="center" marginBottom={2}>
                        <TextField
                            label="Từ Ngày"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            sx={{ width: "140px" }}
                        />
                        <TextField
                            label="Đến Ngày"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            sx={{ width: "140px" }}
                        />

                        {/* Total Revenue Summary */}
                        <Box sx={{ ml: 'auto', p: 1, borderRadius: "6px", bgcolor: "#e3f2fd", textAlign: "center", minWidth: "180px" }}>
                            <Typography variant="caption">Tổng Doanh Thu</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                {totalRevenue.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                            </Typography>
                        </Box>
                    </Box>

                    <Paper elevation={2} sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: "8px", mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Biểu Đồ Doanh Thu</Typography>
                            <Button size="small" variant="outlined">
                                Xuất Excel
                            </Button>
                        </Box>

                        <div style={{ overflowX: "auto", width: "100%" }}>
                            {/* Increased height from 220px to 300px */}
                            <ResponsiveContainer width="100%" height={300}>
                                {loadingRevenue ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                        <CircularProgress size={30} />
                                    </Box>
                                ) : filteredData.length > 0 ? (
                                    <BarChart
                                        data={filteredData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>  {/* Increased margins */}
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis
                                            tickFormatter={(value) => new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                                notation: "compact"
                                            }).format(value)}
                                            tick={{ fontSize: 10 }} />
                                        <Tooltip
                                            formatter={(value) => new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND"
                                            }).format(value)}
                                        />
                                        <Bar fill="#007bff" dataKey="revenue" name="Doanh Thu" barSize={20} />
                                    </BarChart>
                                ) : (
                                    <Typography color="textSecondary">Không có dữ liệu.</Typography>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: "8px", mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Doanh Thu Hàng Ngày</Typography>
                        <DataTable
                            columns={columnsDailyRevenue}
                            data={orders}
                            pagination
                            paginationPerPage={5}
                            paginationRowsPerPageOptions={[5, 10, 15]}
                            highlightOnHover
                            dense
                            noDataComponent="Chưa có dữ liệu doanh thu."
                        />
                    </Paper>

                    {/* Combined Order Details Section */}
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Chi Tiết Đơn Hàng</Typography>
                            <Box>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={exportToExcel}
                                    disabled={loadingOrderDetails || orderDetails.length === 0}
                                    sx={{ mr: 1 }}
                                >
                                    Xuất Excel
                                </Button>
                            </Box>
                        </Box>

                        {loadingOrderDetails && (
                            <Box display="flex" justifyContent="center" p={2}>
                                <CircularProgress size={30} />
                            </Box>
                        )}

                        {errorOrderDetails && <Typography color="error" variant="caption">{errorOrderDetails}</Typography>}

                        {orderDetails.length > 0 && (
                            <DataTable
                                columns={columnsOrderDetails}
                                data={orderDetails}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[5, 10, 15, 20]}
                                highlightOnHover
                                dense
                                noDataComponent="Không có dữ liệu chi tiết đơn hàng."
                            />
                        )}
                    </Paper>
                </>
            )}
        </div>
    );
};

export default Dashboard;