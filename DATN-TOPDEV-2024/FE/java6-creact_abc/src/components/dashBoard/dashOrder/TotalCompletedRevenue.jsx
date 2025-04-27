import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSyncAlt, FaFileInvoice, FaTimes } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import DetailOrderComponent from "./DetailOrderComponent";
import moment from 'moment';

const TotalCompletedRevenueCard = () => {
    const [revenue, setRevenue] = useState(null);
    const [orders, setOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const fetchRevenue = () => {
        axios.get('http://localhost:8080/api/dash/revenue/completed')
            .then(res => setRevenue(res.data))
            .catch(err => console.error("Lỗi lấy doanh thu:", err));
    };

    const fetchFilteredData = () => {
        if (!fromDate || !toDate) return alert("Vui lòng chọn cả hai ngày");

        const from = moment(fromDate).startOf('day').toISOString();
        const to = moment(toDate).endOf('day').toISOString();

        setIsLoadingOrders(true);
        axios.get('http://localhost:8080/api/dash/orders/status8-range', {
            params: { fromDate: from, toDate: to }
        })
            .then(res => {
                const sorted = res.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                setOrders(sorted);
                const total = sorted.reduce((sum, order) => sum + order.totalPrice, 0);
                setRevenue(total);
            })
            .catch(err => console.error("Lỗi lọc đơn hàng theo khoảng thời gian:", err))
            .finally(() => setIsLoadingOrders(false));
    };

    const openOrdersModal = () => {
        setIsLoadingOrders(true);
        axios.get('http://localhost:8080/api/dash/orders/status8')
            .then(res => {
                const sorted = res.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                setOrders(sorted);
                setShowModal(true);
            })
            .catch(err => console.error("Lỗi lấy đơn hàng hoàn tất:", err))
            .finally(() => setIsLoadingOrders(false));
    };

    const closeModal = () => setShowModal(false);

    useEffect(() => {
        fetchRevenue();
    }, []);

    const columns = [
        {
            name: 'Mã đơn',
            selector: row => row.orderNum,
            sortable: true,
        },
        {
            name: 'SĐT',
            selector: row => row.phone,
            sortable: true,
        },
        {
            name: 'Ngày đặt',
            selector: row => row.orderDate,
            sortable: true,
            cell: row => (
                <span>{moment(row.orderDate).format('DD/MM/YYYY HH:mm')}</span>
            ),
        },
        {
            name: 'Tổng tiền',
            selector: row => row.totalPrice,
            sortable: true,
            cell: row => <span className="text-red-600 font-medium">{row.totalPrice.toLocaleString()} VNĐ</span>,
        },
        {
            name: 'Hành động',
            cell: row => <span className="text-blue-600 font-medium">Xem chi tiết đơn hàng</span>,
        },
    ];

    const OrdersModal = () => {
        if (!showModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Chi tiết {orders.length} đơn hàng hoàn tất
                        </h2>
                        <button
                            onClick={closeModal}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <FaTimes size={20} className="text-gray-600" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-auto p-4">
                        <DataTable
                            columns={columns}
                            data={orders}
                            pagination
                            responsive
                            highlightOnHover
                            striped
                            expandableRows
                            expandableRowsComponent={DetailOrderComponent}
                            expandOnRowClicked
                            noDataComponent="Không có đơn hàng nào."
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[5, 10, 15, 20, 30]}
                        />
                    </div>

                    <div className="p-4 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-medium transition-colors duration-200"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4  border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-semibold text-blue-800">Tổng doanh thu</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchRevenue}
                            className="p-1 hover:bg-blue-200 rounded-full transition-colors duration-200 text-blue-600"
                            title="Làm mới"
                        >
                            <FaSyncAlt size={14} />
                        </button>
                        <button
                            onClick={() => alert("Chuyển đến danh sách hoá đơn")}
                            className="p-1 hover:bg-blue-200 rounded-full transition-colors duration-200 text-blue-600"
                            title="Xem hoá đơn"
                        >
                            <FaFileInvoice size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="border px-2 py-1 rounded text-sm w-full sm:w-auto"
                    />
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="border px-2 py-1 rounded text-sm w-full sm:w-auto"
                    />
                    <button
                        onClick={fetchFilteredData}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                        Cập nhật
                    </button>
                </div>

                <div className="flex items-center justify-center mb-2">
                    <p className="text-2xl font-bold text-red-600">
                        {revenue !== null ? `${revenue.toLocaleString()} VNĐ` : '...'}
                    </p>
                </div>

                <div className="text-center text-blue-700 text-xs">
                    <button
                        className="font-medium hover:underline focus:outline-none"
                        onClick={openOrdersModal}
                        disabled={isLoadingOrders}
                    >
                        {isLoadingOrders
                            ? "Đang tải dữ liệu..."
                            : `Xem chi tiết ${orders.length > 0 ? orders.length : '30'} đơn hàng`}
                    </button>
                </div>
            </div>

            {/* Modal */}
            <OrdersModal />
        </div>
    );
};

export default TotalCompletedRevenueCard;
