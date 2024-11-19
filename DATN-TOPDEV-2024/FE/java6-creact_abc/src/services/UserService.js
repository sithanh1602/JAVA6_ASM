import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/users'; // Adjust the URL based on your API server

class UserService {
    // Fetch all users
    async getAllUsers() {
        try {
            const response = await axios.get(BASE_URL);
            return response.data; // Returns the list of users
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error; // Propagate error for handling in the calling code
        }
    }

    // Fetch a user by ID
    async getUserById(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data; // Returns the user
        } catch (error) {
            console.error(`Error fetching user with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }

    // Create a new user
    async createUser(user) {
        try {
            const response = await axios.post(BASE_URL, user);
            return response.data; // Returns the created user
        } catch (error) {
            console.error('Error creating user:', error);
            throw error; // Propagate error
        }
    }

    // Update an existing user
    async updateUser(id, user) {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, user);
            return response.data; // Returns the updated user
        } catch (error) {
            console.error(`Error updating user with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }


    // Delete a user
    async deleteUser(id) {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return; // No content returned on successful deletion
        } catch (error) {
            console.error(`Error deleting user with ID ${id}:`, error);
            throw error; // Propagate error
        }
    }
}

export default new UserService(); // Export an instance of the service
