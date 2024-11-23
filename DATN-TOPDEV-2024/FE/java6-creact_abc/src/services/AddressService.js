import axios from 'axios';

// Base URL của API backend
const API_URL = 'http://localhost:8080/api/addresses';

// Hàm xử lý lỗi chung
const handleError = (error) => {
    console.error('Error:', error);

    if (error.response) {
        // Lỗi từ server (có phản hồi)
        const message = error.response.data.message || 'Lỗi từ server.';
        throw new Error(message);
    } else if (error.request) {
        // Lỗi khi không nhận được phản hồi
        throw new Error('Không nhận được phản hồi từ server.');
    } else {
        // Lỗi khác (client-side hoặc network)
        throw new Error('Không thể kết nối đến API.');
    }
};

// Hàm để lấy danh sách địa chỉ của người dùng
export const getAddressesForUser = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID không hợp lệ.');
        }

        const response = await axios.get(`${API_URL}/user/${userId}`);
        return response.data; // Trả về danh sách địa chỉ
    } catch (error) {
        handleError(error);
    }
};

// Hàm để thêm địa chỉ mới
export const createAddress = async (address) => {
    try {
        if (!address || typeof address !== 'object') {
            throw new Error('Dữ liệu địa chỉ không hợp lệ.');
        }

        const response = await axios.post(`${API_URL}/save`, address);
        return response.data; // Trả về địa chỉ đã lưu
    } catch (error) {
        handleError(error);
    }
};

// Hàm để lấy địa chỉ theo ID
export const getAddressById = async (addressId) => {
    try {
        if (!addressId || typeof addressId !== 'number') {
            throw new Error('ID địa chỉ không hợp lệ.');
        }

        const response = await axios.get(`${API_URL}/${addressId}`);
        return response.data; // Trả về địa chỉ
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Không tìm thấy địa chỉ.');
        }
        handleError(error);
    }
};

// Hàm để cập nhật địa chỉ
export const updateAddress = async (idAddress, updatedAddress) => {
    try {
        if (!idAddress || typeof idAddress !== 'number') {
            throw new Error('ID địa chỉ không hợp lệ.');
        }

        if (!updatedAddress || typeof updatedAddress !== 'object') {
            throw new Error('Dữ liệu cập nhật địa chỉ không hợp lệ.');
        }

        // Thêm addressId vào updatedAddress nếu không có trong đối tượng
        updatedAddress.addressId = updatedAddress.addressId || idAddress;

        // Đảm bảo rằng có số điện thoại trong địa chỉ
        if (!updatedAddress.phoneNumber) {
            throw new Error('Số điện thoại không được để trống.');
        }

        // Đảm bảo rằng có tên trong địa chỉ, nếu không thì sử dụng tên mặc định
        updatedAddress.name = updatedAddress.name || 'Tên mặc định';

        // Log dữ liệu của updatedAddress trước khi gửi yêu cầu PUT
        console.log('Dữ liệu cập nhật địa chỉ:', updatedAddress);

        // Gửi yêu cầu PUT để cập nhật địa chỉ
        const response = await axios.put(`${API_URL}/${idAddress}`, updatedAddress);

        // Log dữ liệu trả về từ API sau khi cập nhật
        console.log('Dữ liệu trả về sau khi cập nhật địa chỉ:', response.data);

        return response.data; // Trả về địa chỉ đã cập nhật
    } catch (error) {
        if (error.response) {
            // In ra lỗi chi tiết từ API
            console.error('Lỗi từ API:', error.response.data);
            throw new Error(error.response.data.message || 'Lỗi khi cập nhật địa chỉ');
        } else {
            // Lỗi khác
            console.error('Lỗi không phải từ API:', error);
            throw new Error('Không thể kết nối đến API.');
        }
    }
};



// Hàm để xóa địa chỉ
export const deleteAddress = async (addressId) => {
    try {
        if (!addressId || typeof addressId !== 'number') {
            throw new Error('ID địa chỉ không hợp lệ.');
        }

        const response = await axios.delete(`${API_URL}/${addressId}`);
        if (response.status === 204) {
            return addressId; // Trả về ID của địa chỉ đã xóa
        } else {
            throw new Error('Không thể xóa địa chỉ.');
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Không tìm thấy địa chỉ cần xóa.');
        }
        handleError(error);
    }
};
