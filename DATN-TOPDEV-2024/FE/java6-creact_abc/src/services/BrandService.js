import axios from 'axios';

const BRAND_BASE_URL = 'http://localhost:8080/api/brands';

class BrandService {
    // Fetch all brands
    async getAllBrands() {
        try {
            const response = await axios.get(BRAND_BASE_URL);
            return response.data; // Returns the list of brands
        } catch (error) {
            console.error('Error fetching brands:', error);
            throw error; // Propagate error for handling in the calling code
        }
    }

    // Fetch a brand by ID
    async getBrandById(id) {
        try {
            const response = await axios.get(`${BRAND_BASE_URL}/${id}`);
            return response.data; // Returns the brand
        } catch (error) {
            console.error(`Error fetching brand with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }

    // Create a new brand
    async createBrand(brand) {
        try {
            const response = await axios.post(BRAND_BASE_URL, brand);
            return response.data; // Returns the created brand
        } catch (error) {
            console.error('Error creating brand:', error);
            throw error; // Propagate error
        }
    }

    // Update an existing brand
    async updateBrand(id, brand) {
        try {
            const response = await axios.put(`${BRAND_BASE_URL}/${id}`, brand);
            return response.data; // Returns the updated brand
        } catch (error) {
            console.error(`Error updating brand with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }

    // Delete a brand
    async deleteBrand(id) {
        try {
            await axios.delete(`${BRAND_BASE_URL}/${id}`);
            return; // No content returned on successful deletion
        } catch (error) {
            console.error(`Error deleting brand with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }
}

export default new BrandService();
