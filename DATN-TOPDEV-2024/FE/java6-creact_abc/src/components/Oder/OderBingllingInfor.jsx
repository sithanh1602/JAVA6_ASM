import React, { useEffect, useState } from 'react';
import UserAddressService from '../../services/UserAddressService';  // Import service

const BillingInfo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState({
        fullName: 'Chưa cập nhật',
        phone: 'Chưa cập nhật',
        fullAddress: 'Chưa có địa chỉ mặc định',
    });
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);  // Thêm state để lưu địa chỉ đã chọn

    const handleModalToggle = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);  // Lưu địa chỉ được chọn
        setUserInfo((prevState) => ({
            ...prevState,
            fullAddress: address.fullAddress,  // Cập nhật địa chỉ đã chọn vào userInfo
            phone: address.phone,  // Cập nhật số điện thoại từ địa chỉ đã chọn
        }));
        setIsModalOpen(false);  // Đóng modal sau khi chọn địa chỉ
    };

    useEffect(() => {
        // Fetch thông tin người dùng mặc định
        UserAddressService.getDefaultUserInfo()
            .then((data) => {
                if (data) {
                    setUserInfo({
                        fullName: data.fullName || 'Chưa cập nhật',
                        phone: data.phone || 'Chưa cập nhật',
                        fullAddress: data.fullAddress || 'Chưa có địa chỉ mặc định',
                    });
                }
            })
            .catch((error) => console.error('Lỗi khi lấy thông tin người dùng:', error));

        // Fetch danh sách địa chỉ của người dùng
        UserAddressService.getAllAddresses()
            .then((data) => setAddresses(data || []))
            .catch((error) => console.error('Lỗi khi lấy danh sách địa chỉ:', error));
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Thông tin thanh toán</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Họ tên */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                        <p className="mt-1 text-gray-700">{userInfo.fullName}</p>
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <p className="mt-1 text-gray-700">{userInfo.phone}</p>
                    </div>

                    {/* Địa chỉ */}
                    <div className="flex items-center">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                            <p className="mt-1 text-gray-700">{userInfo.fullAddress}</p>
                        </div>
                        <button
                            type="button"
                            className="ml-2 p-2 border-none rounded-md shadow-sm text-gray-500"
                            onClick={handleModalToggle}
                        >
                            Thay đổi địa chỉ
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal hiển thị tất cả địa chỉ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96">
                        <h3 className="text-xl font-semibold mb-4">Tất cả Địa Chỉ</h3>
                        {/* Hiển thị danh sách địa chỉ */}
                        <div className="space-y-4">
                            {addresses.length > 0 ? (
                                addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className="border p-4 rounded-md cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSelectAddress(address)}  // Xử lý khi chọn địa chỉ
                                    >
                                        <p className="text-gray-700">Địa chỉ: {address.fullAddress}</p>
                                        <p className="text-gray-700">Số điện thoại: {address.phone}</p>
                                    </div>
                                ))
                            ) : (
                                <p>Chưa có địa chỉ nào.</p>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleModalToggle}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingInfo;
