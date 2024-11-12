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
            return response.data; // Returns the created product
        } catch (error) {
            console.error('Error creating product:', error);
            throw error; // Propagate error
        }
    }

    // Update an existing product
    async updateProduct(id, product) {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, product);
            return response.data; // Returns the updated product
        } catch (error) {
            console.error(`Error updating product with ID ${id}:`, error);
            throw error; // Propagate error
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

    // Fetch product variants by product ID
    async getProductVariants(productId) {
        try {
            const response = await axios.get(`${BASE_URL}/${productId}/variants`);
            return response.data; // Returns the list of variants
        } catch (error) {
            console.error(`Error fetching variants for product ID ${productId}:`, error);
            throw error; // Propagate error
        }
    }

    // Fetch attributes by variant ID
    async getAttributesByVariantId(productId, variantId) {
        try {
            const response = await axios.get(`${BASE_URL}/${productId}/variants/${variantId}/attributes`);
            return response.data; // Returns the list of attributes
        } catch (error) {
            console.error(`Error fetching attributes for variant ID ${variantId}:`, error);
            throw error; // Propagate error
        }
    }


    // Fetch products by category
    async getProductsByCategory(category) {
        try {
            const response = await axios.get(`${BASE_URL}?category=${category}`);
            return response.data; // Return the list of products
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }
}

export default new ProductService();
