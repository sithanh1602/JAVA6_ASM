import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/products';

class ProductService {
    // Fetch all products
    async getAllProducts() {
        try {
            const response = await axios.get(BASE_URL);
            return response.data; // Returns the list of products
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error; // Propagate error for handling in the calling code
        }
    }

    // Fetch a product by ID
    async getProductById(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data; // Returns the product
        } catch (error) {
            console.error(`Error fetching product with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }

    // Create a new product
    async createProduct(product) {
        try {
            const response = await axios.post(BASE_URL, product);
            return response.data;
        } catch (error) {
            if (error.response) {
                // Lỗi từ backend với status code
                if (error.response.status === 400) {
                    // Validation errors
                    throw error.response;
                } else if (error.response.status === 404) {
                    throw new Error('Resource not found');
                } else if (error.response.status === 403) {
                    throw new Error('Access forbidden');
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    // Update an existing product
    async updateProduct(id, product) {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, product);
            return response.data;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    throw error.response;
                } else if (error.response.status === 404) {
                    throw new Error(`Product with ID ${id} not found`);
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    // Delete a product
    async deleteProduct(id) {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return; // No content returned on successful deletion
        } catch (error) {
            console.error(`Error deleting product with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }

    // Fetch brand by product ID
    async getBrandByProductId(productId) {
        try {
            const response = await axios.get(`${BASE_URL}/${productId}/brand`); // Adjust the URL for the brand API
            return response.data; // Returns the brand data
        } catch (error) {
            console.error(`Error fetching brand for product ID ${productId}:`, error);
            throw error; // Propagate error
        }
    }

}

export default new ProductService();
