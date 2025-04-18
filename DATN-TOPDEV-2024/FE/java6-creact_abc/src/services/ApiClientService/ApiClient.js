// src/services/apiClient.js
import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // 🔥 THÊM DÒNG NÀY nếu dùng Cookies
});

// Interceptor để tự động thêm token vào Header
apiClient.interceptors.request.use(
    (config) => {
        // Ưu tiên lấy token từ cookie
        const token = Cookies.get('token') || localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
