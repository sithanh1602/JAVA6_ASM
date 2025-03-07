import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OrderService from "../../services/OrderSevice";
import { faClipboardCheck, faTruck, faBoxOpen, faCheckCircle, faHandshake, faExclamationCircle, faDollarSign, faCheckDouble, faTimesCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

const getStatusInfo = (status) => {
    const statusMap = {
        1: { text: 'Đã đặt hàng', icon: faClipboardCheck, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
        2: { text: 'Chưa thanh toán', icon: faExclamationCircle, color: 'text-red-500', bgColor: 'bg-red-100' },
        3: { text: 'Đã thanh toán', icon: faDollarSign, color: 'text-green-500', bgColor: 'bg-green-100' },
        4: { text: 'Đã xác nhận', icon: faCheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-100' },
        5: { text: 'Đang giao hàng', icon: faTruck, color: 'text-orange-500', bgColor: 'bg-orange-100' },
        6: { text: 'Đã giao hàng', icon: faBoxOpen, color: 'text-green-500', bgColor: 'bg-green-100' },
        7: { text: 'Đã nhận hàng', icon: faHandshake, color: 'text-purple-500', bgColor: 'bg-purple-100' },
        8: { text: 'Hoàn thành', icon: faCheckDouble, color: 'text-teal-500', bgColor: 'bg-teal-100' },
        9: { text: 'Đã hủy', icon: faTimesCircle, color: 'text-gray-500', bgColor: 'bg-gray-100' }
    };
    return statusMap[status] || { text: 'Không xác định', icon: faQuestionCircle, color: 'text-gray-500', bgColor: 'bg-gray-100' };
};

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderProducts, setOrderProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Hàm kiểm tra và cập nhật trạng thái đơn hàng từ 7 sang 8 nếu quá 7 ngày
    const checkAndUpdateOrderStatus = async (order) => {
        if (order.status === 7) {
            const orderDate = new Date(order.orderDate).getTime();
            const currentTime = new Date().getTime();
            const diffInMs = currentTime - orderDate;
            const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 7 ngày tính bằng milliseconds

            if (diffInMs > oneWeekInMs) {
                try {
                    await OrderService.updateOrderStatus(order.id, 8);
                    console.log(`Đơn hàng ${order.orderNum} đã tự động chuyển sang trạng thái Hoàn thành`);
                } catch (err) {
                    console.error(`Lỗi khi tự động cập nhật trạng thái đơn hàng ${order.orderNum}:`, err);
                }
            }
        }
    };

    // Hàm lấy danh sách đơn hàng và kiểm tra trạng thái
    const fetchOrders = async () => {
        try {
            const userId = localStorage.getItem("UserId");
            if (!userId) throw new Error("Không tìm thấy UserId trong localStorage");
            const ordersData = await OrderService.getOrdersByUserId(userId);

            // Kiểm tra từng đơn hàng và cập nhật trạng thái nếu cần
            for (const order of ordersData) {
                await checkAndUpdateOrderStatus(order);
            }

            // Lấy lại danh sách đơn hàng sau khi cập nhật
            const updatedOrdersData = await OrderService.getOrdersByUserId(userId);
            setOrders(updatedOrdersData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API cleanupUnpaidOrders
    const cleanupUnpaidOrders = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/orders/cleanup-unpaid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (response.ok) {
                console.log(result.message);
                await fetchOrders(); // Gọi lại fetchOrders để kiểm tra và cập nhật trạng thái
            } else {
                console.error('Lỗi khi xóa đơn hàng:', result.error);
            }
        } catch (err) {
            console.error('Không thể kết nối đến server:', err);
        }
    };

    useEffect(() => {
        cleanupUnpaidOrders();
        fetchOrders();
        const cleanupInterval = setInterval(() => {
            cleanupUnpaidOrders();
        }, 5 * 60 * 1000); // 5 phút
        return () => clearInterval(cleanupInterval);
    }, []);

    const openModal = async (order) => {
        setSelectedOrder(order);
        console.log(order);
        setIsModalOpen(true);
        try {
            const products = await OrderService.getProductsByOrderId(order.id);
            console.log("aaaaa",products)
            setOrderProducts(products);
        } catch (err) {
            console.error("Lỗi lấy danh sách sản phẩm:", err);
            setOrderProducts([]);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
        setOrderProducts([]);
    };

    const getUserIdFromToken = () => {
        const token = Cookies.get("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                return decodedToken.userId;
            } catch (err) {
                console.error("Token không hợp lệ:", err);
                return null;
            }
        }
        return null;
    };

    const handlePayment = async (orderId) => {
        const userId = getUserIdFromToken();
        console.log("UserID:", userId);

        const selectedOrder = orders.find(order => order.id === orderId);
        if (!selectedOrder) {
            alert("Không tìm thấy thông tin đơn hàng!");
            console.error("Order not found for ID:", orderId);
            return;
        }

        if (!userId) {
            alert("Không thể xác định người dùng. Vui lòng đăng nhập lại!");
            return;
        }

        try {
            const response = await OrderService.placeOrderNosave(selectedOrder, userId, orderId);
            console.log("URL thanh toán nhận được:", response);
            if (response) {
                window.location.href = response;
            } else {
                alert("Không nhận được URL thanh toán. Vui lòng thử lại.");
            }
        } catch (error) {
            console.log("userId:", userId, "orderId:", orderId);
            alert("Thanh toán thất bại, vui lòng thử lại.");
            console.error("Lỗi khi thanh toán:", error.response?.data || error.message);
        }
    };

    const handleCancelOrder = async (orderId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn hủy đơn hàng này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Hủy đơn hàng',
            cancelButtonText: 'Quay lại'
        });

        if (result.isConfirmed) {
            try {
                await OrderService.updateOrderStatus(orderId, 9);
                const userId = localStorage.getItem("UserId");
                const ordersData = await OrderService.getOrdersByUserId(userId);
                setOrders(ordersData);
                Swal.fire('Hủy thành công!', 'Đơn hàng của bạn đã được hủy.', 'success');
            } catch (err) {
                console.error("Lỗi hủy đơn hàng:", err);
                Swal.fire('Lỗi!', 'Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại.', 'error');
            }
        }
    };

    const handleConfirmReceived = async (orderId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn đã nhận hàng?',
            text: "Hành động này sẽ xác nhận đơn hàng hoàn thành!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await OrderService.updateOrderStatus(orderId, 8);
                const userId = localStorage.getItem("UserId");
                const ordersData = await OrderService.getOrdersByUserId(userId);
                setOrders(ordersData);
                Swal.fire('Thành công!', 'Đơn hàng đã được xác nhận hoàn thành.', 'success');
            } catch (err) {
                console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
                Swal.fire('Lỗi!', 'Đã xảy ra lỗi khi xác nhận đơn hàng. Vui lòng thử lại.', 'error');
            }
        }
    };

    const getTimeRemaining = (orderDate) => {
        const orderTime = new Date(orderDate).getTime();
        const currentTime = new Date().getTime();
        const diffInMs = currentTime - orderTime;
        const oneDayInMs = 24 * 60 * 60 * 1000;
        const remainingMs = oneDayInMs - diffInMs;

        if (remainingMs <= 0) return "Đã hết hạn";
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours} giờ ${minutes} phút hết hạn thanh toán`;
    };

    const orderColumns = [
        { name: 'Mã Đơn Hàng', selector: row => row.orderNum, sortable: true },
        {
            name: 'Trạng thái',
            cell: row => {
                const status = getStatusInfo(row.status);
                return (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bgColor}`}>
                        <FontAwesomeIcon icon={status.icon} className={`${status.color}`} />
                        <span className={`${status.color} font-medium`}>{status.text}</span>
                        {row.status === 2 && (
                            <span className="text-xs text-red-500 ml-2">
                                (Còn {getTimeRemaining(row.orderDate)})
                            </span>
                        )}
                    </div>
                );
            },
            sortable: true
        },
        {
            name: 'Tổng Tiền',
            selector: row => row.totalPrice,
            sortable: true,
            cell: row => <span className="text-red-500">{row.totalPrice.toLocaleString()} VNĐ</span>
        },
        {
            name: 'Ngày Đặt',
            selector: row => new Date(row.orderDate).toLocaleDateString(),
            sortable: true
        },
        {
            name: 'Địa Chỉ Giao Hàng',
            selector: row => row.fullAddress,
            wrap: true,
            sortable: true,
            cell: row => <div style={{ fontSize: '12px' }}>{row.fullAddress}</div>
        },
        {
            name: 'Trạng thái thanh toán',
            selector: row => row.paymentStatus,
            cell: row => (
                <span className={`font-medium ${row.paymentStatus ? 'text-green-500' : 'text-blue-500'}`}>
                    {row.paymentStatus ? 'Thanh toán online' : 'Thanh toán khi nhận hàng'}
                </span>
            ),
            sortable: true
        },
        {
            name: 'Hành Động',
            cell: row => (
                <div className="flex flex-col gap-2 p-4">
                    <Button
                        onClick={() => openModal(row)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 text-xs"
                    >
                        Xem Chi Tiết
                    </Button>
                    {row.paymentStatus && (row.status === 1 || row.status === 2) && (
                        <Button
                            onClick={() => handlePayment(row.id)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 text-xs"
                        >
                            Thanh Toán
                        </Button>
                    )}
                    {[1, 2, 3].includes(row.status) && (
                        <Button
                            onClick={() => handleCancelOrder(row.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 text-xs"
                        >
                            Hủy đơn hàng
                        </Button>
                    )}
                    {row.status === 7 && (
                        <Button
                            onClick={() => handleConfirmReceived(row.id)}
                            className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-1 px-2 text-xs"
                        >
                            Đã nhận hàng
                        </Button>
                    )}
                </div>
            ),
        }
    ];

    const productColumns = [
        { name: 'Ảnh', cell: row => <img src={row.imageUrl} alt={row.name} className="w-16 h-16 object-cover rounded-md" /> },
        { name: 'Tên Sản Phẩm', selector: row => row.name, sortable: true },
        { name: 'Số Lượng', selector: row => row.quantity, sortable: true },
        { name: 'Giá', selector: row => row.price, sortable: true, format: row => `${row.price.toLocaleString()} VNĐ` },
    ];

    const OrderProcessTimeline = ({ currentStatus }) => {
        const statuses = [
            { id: 1, icon: faClipboardCheck, text: 'Đã đặt hàng' },
            { id: 2, icon: faExclamationCircle, text: 'Chưa thanh toán' },
            { id: 3, icon: faDollarSign, text: 'Đã thanh toán' },
            { id: 4, icon: faCheckCircle, text: 'Đã xác nhận' },
            { id: 5, icon: faTruck, text: 'Đang giao hàng' },
            { id: 6, icon: faBoxOpen, text: 'Đã giao hàng' },
            { id: 7, icon: faHandshake, text: 'Đã nhận hàng' },
            { id: 8, icon: faCheckDouble, text: 'Hoàn thành' },
            { id: 9, icon: faTimesCircle, text: 'Đã hủy' }
        ];

        return (
            <div className="w-full py-8">
                <div className="flex justify-between relative">
                    <div className="absolute top-6 left-0 w-full h-1 bg-gray-200">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{
                                width: `${
                                    (Math.max(0, statuses.findIndex(s => s.id === currentStatus)) / (statuses.length - 1)) * 100
                                }%`
                            }}
                        />
                    </div>
                    {statuses.map((status) => (
                        <div key={status.id} className="flex flex-col items-center relative z-10">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                                    ${currentStatus >= status.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}
                                    transition-all duration-300`}
                            >
                                <FontAwesomeIcon icon={status.icon} className="text-xl" />
                            </div>
                            <span className={`text-sm font-medium text-center w-24
                                ${currentStatus >= status.id ? 'text-blue-500' : 'text-gray-400'}
                                transition-all duration-300`}>
                                {status.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-10">
            <h2 className="text-2xl font-bold mb-6">Danh Sách Đơn Hàng</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <DataTable
                columns={orderColumns}
                data={orders}
                progressPending={loading}
                customStyles={{
                    rows: { style: { fontSize: "17px", minHeight: '60px' } },
                    headRow: { style: { backgroundColor: '#f3f4f6', fontWeight: 'bold' } }
                }}
                noDataComponent="Không có đơn hàng nào."
                persistTableHead
            />
            <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="4xl">
                <ModalContent>
                    <ModalHeader className="text-xl font-bold">Chi Tiết Đơn Hàng</ModalHeader>
                    <ModalBody>
                        {selectedOrder && (
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="mb-2"><strong>Mã Đơn Hàng:</strong> {selectedOrder.orderNum}</p>
                                        <p className="mb-2">
                                            <strong className="pr-2">Trạng Thái đơn hàng:</strong>
                                            <span className={`ml-2 ${getStatusInfo(selectedOrder.status).color}`}>
                                                {getStatusInfo(selectedOrder.status).text}
                                            </span>
                                        </p>
                                        <p className="mb-2">
                                            <strong className="pr-2">Tổng Tiền:</strong>
                                            <span className="ml-2 text-red-500 font-medium">
                                                {selectedOrder.totalPrice.toLocaleString()} VNĐ
                                            </span>
                                        </p>
                                        <p className="mb-2">
                                            <strong className="pr-2">Phí vận chuyển:</strong>
                                            <span className="ml-2 text-orange-500 font-medium">
                                                {selectedOrder.shipping_fee ? selectedOrder.shipping_fee.toLocaleString() : '0'} VNĐ
                                            </span>
                                        </p>
                                        <p className="mb-2">
                                            <strong className="pr-2">Giảm giá:</strong>
                                            <span className="ml-2 text-green-500 font-medium">
                                                {selectedOrder.discountPrice ? selectedOrder.discountPrice.toLocaleString() : '0'} VNĐ
                                            </span>
                                        </p>
                                        <p className="mb-2">
                                            <strong className="pr-2">Trạng thái thanh toán:</strong>
                                            <span className={`ml-2 ${selectedOrder.paymentStatus ? 'text-green-500' : 'text-red-500'}`}>
                                                {selectedOrder.paymentStatus ? 'Thanh toán online' : 'Thanh toán khi nhận hàng'}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2">
                                            <strong className="pr-2">Ngày Đặt:</strong>
                                            {new Date(selectedOrder.orderDate).toLocaleDateString()}
                                        </p>
                                        <p className="mb-2">
                                            <strong className="pr-2">Địa Chỉ:</strong>
                                            {selectedOrder.fullAddress}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <h3 className="font-bold mb-4">Tiến Độ Đơn Hàng:</h3>
                                    <OrderProcessTimeline currentStatus={selectedOrder.status} />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-4">Sản phẩm trong đơn hàng:</h3>
                                    <DataTable
                                        columns={productColumns}
                                        data={orderProducts}
                                        noDataComponent="Không có sản phẩm nào trong đơn hàng này."
                                        customStyles={{
                                            rows: { style: { fontSize: "16px", minHeight: '50px' } },
                                            headRow: { style: { backgroundColor: '#f3f4f6', fontWeight: 'bold' } }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={closeModal}>Đóng</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default OrderList;