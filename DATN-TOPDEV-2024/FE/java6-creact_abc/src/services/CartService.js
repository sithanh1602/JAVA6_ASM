import axios from 'axios';

// Base URL của API backend
const API_URL = 'http://localhost:8080/api/carts';

// Hàm để thêm sản phẩm đơn lẻ (ProductVariant) vào giỏ hàng
export const addProductToCart = async (userId, productVariantId, quantity) => {
    try {
        // Gửi request POST đến endpoint /add
        const response = await axios.post(`${API_URL}/add`, null, {
            params: { userId, productVariantId, quantity },
        });

        // Trả về dữ liệu giỏ hàng đã được cập nhật (CartDetail)
        return response.data;
    } catch (error) {
        // Xử lý lỗi từ server
        if (error.response && error.response.data) {
            const errorMessage = error.response.data.message || error.response.data;
            console.error(`Lỗi từ server: ${errorMessage}`);
            throw new Error(errorMessage); // Trả về lỗi chi tiết từ backend
        } else {
            console.error('Lỗi không xác định:', error);
            throw new Error('Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.');
        }
    }
};

// Hàm để thêm BuildPC vào giỏ hàng
export const addPcToCart = async (userId, buildId, quantity) => {
    try {
        // Gửi request POST đến endpoint /add_pc
        const response = await axios.post(`${API_URL}/add_pc`, null, {
            params: { userId, buildId, quantity },
        });

        // Trả về dữ liệu giỏ hàng đã được cập nhật (CartDetail)
        return response.data;
    } catch (error) {
        // Xử lý lỗi từ server
        if (error.response && error.response.data) {
            const errorMessage = error.response.data.message || error.response.data;
            console.error(`Lỗi từ server: ${errorMessage}`);
            throw new Error(errorMessage); // Trả về lỗi chi tiết từ backend
        } else {
            console.error('Lỗi không xác định:', error);
            throw new Error('Đã xảy ra lỗi khi thêm BuildPC vào giỏ hàng.');
        }
    }
};

// Hàm để lấy tất cả các mục trong giỏ hàng của người dùng
export const getAllCartItemsForUser = async (userId) => {
    try {
        // Gửi request GET đến endpoint /user/{userId}
        const response = await axios.get(`${API_URL}/user/${userId}`);

        // Trả về danh sách giỏ hàng (List<CartDetailResponseDTO>)
        return response.data;
    } catch (error) {
        // Xử lý lỗi từ server
        if (error.response && error.response.status === 204) {
            // Trường hợp giỏ hàng trống (204 No Content)
            return [];
        } else if (error.response && error.response.data) {
            const errorMessage = error.response.data.message || error.response.data;
            console.error(`Lỗi từ server: ${errorMessage}`);
            throw new Error(errorMessage);
        } else {
            console.error('Lỗi khi lấy danh sách giỏ hàng:', error);
            throw new Error('Không thể tải giỏ hàng.');
        }
    }
};

// Hàm để xóa mục khỏi giỏ hàng (hỗ trợ cả ProductVariant và BuildPC)
export const removeProductFromCart = async (userId, productVariantId = null, buildId = null) => {
    try {
        // Kiểm tra và log thông tin để debug
        console.log('userId:', userId, 'productVariantId:', productVariantId, 'buildId:', buildId);

        // Gửi request DELETE đến endpoint /remove với params phù hợp
        const response = await axios.delete(`${API_URL}/remove`, {
            params: {
                userId,
                productVariantId,
                buildId,
            },
        });

        // Trả về thông báo thành công từ server
        return response.data;
    } catch (error) {
        // Xử lý lỗi từ server
        if (error.response && error.response.data) {
            const errorMessage = error.response.data.message || error.response.data;
            console.error(`Lỗi từ server: ${errorMessage}`);
            throw new Error(errorMessage);
        } else {
            console.error('Lỗi khi xóa mục khỏi giỏ hàng:', error);
            throw new Error('Không thể xóa mục khỏi giỏ hàng.');
        }
    }
};