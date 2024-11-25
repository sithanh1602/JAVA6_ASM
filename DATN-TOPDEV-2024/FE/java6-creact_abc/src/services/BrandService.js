import axios from 'axios';

// Đường dẫn cơ bản tới API Brand
const BASE_URL = 'http://localhost:8080/api/brands';

const BrandService = {
    /**
     * Lấy danh sách tất cả các Brand
     * @returns {Promise<Array>} Danh sách các brand
     */
    getAllBrands: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            if (error.response) {
                console.error('Failed to fetch brands:', error.response.data);
            } else {
                console.error('Error fetching all brands:', error.message);
            }
            throw error;
        }
    },

    /**
     * Lấy thông tin Brand theo ID
     * @param {number} id - ID của brand
     * @returns {Promise<Object>} Brand chi tiết
     */
    getBrandById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error(`Brand with ID ${id} not found.`);
            } else {
                console.error(`Error fetching brand with ID ${id}:`, error.message);
            }
            throw error;
        }
    },

    /**
     * Tạo mới một Brand
     * @param {Object} brandData - Dữ liệu brand (ví dụ: { name: 'Brand Name' })
     * @returns {Promise<Object>} Brand đã được tạo
     */
    createBrand: async (brandData) => {
        try {
            const response = await axios.post(BASE_URL, brandData);
            return response.data;
        } catch (error) {
            if (error.response) {
                console.error('Failed to create brand:', error.response.data);
            } else {
                console.error('Error creating brand:', error.message);
            }
            throw error;
        }
    },

    /**
     * Cập nhật thông tin Brand theo ID
     * @param {number} id - ID của brand
     * @param {Object} brandData - Dữ liệu cập nhật (ví dụ: { name: 'Updated Brand Name' })
     * @returns {Promise<Object>} Brand sau khi cập nhật
     */
    // Sửa lỗi trong method updateBrand
    updateBrand: async (id, brandData) => {
        try {
            // Sửa lỗi: thay 'data' bằng 'brandData'
            const response = await axios.put(`${BASE_URL}/${id}`, brandData);
            console.log('Update request:', {
                url: `${BASE_URL}/${id}`,
                data: brandData
            });
            return response.data;
        } catch (error) {
            console.error('Update error:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            throw error;
        }
    },

    /**
     * Xóa một Brand theo ID
     * @param {number} id - ID của brand
     * @returns {Promise<void>}
     */
    deleteBrand: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error(`Brand with ID ${id} not found.`);
            } else {
                console.error(`Error deleting brand with ID ${id}:`, error.message);
            }
            throw error;
        }
    },
};

export default BrandService;
