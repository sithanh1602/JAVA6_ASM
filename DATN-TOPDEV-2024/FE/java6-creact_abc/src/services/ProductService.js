import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/products';

class ProductService {

    async getAllProducts() {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async getProductDetail(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}/productdetail`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product with ID ${id}:`, error);
            throw error;
        }
    }

    async getBrand(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}/brand`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product brand with ID ${id}:`, error);
            throw error;
        }
    }

    async getCategory(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}/category`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product category with ID ${id}:`, error);
            throw error;
        }
    }

    async getProduct(productId) {
        try {
            const response = await axios.get(`${BASE_URL}/${productId}/product`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product variants for product ID ${productId}:`, error);
            throw error;
        }
    }

    async getImagesByProductVariantId(variantId) {
        try {
            const response = await axios.get(`${BASE_URL}/${variantId}/image`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching images for product variant ID ${variantId}:`, error);
            throw error;
        }
    }

    async createProduct(product) {
        try {
            const response = await axios.post(BASE_URL, product);
            return response.data;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
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

    async deleteProduct(id) {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return;
        } catch (error) {
            console.error(`Error deleting product with ID ${id}:`, error);
            throw error;
        }
    }

    // New method: Get products by category ID
    async getProductsByCategoryId(categoryId) {
        try {
            const response = await axios.get(`${BASE_URL}/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching products for category ID ${categoryId}:`, error);
            throw error;
        }
    }

    async checkVariantQuantity(variantId) {
        try {
            const response = await axios.get(`${BASE_URL}/check-quantity/${variantId}`);
            return response.data;
        } catch (error) {
            console.error(`Error checking quantity for variant ID ${variantId}:`, error);
            throw error;
        }
    }

}

export default new ProductService();
