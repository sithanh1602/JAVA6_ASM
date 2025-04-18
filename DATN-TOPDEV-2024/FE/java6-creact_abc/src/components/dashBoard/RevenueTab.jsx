// RevenueTab.js
import React from 'react';
import {
    Typography,
    Box,
    Grid,
    CircularProgress,
    TextField,
    Button,
    Paper
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import DataTable from 'react-data-table-component';
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";

const RevenueTab = ({
                        startDate,
                        endDate,
                        setStartDate,
                        setEndDate,
                        filteredData,
                        loadingRevenue,
                        orders,
                        orderDetails,
                        loadingOrderDetails,
                        errorOrderDetails
                    }) => {
    // Calculate total revenue
    const totalRevenue = filteredData.reduce((total, item) => total + item.revenue, 0);

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

    return (
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
    );
};

export default RevenueTab;