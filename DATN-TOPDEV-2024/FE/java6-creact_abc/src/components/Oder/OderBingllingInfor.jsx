import React, { useEffect, useState } from 'react';
import UserAddressService from '../../services/UserAddressService';
import { FaCogs } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import ProvinceSelect from "../account/ProvinceSelect";

const BillingInfo = ({ setUserInfo, userInfo, setShippingFee, fetchShippingFee }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const handleModalToggle = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        setUserInfo((prevState) => ({
            ...prevState,
            fullName: address.fullName || prevState.fullName,
            phone: address.phone,
            email: address.email || prevState.email,
            fullAddress: address.fullAddress,
            district: address.district, // Cập nhật district
            ward: address.ward,         // Cập nhật ward
        }));
        setIsModalOpen(false);

        // Gọi fetchShippingFee với địa chỉ vừa chọn
        if (address.district && address.ward) {
            fetchShippingFee(address);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("Token không tồn tại hoặc đã hết hạn");
            window.location.href = '/loginn';
        } else {
            UserAddressService.getDefaultUserInfo()
                .then((data) => {
                    if (data) {
                        setUserInfo({
                            fullName: data.fullName || 'Chưa cập nhật',
                            phone: data.phone || 'Chưa cập nhật',
                            fullAddress: data.fullAddress || 'Chưa có địa chỉ mặc định',
                            email: data.email || 'Chưa cập nhật',
                            district: data.district, // Thêm district
                            ward: data.ward,         // Thêm ward
                        });
                    }
                })
                .catch((error) => console.error('Lỗi khi lấy thông tin người dùng:', error));

            UserAddressService.getAllAddresses()
                .then((data) => setAddresses(data || []))
                .catch((error) => console.error('Lỗi khi lấy danh sách địa chỉ:', error));
        }
    }, [setUserInfo]);

    const columns = [
        {
            name: 'Địa chỉ',
            selector: row => row.fullAddress,
            sortable: true,
        },
        {
            name: 'Số điện thoại',
            selector: row => row.phone,
            sortable: true,
        },
        {
            name: 'Chọn',
            button: true,
            cell: (row) => (
                <button
                    onClick={() => handleSelectAddress(row)}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                >
                    Chọn
                </button>
            ),
        },
    ];

    return (
        <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Thông tin thanh toán</h2>
            <div className="border border-gray-300 rounded-md p-4">
            <div className="space-y-6">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                        <input
                            type="text"
                            className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={userInfo.fullName}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <input
                            type="text"
                            className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={userInfo.phone}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="text"
                            className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={userInfo.email}
                            readOnly
                        />
                    </div>
                    <div className="flex items-center">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                            <input
                                type="text"
                                className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={userInfo.fullAddress}
                                readOnly
                            />
                        </div>
                        <button
                            type="button"
                            className="ml-2 p-1 text-gray-500 rounded-md hover:text-gray-600"
                            onClick={handleModalToggle}
                        >
                            <FaCogs />
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-4xl">
                        <h3 className="text-xl font-semibold mb-4">Tất cả Địa Chỉ</h3>
                        <ProvinceSelect />
                        <DataTable
                            columns={columns}
                            data={addresses}
                            pagination
                            highlightOnHover
                            responsive
                        />
                        <div className="mt-4 flex justify-between">
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
        </div>
    );
};

export default BillingInfo;