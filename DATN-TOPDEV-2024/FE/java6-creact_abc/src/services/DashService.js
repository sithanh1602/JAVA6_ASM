import axios from 'axios';

class DashService {
    // Fetch the top customers
    static async getTopCustomers() {
        try {
            const response = await axios.get('http://localhost:8080/api/dash/top-customers');
            return response.data;  // Return the data from the response
        } catch (error) {
            throw new Error('Error fetching top customers: ' + error.message);  // Handle errors
        }
    }

    // Fetch the top selling products
    static async getTopSellingProducts() {
        try {
            const response = await axios.get('http://localhost:8080/api/dash/top-selling');
            return response.data;  // Return the data from the response
        } catch (error) {
            throw new Error('Error fetching top selling products: ' + error.message);  // Handle errors
        }
    }

    static async getTodayOrderCount() {
        try {
            const response = await axios.get(`http://localhost:8080/api/dash/count-today`);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching today\'s order count: ' + error.message);
        }
    }

    static async getOrdersByDate(date) {
        try {
            const response = await axios.get(`http://localhost:8080/api/dash/orders-by-date`, {
                params: { date }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching orders for date ${date}: ${error.message}`);
        }
    }

    static async fetchTopProducts() {
        try {
          const response = await axios.get('http://localhost:8080/api/dash/top-products');
          return response.data;
        } catch (error) {
          console.error('Error fetching top products data:', error);
          throw error;
        }
    }

    static async getTop3Customers() {
        try {
          const response = await axios.get('http://localhost:8080/api/dash/top3-customers');
          return response.data;
        } catch (error) {
          console.error('Failed to fetch top customers:', error);
          return [];
        }
      }
}

export default DashService;
