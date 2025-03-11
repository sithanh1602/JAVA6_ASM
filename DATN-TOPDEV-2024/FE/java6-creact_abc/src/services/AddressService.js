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

// Hàm để lấy địa chỉ theo ID (đã tối ưu)
export const getAddressById = async (id) => {
    try {
        if (!id || typeof id !== 'number') {
            throw new Error('ID địa chỉ không hợp lệ.');
        }
        console.log('Gửi yêu cầu lấy địa chỉ với ID:', id); // Thêm log để debug
        const response = await axios.get(`${API_URL}/${id}`);
        console.log('Phản hồi từ server:', response.data); // Log dữ liệu trả về
        return response.data; // Trả về địa chỉ
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error('Không tìm thấy địa chỉ với ID:', id);
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

        console.log('Dữ liệu cập nhật địa chỉ:', updatedAddress);
        const response = await axios.put(`${API_URL}/${idAddress}`, updatedAddress);
        console.log('Dữ liệu trả về sau khi cập nhật:', response.data);

        return response.data; // Trả về địa chỉ đã cập nhật
    } catch (error) {
        if (error.response) {
            console.error('Lỗi từ API:', error.response.data);
            throw new Error(error.response.data.message || 'Lỗi khi cập nhật địa chỉ');
        } else {
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