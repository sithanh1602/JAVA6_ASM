import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:8080/api/post-categories';

class PostCateService {

  async getAllPostCategories() {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      throw error;
    }
  }

  async addPostCategories(categoryData) {
    try {
      const response = await axios.post(BASE_URL, categoryData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm danh mục:', error);
      throw error;
    }
  }

  async updatePostCategories(id, categoryData) {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật danh mục ${id}:`, error);
      throw error;
    }
  }

  async deletePostCategories(id) {
    try {
      await this.axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Lỗi khi xóa danh mục ${id}:`, error);
      throw error;
    }
  }
}

export default new PostCateService();