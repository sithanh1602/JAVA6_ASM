import axios from 'axios';

const AI_API_URL = 'http://localhost:5000/buildPC/api';

// Tạo instance axios riêng cho AI API, tắt withCredentials
const aiAxios = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Quan trọng: tắt withCredentials để tránh lỗi CORS
});

class AIRecommendationService {
  async getCompatibleComponents(referenceComponent, currentBuild = {}, metadata = {}, availableProducts = []) {
    try {
      // Đảm bảo có referenceComponent
      if (!referenceComponent) {
        return {
          status: 'error',
          recommendations: [],
          errorMessage: 'Thiếu thông tin tham chiếu linh kiện'
        };
      }
      
      console.log("Sending to AI API:", {
        referenceComponent: "object",
        currentBuild: "object",
        metadata: metadata,
        availableProductsCount: availableProducts.length
      });
      
      // Sử dụng instance aiAxios thay vì axios mặc định
      const response = await aiAxios.post('/recommend-components', {
        selectedComponent: referenceComponent,
        currentBuild: currentBuild,
        metadata: metadata,
        availableProducts: availableProducts
      });
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi API gợi ý:', error);
      
      // Trả về object thông báo lỗi thay vì throw error
      return {
        status: 'error',
        recommendations: [],
        errorMessage: 'Đã xảy ra lỗi khi kết nối đến máy chủ AI. Vui lòng thử lại sau.'
      };
    }
  }
}

export default new AIRecommendationService();