import axios from 'axios';

// URL của API Backend
const ORDER_API_URL = 'http://localhost:8080/api/orders';

// Đặt API để lấy danh sách đơn hàng của người dùng
const getOrdersByUserId = async (userId) => {
    try {
        const response = await axios.get(`${ORDER_API_URL}/user/${userId}`);
        return response.data;  // Trả về dữ liệu đơn hàng
    } catch (error) {
        handleError(error);
    }
};

// Đặt API để lấy các sản phẩm trong một đơn hàng
const getProductsByOrderId = async (orderId) => {
    try {
        const response = await axios.get(`${ORDER_API_URL}/products/${orderId}`);
        return response.data; // Trả về mảng các sản phẩm kèm theo số lượng
    } catch (error) {
        console.error('Error getting products for order:', error);
        throw new Error('Could not fetch products');
    }
};


// Gửi yêu cầu tạo đơn hàng mới
const placeOrder = async (orderData) => {
    try {
        const response = await axios.post(`${ORDER_API_URL}/place`, orderData);
        return response.data;  // Trả về dữ liệu đơn hàng sau khi tạo
    } catch (error) {
        handleError(error);
    }
};

// Hàm xử lý lỗi chung
const handleError = (error) => {
    if (error.response) {
        console.error('Error response:', error.response);
        throw new Error(`Lỗi từ server: ${error.response.data || error.message}`);
    } else if (error.request) {
        console.error('Error request:', error.request);
        throw new Error('Không có phản hồi từ server');
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

export default {
    placeOrder,
    getOrdersByUserId,
    getProductsByOrderId,
    getAllOrders,
    updateOrderStatus,
};
