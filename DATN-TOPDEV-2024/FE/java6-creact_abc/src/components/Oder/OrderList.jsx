import React, { useEffect, useState } from 'react';
import OrderService from "../../services/OrderSevice"; // Đảm bảo đường dẫn chính xác
import { useNavigate } from "react-router-dom";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userId = localStorage.getItem("UserId");
                if (!userId) throw new Error("Không tìm thấy UserId trong localStorage");

                const ordersData = await OrderService.getOrdersByUserId(userId);
                setOrders(ordersData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <p>Đang tải danh sách đơn hàng...</p>;
    if (error) return <p style={{ color: "red" }}>Lỗi: {error}</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Danh Sách Đơn Hàng</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                <thead>
                <tr style={{ backgroundColor: "#f0f0f0", height: "40px" }}>
                    <th>Mã Đơn Hàng</th>
                    <th>Tổng Tiền</th>
                    <th>Ngày Đặt</th>
                    <th>Địa Chỉ Giao Hàng</th>
                    <th>Hành Động</th>
                </tr>
                </thead>
                <tbody>
                {orders.length === 0 ? (
                    <tr>
                        <td colSpan="5" style={{ padding: "15px", fontStyle: "italic" }}>
                            Không có đơn hàng nào.
                        </td>
                    </tr>
                ) : (
                    orders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: "1px solid #ddd", height: "40px" }}>
                            <td>{order.orderNum}</td>
                            <td>{order.totalPrice.toLocaleString()} VNĐ</td>
                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                            <td>{order.fullAddress}</td>
                            <td>
                                <button
                                    style={{
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        cursor: "pointer",
                                        borderRadius: "5px"
                                    }}
                                    onClick={() => navigate(`/order-detail/${order.id}`)}
                                >
                                    Xem Chi Tiết
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderList;
