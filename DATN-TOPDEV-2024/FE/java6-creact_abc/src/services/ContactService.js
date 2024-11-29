import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/contact';

class ContactService {
    async getAllContacts() {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    }

    async deleteContactsByIds(ids) {
        try {
            const response = await axios.post(`${BASE_URL}/delete-multiple`, ids);
            return response.data;
        } catch (error) {
            console.error('Error deleting contacts:', error);
            throw error;
        }
    }

    async sendFeedback(id, email, feedback) {
        try {
            const response = await axios.put(
                `${BASE_URL}/feedback/${id}/${email}`,
                feedback,
                {
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error sending feedback:', error);
            throw error;
        }
    }

    async getContactById(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching contact with ID ${id}:`, error);
            throw error;
        }
    }

    async createContact(contact) {
        try {
            const response = await axios.post(BASE_URL, contact);
            return response.data;
        } catch (error) {
            console.error('Error creating contact:', error);
            throw error;
        }
    }
}

export default new ContactService();