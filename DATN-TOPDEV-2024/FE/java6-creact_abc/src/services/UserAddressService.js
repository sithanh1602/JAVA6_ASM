import axios from 'axios';
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Cấu hình base URL cho axios
const API_BASE_URL = 'http://localhost:8080/api/UserAddress';

class UserAddressService {
    // Lấy userId từ cookie
    getUserIdFromToken() {
        const token = Cookies.get("jwtToken");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                return decodedToken.userId;
            } catch (err) {
                console.error("Token không hợp lệ:", err);
                return null;
            }
        }
        return null;
    }

    // Lấy thông tin user mặc định
    async getDefaultUserInfo() {
        const userId = this.getUserIdFromToken();

        // Kiểm tra nếu không có userId
        if (!userId) {
            console.error('Không tìm thấy userId trong cookie.');
            return Promise.reject('Không tìm thấy userId');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/${userId}/default-info`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Có lỗi khi lấy thông tin người dùng mặc định');
            return null;
        }
    }

    // Lấy danh sách địa chỉ của người dùng
    async getAllAddresses() {
        const userId = this.getUserIdFromToken();
        // Kiểm tra nếu không có userId
        if (!userId) {
            console.error('Không tìm thấy userId trong cookie.');
            return Promise.reject('Không tìm thấy userId');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/${userId}/addresses`)
            return response.data;
        } catch (error) {
            this.handleError(error, 'Có lỗi khi lấy danh sách địa chỉ');
            return [];
        }
    }

    // Hàm xử lý lỗi chung
    handleError(error, defaultMessage) {
        if (error.response) {
            // Xử lý nếu có response từ server
            if (error.response.status === 401) {
                console.error('Lỗi xác thực: Bạn cần đăng nhập lại.');
                this.handleLogout();
            } else {
                console.error(defaultMessage, error.response.data || error.message);
            }
        } else if (error.request) {
            // Xử lý nếu không nhận được phản hồi từ server
            console.error('Không nhận được phản hồi từ server:', error.request);
        } else {
            // Lỗi khác
            console.error(defaultMessage, error.message);
        }
    }

    // Hàm xử lý đăng nhập lại khi token không hợp lệ
    handleLogout() {
        Cookies.remove("jwtToken"); // Xóa jwtToken khỏi cookie
        window.location.href = '/loginn'; // Chuyển hướng về trang đăng nhập
    }
}

export default new UserAddressService();