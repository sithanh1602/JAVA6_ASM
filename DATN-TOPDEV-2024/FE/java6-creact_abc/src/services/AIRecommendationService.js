import axios from 'axios';

const AI_API_URL = 'http://localhost:5002/api';

class AIRecommendationService {
  async getCompatibleComponents(referenceComponent, currentBuild = {}, metadata = {}, availableProducts = []) {
    try {
      // Đảm bảo có referenceComponent
      if (!referenceComponent) {
        throw new Error('Thiếu thông tin tham chiếu linh kiện');
      }
      
      console.log("Sending to AI API:", {
        referenceComponent: "object",
        currentBuild: "object",
        metadata: metadata,
        availableProductsCount: availableProducts.length
      });
      
      const response = await axios.post(`${AI_API_URL}/recommend-components`, {
        selectedComponent: referenceComponent,
        currentBuild: currentBuild,
        metadata: metadata,
        availableProducts: availableProducts // Thêm danh sách sản phẩm có sẵn trong modal
      });
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi API gợi ý:', error);
      throw error;
    }
  }
}

export default new AIRecommendationService();