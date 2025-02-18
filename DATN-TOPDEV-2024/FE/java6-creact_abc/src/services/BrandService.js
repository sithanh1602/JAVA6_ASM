import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/brands';

const BrandService = {
    getAllBrands: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
                console.error('Failed to fetch brands:', error.response?.data || error.message);
            throw error;
        }
    },

    getBrandById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching brand with ID ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },

    createBrand: async (brandData) => {
        try {
            const response = await axios.post(BASE_URL, brandData);
            return response.data;
        } catch (error) {
            console.error('Failed to create brand:', error.response?.data || error.message);
            throw error;
        }
    },

    updateBrand: async (id, brandData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, brandData);
            return response.data;
        } catch (error) {
            console.error('Error updating brand:', error.response?.data || error.message);
            throw error;
        }
    },

    deleteBrand: async (id) => {
        try {
            console.log('Đang gửi yêu cầu xóa thương hiệu với ID:', id); // Thêm log để kiểm tra
            await axios.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error(`Không tìm thấy thương hiệu với ID ${id}.`);
            } else {
                console.error(`Lỗi khi xóa thương hiệu với ID ${id}:`, error.message);
            }
            throw error;
        }
    },

    getBrandsByCategory: async (categoryId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/brands/by-category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thương hiệu:", error);
            return [];
        }
    },
};

export default BrandService;
