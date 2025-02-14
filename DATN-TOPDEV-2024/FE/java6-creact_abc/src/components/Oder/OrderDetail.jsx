import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderService from "../../services/OrderSevice";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    // 🔹 Kiểm tra nếu đơn hàng đã chọn phương thức thanh toán và đang ở trạng thái 1 hoặc 2 thì hiển thị nút "Thanh Toán"
    const showPayButton = order?.paymentStatus && [1, 2].includes(order.status);


    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const orderData = await OrderService.getOrderById(orderId);
                setOrder(orderData);
                const productsData = await OrderService.getProductsByOrderId(orderId);
                setProducts(productsData);
                console.log(productsData);
            } catch (err) {
                setError("Không thể tải thông tin đơn hàng.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    // 🔹 Mapping trạng thái đơn hàng
    const orderStatusMap = {
        1: "Đã đặt hàng",
        2: "Chưa thanh toán",
        3: "Đã thanh toán",
        4: "Đã xác nhận",
        5: "Đang giao hàng",
        6: "Đã giao hàng",
        7: "Đã nhận hàng",
        8: "Hoàn thành",
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

    const handlePayment = async () => {
        const userId = getUserIdFromToken();
        if (!userId) {
            alert("Không thể xác định người dùng. Vui lòng đăng nhập lại!");
            return;
        }

        if (!order?.id) {
            alert("Không tìm thấy ID đơn hàng!");
            console.error("🚨 orderId is missing:", order);
            return;
        }

        try {
            const response = await OrderService.placeOrderNosave(order, userId, order.id);

            console.log("🔗 URL thanh toán nhận được:", response); // Kiểm tra URL thanh toán

            if (response) {
                window.location.href = response; // Chuyển hướng đến trang thanh toán
            } else {
                alert("Không nhận được URL thanh toán. Vui lòng thử lại.");
            }
        } catch (error) {
            console.log("🚨 userId:", userId, "orderId:", order?.id);
            alert("Thanh toán thất bại, vui lòng thử lại.");
            console.error("❌ Lỗi khi thanh toán:", error.response?.data || error.message);
        }
    };


    // 🔹 Xác định trạng thái thanh toán
    const paymentStatusText = order?.paymentStatus ? "Thanh toán bằng VnPay" : "Thanh toán khi nhận hàng";

    // 🔹 Kiểm tra nếu trạng thái đơn hàng là 1, 2, 3 thì hiển thị nút "Hủy đơn hàng"
    const showCancelButton = order?.status && [1, 2, 3].includes(order.status);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!order) return <p style={{ color: "red" }}>Đơn hàng không tồn tại.</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                Chi Tiết Đơn Hàng {order.orderNum}
            </h2>

            {/* 🟢 Hiển thị danh sách sản phẩm */}
            <h3>Danh Sách Sản Phẩm</h3>
            {products.length === 0 ? (
                <p style={{ fontStyle: "italic" }}>Không có sản phẩm nào trong đơn hàng này.</p>
            ) : (
                products.map((product) => (
                    <div
                        key={product.id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            backgroundColor: "#f9f9f9",
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                        }}
                    >
                        {/* 🖼️ Hiển thị ảnh sản phẩm */}
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "5px",
                            }}
                        />

                        {/* 📝 Hiển thị thông tin sản phẩm */}
                        <div>
                            <p><strong>Mã đơn hàng:</strong> {order.orderNum}</p>
                            <p><strong>Họ và tên:</strong> {order.user.fullName}</p>
                            <p><strong>Email:</strong> {order.user.email}</p>
                            <p><strong>Tổng tiền:</strong> {order.totalPrice.toLocaleString()} VND</p>
                            <p><strong>Sản phẩm:</strong> {product.name}</p>
                            <p><strong>Số lượng:</strong> {product.quantity}</p>
                            <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                            <p><strong>Cổng thanh toán:</strong> {paymentStatusText}</p>
                            <p><strong>Trạng thái đơn hàng:</strong> {orderStatusMap[order.status]}</p>
                            <p><strong>Số điện thoại:</strong> {order.phone}</p>
                            <p><strong>Địa chỉ:</strong> {order.fullAddress}</p>
                        </div>
                    </div>
                ))
            )}

            {/* 🟢 Nút hủy đơn hàng nếu trạng thái là 1, 2, 3 */}
            {showCancelButton && (
                <button
                    style={{
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        marginTop: "20px",
                        marginRight: "10px",
                    }}
                    onClick={() => alert("Hủy đơn hàng thành công!")} // TODO: Gọi API hủy đơn hàng
                >
                    Hủy Đơn Hàng
                </button>
            )}

            {showPayButton && (
                <button
                    style={{
                        backgroundColor: "green",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        marginTop: "20px",
                        marginRight: "10px",
                    }}
                    onClick={handlePayment} // Gọi API khi nhấn
                >
                    Thanh Toán
                </button>
            )}

            {/* 🟢 Nút quay lại */}
            <button
                style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "8px 15px",
                    cursor: "pointer",
                    borderRadius: "5px",
                    marginTop: "20px",
                }}
                onClick={() => navigate(-1)}
            >
                Quay Lại
            </button>

        </div>
    );
};

export default OrderDetail;
