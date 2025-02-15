import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/attributes";

export const getAllAttributes = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return [];
  }
};

export const getAttributeById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attribute by ID:", error);
    return null;
  }
};

export const addAttribute = async (attribute) => {
  try {
    const response = await axios.post(API_BASE_URL, attribute);
    return response.data;
  } catch (error) {
    console.error("Error adding attribute:", error);
    return null;
  }
};

export const updateAttribute = async ({ id, name, value }) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/attributes/${id}`,
        { name, value }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật thuộc tính:", error);
      throw error;
    }
  };
  

export const deleteAttribute = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting attribute:", error);
    return false;
  }
};
