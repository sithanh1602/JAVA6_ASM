import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/vouchers';

class VoucherService {
    // Fetch all vouchers
    async getAllVouchers() {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            throw error;
        }
    }

    // Fetch a voucher by ID
    async getVoucherById(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching voucher with ID ${id}:`, error);
            throw error;
        }
    }

    // Fetch a voucher by code
    async getVoucherByCode(code) {
        try {
            const response = await axios.get(`${BASE_URL}/code/${code}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching voucher with code ${code}:`, error);
            throw error;
        }
    }

    // Create a new voucher
    async createVoucher(voucher) {
        try {
            const response = await axios.post(BASE_URL, voucher);
            return response.data;
        } catch (error) {
            console.error('Error creating voucher:', error);
            throw error;
        }
    }

    // Update an existing voucher
    async updateVoucher(id, voucher) {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, voucher);
            return response.data;
        } catch (error) {
            console.error(`Error updating voucher with ID ${id}:`, error);
            throw error;
        }
    }

    // Deactivate a voucher
    async deactivateVoucher(id) {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deactivating voucher with ID ${id}:`, error);
            throw error;
        }
    }
}

export default new VoucherService();