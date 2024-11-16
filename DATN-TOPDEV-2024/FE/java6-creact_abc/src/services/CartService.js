import axios from 'axios';

// Base URL của API backend
const API_URL = 'http://localhost:8080/api/carts';

// Hàm để thêm sản phẩm vào giỏ hàng
export const addProductToCart = async (userId, productId, quantity) => {
    try {
        // Gửi request POST đến API để thêm sản phẩm vào giỏ hàng
        const response = await axios.post(`${API_URL}/add`, null, {
            params: {
                userId,
                productId,
                quantity,
            }
        });

        // Trả về dữ liệu giỏ hàng đã được cập nhật
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
        throw new Error('Không thể thêm sản phẩm vào giỏ hàng');
    }
};

// Hàm để lấy tất cả các sản phẩm trong giỏ hàng của người dùng
export const getAllCartItemsForUser = async (userId) => {
    try {
        // Gửi request GET đến API để lấy danh sách sản phẩm trong giỏ hàng của người dùng
        const response = await axios.get(`${API_URL}/user/${userId}`);

        // Trả về dữ liệu giỏ hàng (bao gồm tên, giá, số lượng, v.v.)
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm trong giỏ hàng:', error);
        throw new Error('Không thể tải giỏ hàng');
    }
};

export const removeProductFromCart = async (userId, productId) => {
    try {
        // Kiểm tra lại productId và userId có phải là các giá trị hợp lệ không
        console.log('userId:', userId, 'productId:', productId);  // Debug thông tin

        // Gửi request DELETE đến API để xóa sản phẩm khỏi giỏ hàng
        const response = await axios.delete(`${API_URL}/remove`, {
            params: {
                userId: userId,
                productId: productId
            },
        });

        return response.data;
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
        throw new Error('Không thể xóa sản phẩm khỏi giỏ hàng');
    }
};



