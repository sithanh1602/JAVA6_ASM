// services/PostService.js
import axios from 'axios';
import Cookies from 'js-cookie';


const BASE_URL = 'http://localhost:8080/api/posts';

class PostService {
  async getAllPosts() {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài viết:', error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy bài viết theo ID
  async getPostById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      console.log('Bài viết theo ID:', response.data); // Debug
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy bài viết:', error.response?.data || error.message);
      throw error;
    }
  }

  // Tạo bài viết mới
  async createPost(postDTO) {
    try {
      console.log('Dữ liệu gửi đi:', postDTO);
      const response = await axios.post(BASE_URL, postDTO, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}` // Ví dụ lấy token từ localStorage
        }
      });
      console.log('Bài viết đã tạo:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo bài viết:', error.response?.data || error.message);
      throw error;
    }
  }

  // Xóa bài viết
  async deletePost(id) {
    try {
      console.log("Xóa bài viết với ID:", id);
      await axios.delete(`${BASE_URL}/${id}`);
      console.log("Đã xóa bài viết thành công");
      return true;
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error.response?.data || error.message);
      throw error;
    }
  }


  // Hàm đảo ngược trạng thái
  async togglePostStatus(id) {
    try {
      console.log('Đang đảo ngược trạng thái cho bài viết:', id);
      const response = await axios.put(`${BASE_URL}/${id}/toggle-status`, null, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Trạng thái đã được đảo ngược:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đảo ngược trạng thái:', error.response?.data || error.message);
      throw error;
    }
  }


  // Cập nhật bài viết
  async updatePost(id, postDTO) {
    try {
      console.log('Dữ liệu cập nhật:', postDTO); // Debug dữ liệu gửi đi
      const response = await axios.put(`${BASE_URL}/${id}`, postDTO, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Bài viết đã cập nhật:', response.data); // Debug phản hồi từ server
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error.response?.data || error.message);
      throw error;
    }
  }


  // Xóa bài viết
  // async deletePost(id) {
  //   try {
  //     await axios.delete(`${BASE_URL}/${id}`);
  //     console.log('Đã xóa bài viết ID:', id); // Debug
  //     return true;
  //   } catch (error) {
  //     console.error('Lỗi khi xóa bài viết:', error.response?.data || error.message);
  //     throw error;
  //   }
  // }



  // Thêm bài viết vào danh sách yêu thích
  async addPostFavorite(userId, postId) {
    try {
      const request = { userId, postId };
      console.log('Thêm favorite:', request); // Debug
      await axios.post(`${BASE_URL}/favorites/add`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Đã thêm favorite cho user:', userId, 'và post:', postId); // Debug
      return true;
    } catch (error) {
      console.error('Lỗi khi thêm favorite:', error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy danh sách bài viết yêu thích của user (có phân trang)
  async getFavoritePosts(userId, page = 0, size = 10) {
    try {
      const response = await axios.get(`${BASE_URL}/favorites/${userId}`, {
        params: { page, size },
      });
      console.log('Danh sách bài viết yêu thích:', response.data); // Debug
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy bài viết yêu thích:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new PostService();