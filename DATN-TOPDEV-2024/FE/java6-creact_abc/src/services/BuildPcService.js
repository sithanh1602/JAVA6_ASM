import axios from "axios";

const BASE_URL = "http://localhost:8080/api/buildPC";

class BuildPCService {
    // Gọi API lấy danh sách tất cả Build PC
    getAllBuildPC() {
        return axios.get(`${BASE_URL}/all`);
    }
}

export default new BuildPCService();
