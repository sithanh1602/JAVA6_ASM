import axios from 'axios';
import { toast } from "react-toastify";
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

export const updateCartItemQuantity = async (userId, productVariantId, quantity, buildId = null) => {
    if (quantity < 1) {
        throw new Error("Quantity must be at least 1");
    }

    try {
        const response = await axios.put(
            `${API_URL}/carts/user/${userId}/product/${productVariantId}`,
            {
                quantity: quantity,
                buildId: buildId,
            }
        );

        toast.success("Đã cập nhật số lượng sản phẩm.");
        return response.data;
    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        toast.error("Không thể cập nhật số lượng sản phẩm.");
        throw error;
    }
};

export const removeCartItem = async (userId, productVariantId, buildId = null) => {
    try {
        const response = await axios.delete(`${API_URL}/carts/remove`, {
            params: {
                userId: userId,
                productVariantId: productVariantId,
                buildId: buildId,
            }
        });

        toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
        return response.data;
    } catch (error) {
        console.error("Error removing cart item:", error);
        toast.error("Không thể xóa sản phẩm khỏi giỏ hàng.");
        throw error;
    }
};

export const searchProductVariants = async (query) => {
    // Return empty array for empty queries
    if (!query || query.trim().length === 0) {
        return [];
    }

    try {
        const response = await axios.get(`http://localhost:8080/api/product-variants`);

        // Filter results on the client side by nameVariants
        const filteredResults = response.data.filter((variant) =>
            variant.nameVariants?.toLowerCase().includes(query.toLowerCase())
        );

        return filteredResults;
    } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        toast.error("Không thể tìm kiếm sản phẩm");
        return [];
    }
};

/**
 * Format currency in VND format
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
        .format(value)
        .replace(/\s?₫/g, " VND");
};