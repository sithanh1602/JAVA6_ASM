import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/posts';

class PostService {
    // Lấy tất cả bài viết
    async getAllPosts() {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bài viết:', error);
            throw error;
        }
    }

    // Lấy bài viết theo ID
    async getPostById(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy bài viết có ID ${id}:`, error);
            throw error;
        }
    }

    // Tạo bài viết mới
    async createPost(postData) {
        try {
            const response = await axios.post(BASE_URL, postData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo bài viết:', error);
            throw error;
        }
    }

    // Cập nhật bài viết
    async updatePost(id, postData) {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, postData);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật bài viết có ID ${id}:`, error);
            throw error;
        }
    }

    // Xóa bài viết
    async deletePost(id) {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            return;
        } catch (error) {
            console.error(`Lỗi khi xóa bài viết có ID ${id}:`, error);
            throw error;
        }
    }

    // Lấy bài viết đã đăng (status = true)
    async getPublishedPosts() {
        try {
            const response = await axios.get(`${BASE_URL}/published`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bài viết đã đăng:', error);
            throw error;
        }
    }

    // Lấy bài viết mới nhất với số lượng giới hạn
    async getLatestPosts(limit) {
        try {
            const response = await axios.get(`${BASE_URL}/latest/${limit}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy danh sách ${limit} bài viết mới nhất:`, error);
            throw error;
        }
    }
}

export default new PostService();
