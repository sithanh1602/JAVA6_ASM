import axios from "axios";

const API_URL = "http://localhost:8080/api/orders";

const getRevenue = (startDate, endDate) => {
    return axios.get(`${API_URL}/revenue`, { params: { startDate, endDate } });
};

const getDailyRevenue = (startDate, endDate) => {
    return axios.get(`${API_URL}/completed`, { params: { startDate, endDate } });
};

const RevenueService = {
    getRevenue,
    getDailyRevenue,
};

export default RevenueService;
