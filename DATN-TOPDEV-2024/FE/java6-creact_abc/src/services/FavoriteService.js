import axios from 'axios';


const FAVORITES_API = `http://localhost:8080/api/favorites`;

class FavoriteService {
    // Get all favorite products for a user
    async getFavoriteProducts(userId) {
        try {
            const response = await axios.get(`${FAVORITES_API}/${userId}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch favorite products');
        }
    }

    // Add a product to favorites
    async addToFavorites(userId, productVariantId) {
        try {
            const response = await axios.post(`${FAVORITES_API}`, null, {
                params: {
                    userId: userId,
                    productVariantId: productVariantId
                }
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to add product to favorites');
        }
    }

    // Remove a product from favorites
    async removeFromFavorites(userId, productVariantId) {
        try {
            await axios.delete(`${FAVORITES_API}/${userId}/${productVariantId}`);
            return true;
        } catch (error) {
            throw new Error('Failed to remove product from favorites');
        }
    }

    // Check if a product is in favorites
    async checkIsFavorited(userId, productVariantId) {
        try {
            const response = await axios.get(`${FAVORITES_API}/${userId}/check/${productVariantId}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to check favorite status');
        }
    }
}

export default new FavoriteService();