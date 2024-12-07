import React, { useEffect, useState } from 'react';
import OrderService from "../../services/OrderSevice"; // Đảm bảo tên dịch vụ chính xác
import DataTable from 'react-data-table-component';
import { FaCheckCircle, FaTruck, FaStar, FaShoppingCart } from 'react-icons/fa'; // Icons for each step

// OrderStatusStepper component to display status in a stepper form with continuous connectors
const OrderStatusStepper = ({ status, paymentStatus }) => {
    const steps = [
        { label: 'Đã đặt hàng', icon: <FaShoppingCart className="text-3xl" />, key: 1, color: 'bg-blue-500' },
        paymentStatus && { label: 'Chưa thanh toán', icon: <FaStar className="text-3xl" />, key: 2, color: 'bg-yellow-500' },
        paymentStatus && { label: 'Đã thanh toán', icon: <FaCheckCircle className="text-3xl" />, key: 3, color: 'bg-green-500' },
        { label: 'Đã xác nhận', icon: <FaCheckCircle className="text-3xl" />, key: 4, color: 'bg-teal-500' },
        { label: 'Đang giao hàng', icon: <FaTruck className="text-3xl" />, key: 5, color: 'bg-orange-500' },
        { label: 'Đã hoàn thành', icon: <FaCheckCircle className="text-3xl" />, key: 6, color: 'bg-gray-500' },
        { label: 'Đã hủy', icon: <FaCheckCircle className="text-3xl" />, key: 7, color: 'bg-red-500' },
    ].filter(Boolean); // Loại bỏ các bước null khi paymentStatus = false.

    const getStatusClass = (step) => {
        if (status >= step.key) {
            return `${step.color} text-white`;
        } else {
            return 'bg-gray-300 text-gray-500';
        }
    };

    if(status === 7) {
        const canceledStep = steps.find(step => step.key === 7);
        return (
            <div className="flex justify-center items-center my-6">
                <div className={`flex flex-col items-center ${getStatusClass(canceledStep)} px-4 py-2 rounded-lg`}>
                    <div className="mb-2">{canceledStep.icon}</div>
                    <span className="text-sm">{canceledStep.label}</span>
                </div>
            </div>
        )
    }

    // Trả về giao diện như cũ nhưng đã được lọc trạng thái
    return (
        <div className="flex justify-between items-center my-6 relative">
            {steps.map((step) => (
                <div key={step.key}
                     className={`flex flex-col items-center ${getStatusClass(step)} px-4 py-2 rounded-lg z-10`}>
                    <div className="mb-2">{step.icon}</div>
                    <span className="text-sm">{step.label}</span>
                </div>
            ))}
            <div className="absolute top-1/2 left-0 right-0 z-0 flex justify-between items-center">
                {steps.map((_, index) => (
                    <div key={index} className={`h-1 ${getStatusClass(steps[index])} ${index !== steps.length - 1 ? 'flex-1' : ''}`} />
                ))}
            </div>
        </div>
    );
};

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userId = localStorage.getItem('UserId');
                if (!userId) throw new Error('User ID not found in localStorage');

                const ordersData = await OrderService.getOrdersByUserId(userId);
                console.log(ordersData); // Kiểm tra cấu trúc dữ liệu

                const enrichedOrders = await Promise.all(
                    ordersData.map(async (order) => {
                        const products = await OrderService.getProductsByOrderId(order.id);
                        return { ...order, products };
                    })
                );
                setOrders(enrichedOrders);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Format price function
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        }
        return 'Invalid Price';
    };

    // Cancel order function
    const cancelOrder = async (orderId) => {
        try {
            // Gọi phương thức updateOrderStatushuy để cập nhật trạng thái đơn hàng thành 'Đã hủy'
            const updatedOrder = await OrderService.updateOrderStatus(orderId, 7); // 7 là trạng thái 'Đã hủy'

            // Cập nhật lại danh sách đơn hàng với trạng thái mới
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: 7 } : order // Cập nhật trạng thái đơn hàng thành 'Đã hủy'
                )
            );
        } catch (err) {
            setError(`Error canceling order: ${err.message}`); // Thông báo lỗi nếu có
        }
    };

    // Pay order function
    const payOrder = async (orderId) => {
        try {
            const orderToPay = orders.find((order) => order.id === orderId);
            if (!orderToPay) {
                setError("Đơn hàng không tồn tại.");
                return;
            }

            console.log("Giá trị tổng tiền của đơn hàng: ", orderToPay.totalPrice); // Kiểm tra totalPrice

            const groupedOrderData = {
                userId: parseInt(localStorage.getItem('UserId')),
                orderId: orderToPay.id,
                totalPrice: Math.round(orderToPay.totalPrice),
            };

            console.log(groupedOrderData);

            // Đảm bảo bạn đang gọi đúng phương thức
            const result = await OrderService.placeOrderNosave(groupedOrderData);
            window.location.href = result;
        } catch (err) {
            setError(`Có lỗi xảy ra khi thanh toán: ${err.message}`);
        }
    };

    // Columns for DataTable
    const columns = [
        {
            name: 'Sản phẩm',
            selector: (row) => (
                <ul className="space-y-2">
                    {row.products &&
                        row.products.map((product, index) => (
                            <li key={index} className="flex items-center space-x-3">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                />
                                <div className="text-sm">
                                    <div>{product.name} (x{product.quantity})</div>
                                    <div className="text-gray-500">{formatPrice(product.price)}</div>
                                </div>
                            </li>
                        ))}
                </ul>
            ),
            sortable: false,
        },
        {
            name: 'Ngày đặt hàng',
            selector: (row) => new Date(row.orderDate).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Tổng tiền',
            selector: (row) => formatPrice(row.totalPrice),
            sortable: true,
            right: true,
        },
        {
            name: 'Trạng thái',
            selector: (row) => {
                const statusLabels = [
                    'Đã đặt hàng',
                    'Chưa thanh toán',
                    'Đã thanh toán',
                    'Đã xác nhận',
                    'Đang giao hàng',
                    'Đã hoàn thành',
                    'Đã hủy',
                ];
                return statusLabels[row.status - 1] || 'Không xác định';
            },
            sortable: true,
        },
        {
            name: 'Phương thức thanh toán',
            selector: (row) => {
                if (row.paymentStatus === true) return 'Thanh toán online';
                if (row.paymentStatus === false) return 'Thanh toán khi nhận hàng';
                return 'Không xác định';
            },
            sortable: true,
        },
        {
            name: 'Huỷ đơn',
            cell: (row) => (
                <>
                    {row.status !== 7 && row.status !== 4 && row.status !== 5 && row.status !== 6 && row.status !== 3 && (
                        <button
                            onClick={() => cancelOrder(row.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            {row.status === 7 ? 'Đã huỷ' : 'Huỷ đơn hàng'}
                        </button>
                    )}
                    {row.status === 1 || row.status === 2 ? (
                        <button
                            onClick={() => payOrder(row.id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Thanh toán
                        </button>
                    ) : null}
                </>
            ),
            sortable: false,
        },
    ];

    return (
        <div className="container mx-auto p-6">
            {orders.length === 0 ? (
                <p className="text-center">Không có đơn hàng nào.</p>
            ) : (
                orders.map((order) => (
                    <div key={order.id} className="mb-8 bg-white p-6 rounded-lg">
                        {/* Display Order Status Stepper above the table */}
                        <OrderStatusStepper status={order.status} paymentStatus={order.paymentStatus} />
                        <DataTable
                            columns={columns}
                            data={[order]} // Show only the current order
                            highlightOnHover
                            pointerOnHover
                            className="mt-4"
                            noHeader
                        />
                    </div>
                ))
            )}
        </div>
    );
};

export default OrderList;
