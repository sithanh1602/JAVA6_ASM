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

export default getAllProductVariants;
