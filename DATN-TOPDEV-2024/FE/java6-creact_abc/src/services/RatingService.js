import axios from 'axios';

const API_URL = 'http://localhost:8080/api/reviews';

class RatingService {

    async getAllReviews() {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }

    async getReviewById(id) {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching review with ID ${id}:`, error);
            throw error;
        }
    }

    async createReview(reviewData) {
        try {
            const response = await axios.post(API_URL, reviewData);
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

    async updateReview(id, reviewData) {
        try {
            const response = await axios.put(`${API_URL}/${id}`, reviewData);
            return response.data;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    throw error.response;
                } else if (error.response.status === 404) {
                    throw new Error(`Review with ID ${id} not found`);
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    async deleteReview(id) {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return;
        } catch (error) {
            console.error(`Error deleting review with ID ${id}:`, error);
            throw error;
        }
    }

    // Lấy danh sách đánh giá theo productId
    async getReviewsByProductId(productId) {
        try {
            const response = await axios.get(`${API_URL}/product/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reviews for product ID ${productId}:`, error);
            throw error;
        }
    }
}

export default new RatingService();
