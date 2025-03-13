import axios from "axios";

const BASE_URL = "http://localhost:8080/api/buildPC";

class BuildPCService {
    // Gọi API lấy danh sách tất cả Build PC
    getAllBuildPC() {
        return axios.get(`${BASE_URL}/all`);
    }

      // Tạo mới cấu hình PC
      createBuildPC(buildPCData) {
        return axios.post(`${BASE_URL}/create`, buildPCData);
    }

      // Tạo mới cấu hình PC
      createBuildPC(buildPCData) {
        return axios.post(`${BASE_URL}/create`, buildPCData);
    }

     // Cập nhật cấu hình PC
     updateBuildPC(buildId, buildPCData) {
        return axios.put(`${BASE_URL}/update/${buildId}`, buildPCData);
    }

    updateBuildPCStatus(buildId, status) {
        return axios.put(`${BASE_URL}/update-status/${buildId}`, { status });
    }
}

export default new BuildPCService();
