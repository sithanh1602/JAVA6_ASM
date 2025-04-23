import axios from 'axios';

// Cấu hình base URL cho axios
const API_BASE_URL = 'http://localhost:8080/api/UserAddress';

class UserAddressService {
    // Lấy thông tin user mặc định
    async getDefaultUserInfo() {
        const userId = this.getUserIdFromLocalStorage();  // Lấy userId từ localStorage

        // Kiểm tra nếu không có userId
        if (!userId) {
            console.error('Không có UserId trong localStorage.');
            return Promise.reject('Không có UserId');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/default-user-info`, {
                headers: {
                    ...this.getAuthHeader(),
                    'UserId': userId  // Thêm UserId vào header
                }
            });
            return response.data;  // Trả về dữ liệu từ server
        } catch (error) {
            this.handleError(error, 'Có lỗi khi lấy thông tin người dùng mặc định');
            return null;
        }
    }

    // Lấy danh sách địa chỉ của người dùng
    async getAllAddresses() {
        const userId = this.getUserIdFromLocalStorage();  // Lấy userId từ localStorage

        // Kiểm tra nếu không có userId
        if (!userId) {
            console.error('Không có UserId trong localStorage.');
            return Promise.reject('Không có UserId');
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/addresses`, {
                headers: {
                    ...this.getAuthHeader(),
                    'UserId': userId  // Thêm UserId vào header
                }
            });
            return response.data;  // Trả về dữ liệu từ server
        } catch (error) {
            this.handleError(error, 'Có lỗi khi lấy danh sách địa chỉ');
            return [];  // Trả về mảng rỗng nếu có lỗi
        }
    }

    // Lấy token từ localStorage và thêm vào header Authorization
    getAuthHeader() {
        const token = localStorage.getItem('token');  // Token lưu trong localStorage
        if (token) {
            return { 'Authorization': `Bearer ${token}` };
        }
        return {};
    }

    // Lấy UserId từ localStorage
    getUserIdFromLocalStorage() {
        const userId = localStorage.getItem('UserId');  // Lấy UserId từ localStorage
        if (userId) {
            return JSON.parse(userId);  // Parse lại từ chuỗi JSON nếu lưu trữ dưới dạng chuỗi
        }
        return null;
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
        localStorage.removeItem('token');  // Xóa token khỏi localStorage
        localStorage.removeItem('UserId'); // Xóa thông tin người dùng nếu cần
        window.location.href = '/loginn';  // Chuyển hướng về trang đăng nhập
    }
}

export default new UserAddressService();
