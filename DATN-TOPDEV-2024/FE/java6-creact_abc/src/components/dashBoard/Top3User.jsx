import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Avatar,
    Box,
    Grid,
    CircularProgress,
    TextField,
    Button,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    const [view, setView] = useState("revenue"); // State to manage the view

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
            // Chuyển đổi mảng lấy được từ server thành mảng đối tượng
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
            // Chuyển đổi danh sách đối tượng sang định dạng mà Excel có thể hiểu
            const formattedData = orderDetails.map(({ orderId, userName, productName, productQuantity, productPrice, totalPricePerProduct }) => ({
                'Mã Đơn Hàng': orderId,
                'Tên Khách Hàng': userName,
                'Tên Sản Phẩm': productName,
                'Số Lượng': productQuantity,
                'Giá': productPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                'Tổng Giá': totalPricePerProduct.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
            }));

            // Tạo worksheet từ dữ liệu đã định dạng
            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'ThongKe');

            // Chuyển workbook thành buffer
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            // Tạo Blob
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

            // Tạo FormData để gửi file
            const formData = new FormData();
            formData.append('file', new File([blob], 'ThongKe.xlsx'));

            // Gửi file lên backend qua API
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
    const exportToExceldt = async () => {
        try {
            // Tạo worksheet từ dữ liệu bảng
            const worksheet = XLSX.utils.json_to_sheet(orders);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'ThongKe_dt');

            // Chuyển workbook thành buffer
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            // Chuyển buffer thành Blob
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

            // Tạo FormData để gửi file
            const formData = new FormData();
            formData.append('file', new File([blob], 'ThongKe_dt.xlsx'));

            // Gửi file lên backend qua API
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
        { name: 'Mã Đơn Hàng', selector: (row) => row.orderId, sortable: true },
        { name: 'Tên Khách Hàng', selector: (row) => row.userName, sortable: true },
        { name: 'Tên Sản Phẩm', selector: (row) => row.productName, sortable: true },
        { name: 'Số Lượng', selector: (row) => row.productQuantity, sortable: true },
        { name: 'Giá', selector: (row) => row.productPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }), sortable: true },
        { name: 'Tổng Giá', selector: (row) => row.totalPricePerProduct.toLocaleString("vi-VN", { style: "currency", currency: "VND" }), sortable: true },
    ];

    const columnsDailyRevenue = [
        { name: 'Ngày', selector: (row) => new Date(row.date).toLocaleDateString("vi-VN"), sortable: true },
        { name: 'Doanh Thu', selector: (row) => row.revenue.toLocaleString("vi-VN", { style: "currency", currency: "VND" }), sortable: true },
    ];

    const totalRevenue = filteredData.reduce((total, item) => total + item.revenue, 0);

    return (
        <div style={{ padding: "20px" }}>
            {/* Top Customers and Products Section */}
            <Paper elevation={3} sx={{ padding: 2, backgroundColor: "#f9f9f9", borderRadius: "10px", marginBottom: 3 }}>
                <Typography variant="h5" gutterBottom>Top 3 Khách Hàng & Sản Phẩm Bán Chạy Nhất</Typography>
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
                                <Box key={index} sx={{ display: "flex", alignItems: "center", padding: 2, borderBottom: "1px solid #eee" }}>
                                    <Typography variant="h5" sx={{ marginRight: 2, fontSize: "1.5rem" }}>
                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                    </Typography>
                                    <Avatar src={customer.image} alt={customer.name} sx={{ width: 80, height: 80, marginRight: 2 }} />
                                    <Typography variant="body1" sx={{ color: "#555", fontWeight: "bold" }}>
                                        {customer.fullName} - {customer.totalSpent.toLocaleString()} VND
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {topSellingProducts.map((product, index) => (
                                <Box key={index} sx={{ display: "flex", alignItems: "center", padding: 2, borderBottom: "1px solid #eee" }}>
                                    <Typography variant="h5" sx={{ marginRight: 2, fontSize: "1.5rem" }}>
                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                    </Typography>
                                    <Avatar src={product.imageUrl} alt={product.name} sx={{ width: 80, height: 80, marginRight: 2 }} />
                                    <Typography variant="body1" sx={{ color: "#555", fontWeight: "bold" }}>
                                        {product.name} - {product.purchaseCount} lượt mua
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                    </Grid>
                )}
            </Paper>

            {/* Date Picker and View Toggle Buttons */}
            <Box display="flex" gap={1} alignItems="center" marginBottom={2}>
                <TextField
                    label="Ngày Bắt Đầu"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    variant="outlined"
                    sx={{ width: "160px" }} // Adjusted width for compactness
                />
                <TextField
                    label="Ngày Kết Thúc"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    variant="outlined"
                    sx={{ width: "160px" }} // Adjusted width for compactness
                />
                <Button variant="contained" color="primary" onClick={() => setView("revenue")} sx={{ flexShrink: 0 }}>
                    Xem Doanh Thu
                </Button>
                <Button variant="contained" color="secondary" onClick={() => setView("details")} sx={{ flexShrink: 0 }}>
                    Xem Chi Tiết
                </Button>
            </Box>

            {/* Revenue Chart Section */}
            {view === "revenue" && (
                <Paper elevation={3} sx={{ padding: 3, backgroundColor: "#f9f9f9", borderRadius: "10px" }}>
                    <Typography variant="h6" gutterBottom>Biểu Đồ Doanh Thu</Typography>
                    <Box sx={{ color: "#007bff", padding: 2, borderRadius: "8px", textAlign: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>Tổng Doanh Thu</Typography>
                        <Typography variant="h4" sx={{ fontWeight: "bold", marginTop: 1, fontSize: "1.8rem" }}>
                            {totalRevenue.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </Typography>
                    </Box>

                    <div style={{ overflowX: "auto", width: "100%" }}>
                        <ResponsiveContainer width="100%" height={300}>
                            {loadingRevenue ? (
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <CircularProgress />
                                </Box>
                            ) : filteredData.length > 0 ? (
                                <BarChart
                                    data={filteredData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 14, fill: "#333" }} />
                                    <YAxis
                                        tickFormatter={(value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)}
                                        tick={{ fontSize: 14, fill: "#333" }} />
                                    <Tooltip formatter={(value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)} />
                                    <Legend verticalAlign="top" height={36} />
                                    <Bar fill="#007bff" dataKey="revenue" name="Doanh Thu" barSize={30} />
                                </BarChart>
                            ) : (
                                <Typography color="textSecondary">Không có dữ liệu.</Typography>
                            )}
                        </ResponsiveContainer>
                    </div>
                </Paper>
            )}

            {/* Daily Revenue Section */}
            {view === "revenue" && (
                <Paper elevation={3} sx={{ padding: 3, backgroundColor: "#f9f9f9", borderRadius: "10px", marginTop: 3 }}>
                    <Typography variant="h6" gutterBottom>Doanh Thu Hàng Ngày</Typography>
                    <Button
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        onClick={exportToExceldt}
                        style={{ marginBottom: '16px' }}
                    >
                        Xuất Excel
                    </Button>
                    <DataTable
                        columns={columnsDailyRevenue}
                        data={orders}
                        pagination
                        highlightOnHover
                        responsive
                        noDataComponent="Chưa có dữ liệu doanh thu."
                    />
                </Paper>
            )}

            {/* Order Details Section */}
            {view === "details" && (
                <Paper elevation={3} sx={{ padding: 3, backgroundColor: "#f9f9f9", borderRadius: "10px", marginTop: 3 }}>
                    <Typography variant="h6" gutterBottom>Chi Tiết Đơn Hàng</Typography>
                    {loadingOrderDetails && <CircularProgress />}
                    {errorOrderDetails && <Typography color="error">{errorOrderDetails}</Typography>}
                    {orderDetails.length > 0 && (
                        <>
                            <Button
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                onClick={exportToExcel}
                                style={{ marginBottom: '16px' }}
                            >
                                Xuất Excel
                            </Button>
                            <DataTable
                                columns={columnsOrderDetails}
                                data={orderDetails}
                                pagination
                                highlightOnHover
                                responsive
                                noDataComponent="Không có dữ liệu chi tiết đơn hàng."
                            />
                        </>
                    )}
                </Paper>
            )}
        </div>
    );
};

export default Dashboard;