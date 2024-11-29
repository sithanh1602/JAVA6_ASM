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
}

export default DashService;
