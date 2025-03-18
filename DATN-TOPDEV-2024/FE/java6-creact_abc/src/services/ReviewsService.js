import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/reviews';

class ReviewsService {
    async getAllReviews() {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching Reviewss:', error);
            throw error;
        }
    }

    async deleteReview(id) {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    }
}

export default new ReviewsService();