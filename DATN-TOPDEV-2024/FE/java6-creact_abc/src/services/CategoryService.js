import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/admin/categories'; // Adjust the URL based on your API server

class CategoryService {
    // Fetch all categories
    async getAllCategories() {
        try {
            const response = await axios.get(BASE_URL);
            return response.data; // Returns the list of categories
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error; // Propagate error for handling in the calling code
        }
    }

    // Fetch a category by ID
    async getCategoryById(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data; // Returns the category
        } catch (error) {
            console.error(`Error fetching category with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }

    // Create a new category
    async createCategory(category) {
        try {
            const response = await axios.post(BASE_URL, category);
            return response.data; // Returns the created category
        } catch (error) {
            console.error('Error creating category:', error);
            throw error; // Propagate error
        }
    }

    // Update an existing category
    async updateCategory(id, category) {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, category);
            return response.data; // Returns the updated category
        } catch (error) {
            console.error(`Error updating category with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }

    // Delete a category
    async deleteCategory(id) {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return; // No content returned on successful deletion
        } catch (error) {
            console.error(`Error deleting category with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }

    async getTop5Categories() {
        try {
            const response = await axios.get(`${BASE_URL}/TopCategories`);
        return response.data;
        } catch (error) {
            console.error(`Error get Top Categories:`, error);
            throw error; // Propagate error
        }
    }

    async getProductsByCategory(categoryName) {
        try {
            const response = await axios.get(`/api/categories/${categoryName}/products`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching products for category ${categoryName}:`, error);
            throw error;
        }
    }
}

export default new CategoryService();
