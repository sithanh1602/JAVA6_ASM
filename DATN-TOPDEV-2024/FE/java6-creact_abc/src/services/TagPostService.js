// services/TagService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/tags';

class TagService {
  async getAllTags() {
    try {
      const response = await axios.get(BASE_URL);
      console.log('Fetched tags:', response.data); // Debug
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tag:', error);
      throw error;
    }
  }

  async getTagById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tag:', error);
      return null;
    }
  }

  async addTag(tagData) {
    try {
      const response = await axios.post(BASE_URL, tagData);
      return response.data;
    } catch (error) {
      console.error('Error adding tag:', error);
      return null;
    }
  }

  async updateTag(id, tagData) {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, tagData);
      return response.data;
    } catch (error) {
      console.error('Error updating tag:', error);
      return null;
    }
  }

  async deleteTag(id) {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
  }
}

export default new TagService(); // Export instance