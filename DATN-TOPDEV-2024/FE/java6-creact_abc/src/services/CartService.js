import axios from 'axios';

// Base URL của API backend
const API_URL = 'http://localhost:8080/api/carts';

// Hàm để thêm sản phẩm vào giỏ hàng
export const addProductToCart = async (userId, productVariantId, quantity) => {
    try {
        // Gửi request POST đến API
        const response = await axios.post(`${API_URL}/add`, null, {
            params: { userId, productVariantId, quantity },
        });

        // Trả về dữ liệu giỏ hàng đã được cập nhật
        return response.data;
    } catch (error) {
        // Kiểm tra lỗi trả về từ server
        if (error.response && error.response.data) {
            const { error } = error.response.data;
            console.error(`Lỗi từ server: ${error}`);
            throw new Error(error); // Trả về lỗi chi tiết
        } else {
            console.error('Lỗi không xác định:', error);
            throw new Error('Số lượng trong giỏ hàng đã đạt tối đa có sẵn trong kho.');
        }
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

export const removeProductFromCart = async (userId, productVariantId) => {
    try {
        // Kiểm tra lại productVariantId và userId có phải là các giá trị hợp lệ không
        console.log('userId:', userId, 'productVariantId:', productVariantId);  // Debug thông tin

        // Gửi request DELETE đến API để xóa sản phẩm khỏi giỏ hàng
        const response = await axios.delete(`${API_URL}/remove`, {
            params: {
                userId: userId,
                productVariantId: productVariantId
            },
        });

        return response.data;
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
        throw new Error('Không thể xóa sản phẩm khỏi giỏ hàng');
    }
};

export const updateCartItemQuantity = async (userId, productVariantId, quantity) => {
    await axios.put(`${API_URL}/user/${userId}/product/${productVariantId}`, { quantity });
};



