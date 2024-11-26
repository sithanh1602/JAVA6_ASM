import axios from 'axios';

const ORDER_DETAIL_API_BASE_URL = "/api/orderDetails";

class OrderDetailService {
    createOrderDetail(orderDetail) {
        return axios.post(ORDER_DETAIL_API_BASE_URL, orderDetail);
    }

    createOrderDetails(orderDetails) {
        return axios.post(ORDER_DETAIL_API_BASE_URL + "/batch", orderDetails);
    }
}

export default new OrderDetailService();
