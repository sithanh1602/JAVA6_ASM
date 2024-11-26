import React, { useEffect, useState } from 'react';
import OrderService from "../../services/OrderSevice"; // Kiểm tra tên dịch vụ chính xác
import DataTable from 'react-data-table-component';
import { FaCheckCircle, FaTruck, FaStar, FaShoppingCart } from 'react-icons/fa'; // Icons for each step

// OrderStatusStepper component to display status in a stepper form with continuous connectors
const OrderStatusStepper = ({ status }) => {
    const steps = [
        { label: 'Đang chờ xác nhận', icon: <FaShoppingCart className="text-lg" />, key: 'pending' },
        { label: 'Đã xác nhận', icon: <FaCheckCircle className="text-lg" />, key: 'confirmed' },
        { label: 'Đang giao hàng', icon: <FaTruck className="text-lg" />, key: 'inTransit' },
        { label: 'Hoàn tất giao hàng', icon: <FaCheckCircle className="text-lg" />, key: 'completed' },
    ];

    // Determine the color of each step based on the current order status
    const getStatusClass = (step) => {
        switch (status) {
            case 'Đã xác nhận':
                return step.key === 'confirmed' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500';
            case 'Đang giao hàng':
                return step.key === 'inTransit' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500';
            case 'Hoàn tất giao hàng':
                return step.key === 'completed' ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-500';
            default:
                return step.key === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-500';
        }
    };

    return (
        <div className="flex justify-between items-center my-6 relative">
            {steps.map((step, index) => (
                <div key={step.key} className={`flex flex-col items-center ${getStatusClass(step)} px-4 py-2 rounded-lg z-10`}>
                    <div className="mb-2">{step.icon}</div>
                    <span className="text-sm">{step.label}</span>
                </div>
            ))}
            <div className="absolute top-1/2 left-0 right-0 z-0 flex justify-between items-center">
                {steps.map((_, index) => {
                    return (
                        <div
                            key={index}
                            className={`h-1 bg-gray-300 ${index !== steps.length - 1 ? 'flex-1' : ''}`} // Remove last line
                        />
                    );
                })}
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
            await OrderService.cancelOrder(orderId);
            setOrders((prevOrders) => prevOrders.filter(order => order.id !== orderId));
        } catch (err) {
            setError(`Error canceling order: ${err.message}`);
        }
    };

    // Columns for DataTable
    const columns = [
        {
            name: 'Sản phẩm',
            selector: row => (
                <ul className="space-y-2">
                    {row.products && row.products.map((product, index) => (
                        <li key={index} className="flex items-center space-x-3">
                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
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
            selector: row => new Date(row.orderDate).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Tổng tiền',
            selector: row => formatPrice(row.totalPrice),
            sortable: true,
            right: true,
        },
        {
            name: 'Trạng thái',
            selector: row => row.status,
            sortable: true,
        },
        {
            name: 'Huỷ đơn',
            cell: row => (
                <button
                    onClick={() => cancelOrder(row.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    disabled={row.status === 'Cancelled'}
                >
                    {row.status === 'Cancelled' ? 'Đã huỷ' : 'Huỷ đơn hàng'}
                </button>
            ),
            sortable: false,
        },
    ];

    return (
        <div className="container mx-auto p-6">
            {orders.length === 0 ? (
                <p className="text-center">Không có đơn hàng nào.</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="mb-8 bg-white p-6 rounded-lg ">
                        {/* Display Order Status Stepper above the table */}
                        <OrderStatusStepper status={order.status} />
                        <DataTable
                            columns={columns}
                            data={[order]} // Show only the current order
                            highlightOnHover
                            pointerOnHover
                            className="shadow-lg rounded-lg"
                            customStyles={{
                                rows: {
                                    style: {
                                        borderBottom: '1px solid #ddd',
                                    },
                                },
                                headCells: {
                                    style: {
                                        backgroundColor: '#f7f7f7',
                                        fontWeight: 'bold',
                                    },
                                },
                                cells: {
                                    style: {
                                        padding: '12px',
                                    },
                                },
                            }}
                            conditionalRowStyles={[
                                {
                                    when: (row, index) => index % 2 === 0,
                                    style: {
                                        backgroundColor: '#f9f9f9',
                                    },
                                },
                                {
                                    when: (row, index) => index % 2 !== 0,
                                    style: {
                                        backgroundColor: '#ffffff',
                                    },
                                },
                            ]}
                        />
                    </div>
                ))
            )}
        </div>
    );
};

export default OrderList;
