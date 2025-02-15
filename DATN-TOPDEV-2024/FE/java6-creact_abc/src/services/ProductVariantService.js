import axios from "axios";

const API_URL = "http://localhost:8080/api/product-variants";

const getAllProductVariants = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching product variants:", error);
    return [];
  }
};

// Thêm mới một biến thể sản phẩm
const addProductVariant = async (productVariantData) => {
  try {
    const response = await axios.post(`${API_URL}/add`, productVariantData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm biến thể sản phẩm:", error);
    return null;
  }
};

export default {
    getAllProductVariants,
    addProductVariant,
  };
