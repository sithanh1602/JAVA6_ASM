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
const addProductVariant = async (productVariantData) => {
  try {
    const response = await axios.post(`${API_URL}/add`, productVariantData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm biến thể sản phẩm:", error);
    return null;
  }
};
const getProductVariantsByProductId = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/by-product/${productId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching product variants for productId ${productId}:`,
      error
    );
    return [];
  }
};

// Update an existing product variant
const updateProductVariant = async (variantId, productVariantData) => {
  if (!variantId || !productVariantData) {
    console.error("Invalid data or variantId.");
    throw new Error("Missing required data");
  }
  try {
    const payload = {
      productId: parseInt(productVariantData.productId),
      quantity: parseInt(productVariantData.quantity),
      price: parseFloat(productVariantData.price),
      status: productVariantData.status,
      attributeIds: productVariantData.attributeIds.map((id) => parseInt(id)),
      imageUrls: productVariantData.imageUrls,
      description: productVariantData.description
    };
    console.log("Updating variant with ID:", variantId);
    console.log("Update payload:", JSON.stringify(payload, null, 2));
    const response = await axios.put(`${API_URL}/update/${variantId}`, payload);
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {

    console.error(`Error updating product variant with ID ${variantId}:`);
    if (error.response) {
      console.error("Server response:", {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};

const getVariantsByBrand = async (brandId) => {
  try {
    const response = await axios.get(`${API_URL}/by-brand/${brandId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product variants by brand:", error);
    return [];
  }
};


const getVariantsByCategory = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product variants by category:", error);
    return [];
  }
};

 // Lấy top 10 sản phẩm bán chạy
 const getTopBestSellingVariants= async () =>  {
  try {
      const response = await axios.get(`${API_URL}/best-sellers`);
      return response.data;
  } catch (error) {
      console.error("Error fetching best-selling products:", error);
      throw error;
  }
}

// Lấy top 10 sản phẩm mới
const getTopNewestVariants= async () =>  {
  try {
      const response = await axios.get(`${API_URL}/newest`);
      return response.data;
  } catch (error) {
      console.error("Error fetching new products:", error);
      throw error;
  }
}

const getTopRatedProductsVariants= async () =>  {
  try {
      const response = await axios.get(`${API_URL}/outstanding`);
      return response.data;
  } catch (error) {
      console.error("Error fetching outstanding products:", error);
      throw error;
  }
}

export default {
  getAllProductVariants,
  addProductVariant,
  getVariantsByCategory,
  getVariantsByBrand,
  getProductVariantsByProductId,
  updateProductVariant,
  getTopBestSellingVariants,
  getTopNewestVariants,
  getTopRatedProductsVariants
};


