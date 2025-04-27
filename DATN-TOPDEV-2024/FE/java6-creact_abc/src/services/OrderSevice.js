import axios from 'axios';

// URL của API Backend
const ORDER_API_URL = 'http://localhost:8080/api/orders';
const ORDER_API_URL2 = 'http://localhost:8080/api/momo';

// API lấy danh sách đơn hàng của người dùng
const getOrdersByUserId = async (userId) => {
    try {
        const response = await axios.get(`${ORDER_API_URL}/user/${userId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

const getOrderById = async (orderId) => {
    try {
        const response = await axios.get(`${ORDER_API_URL}/${orderId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error("Đơn hàng không tồn tại.");
            return null; // Trả về null nếu không tìm thấy đơn hàng
        }
        console.error("Lỗi khi lấy đơn hàng:", error);
        throw error; // Ném lỗi để xử lý phía trên
    }
};


// API lấy sản phẩm trong đơn hàng theo orderId
const getProductsByOrderId = async (orderId) => {
    try {
        const response = await axios.get(`${ORDER_API_URL}/products/${orderId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// API tạo đơn hàng với VNPay
const placeOrder = async (orderData) => {
    try {
        const response = await axios.post(`${ORDER_API_URL}/place`, orderData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// API tạo đơn hàng với thanh toán COD
const placeOrderNoVnpay = async (orderData) => {
    try {
        const response = await axios.post(`${ORDER_API_URL}/placecod`, orderData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

const placeOrderNosave = async (orderData, userId, orderId) => {
    try {
        const payload = {
            ...orderData,
            userId: userId, // Thêm userId vào payload
            orderId: orderId, // Thêm orderId vào payload
        };

        console.log("📤 Gửi dữ liệu đặt hàng:", payload); // Debug log

        const response = await axios.post(`${ORDER_API_URL}/placeno`, payload);

        console.log("✅ Phản hồi từ server:", response.data); // Debug log

        return response.data; // Trả về dữ liệu từ server
    } catch (error) {
        console.error("Lỗi khi đặt hàng:", error.response?.data || error.message);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm
    }
};



// Hàm xử lý lỗi chung
const handleError = (error) => {
    if (error.response) {
        console.error('Error response:', error.response);
        throw new Error(`Lỗi từ server: ${error.response.data.message || error.message}`);
    } else if (error.request) {
        console.error('Error request:', error.request);
        throw new Error('Không có phản hồi từ server. Vui lòng kiểm tra kết nối mạng.');
    } else {
        console.error('Error message:', error.message);
        throw new Error(`Yêu cầu thất bại: ${error.message}`);
    }
};


const getAllOrders = async () => {
    try {
        const response = await axios.get(`${ORDER_API_URL}/all`); // Đảm bảo endpoint chính xác
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error response:', error.response);
            throw new Error(`Lỗi từ server: ${error.response.data.message || error.message}`);
        } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('Không có phản hồi từ server');
        } else {
            console.error('Error message:', error.message);
            throw new Error(`Yêu cầu thất bại: ${error.message}`);
        }
    }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axios.put(`${ORDER_API_URL}/${orderId}/status`, null, {
            params: { status },
        });
        return response.data;  // Trả về đơn hàng đã được cập nhật
    } catch (error) {
        handleError(error);
    }
};


// API cập nhật trạng thái đơn hàng thành "hủy"
const updateOrderStatushuy = async (orderId, status) => {
    try {
        const response = await axios.put(`${ORDER_API_URL}/${orderId}/statushuy`, status, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Order status updated:', response.data); // Debug log
        return response.data; // Return the updated order
    } catch (err) {
        const errorMessage = err.response
            ? `Error ${err.response.status}: ${err.response.data}`
            : `Error updating order status: ${err.message}`;
        console.error(errorMessage); // Debug log
        throw new Error(errorMessage);
    }
};


const placeOrderZaloPay = async (orderData) => {
    try {
        const response = await axios.post(`${ORDER_API_URL}/place-zalopay`, orderData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Lỗi khi tạo đơn hàng ZaloPay');
    }
};


const saveOrder = async (orderData) => {
    try {
        const response = await axios.post(`${ORDER_API_URL}/save`, orderData);
        return response.data;  // Trả về dữ liệu đơn hàng đã lưu
    } catch (error) {
        handleError(error);  // Hàm xử lý lỗi (tùy chỉnh)
    }
};

const placeOrderMomo = async (orderData) => {
    try {
        const response = await axios.post('http://localhost:8080/api/momo', orderData);
        return response.data.payUrl; // <-- Đảm bảo trả về đúng URL
    } catch (error) {
        handleError(error);
    }
};


const checkMomoPaymentStatus = async (orderId) => {
    try {
        const response = await axios.get(`http://localhost:8080/api/momo/order-status/${orderId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

const refundMomoPayment = async (orderNum, transId, amount, description = "Huỷ đơn hàng") => {
    try {
        const response = await axios.post(`http://localhost:8080/api/momo/refund-momo`, null, {
            params: {
                orderNum,
                transId,
                amount,
                description
            }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi hoàn tiền MoMo:", error);
        // Sử dụng hàm xử lý lỗi chung
        handleError(error);
    }
};

// API tạo đơn hàng preview với MoMo
const placeOrderWithMomoPreview = async (orderData, userId, orderId) => {
    try {
        const payload = {
            userId,
            orderId,
            totalPrice: orderData.totalPrice,
            orderNum: orderData.orderNum,
            fullAddress: orderData.fullAddress,
            paymentStatus: orderData.paymentStatus,
            // Thêm các trường khác nếu cần (dựa trên OrderRequest của backend)
        };

        console.log("📤 Gửi yêu cầu thanh toán MoMo:", payload); // Debug log

        const response = await axios.post(`${ORDER_API_URL2}/placeno-momo`, payload);

        console.log("✅ Phản hồi từ server (MoMo):", response.data); // Debug log

        return response.data.paymentUrl; // Trả về URL thanh toán MoMo
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng MoMo:", error.response?.data || error.message);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm
    }
};

// API cập nhật paymentStatus của đơn hàng
const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
        const response = await axios.put(`${ORDER_API_URL}/${orderId}/payment-status`, { paymentStatus });
        console.log('Payment status updated:', response.data); // Debug log
        return response.data; // Trả về dữ liệu phản hồi từ server
    } catch (error) {
        console.error("Lỗi khi cập nhật paymentStatus:", error.response?.data || error.message);
        handleError(error);
    }
};



// Export các hàm API
export default {
    getOrdersByUserId,
    getProductsByOrderId,
    getAllOrders,
    updateOrderStatus,
    placeOrder,
    placeOrderNoVnpay,
    placeOrderNosave,
    updateOrderStatushuy, // Kiểm tra lại xuất khẩu
    getOrderById,
    placeOrderZaloPay,
    saveOrder,
    placeOrderMomo,             // ✅ mới thêm
    checkMomoPaymentStatus,
    refundMomoPayment,// ✅ mới thêm
    placeOrderWithMomoPreview,
    updatePaymentStatus,
};
