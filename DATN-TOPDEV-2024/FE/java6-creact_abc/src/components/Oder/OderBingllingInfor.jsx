// BillingInfo.js
import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa'; // Importing FontAwesome icon
import AddressManagement from './AddressManagement';

const BillingInfo = () => {
    // State for controlling the modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to toggle modal visibility
    const handleModalToggle = () => {
        setIsModalOpen(!isModalOpen); // Toggle the modal state
    };


    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Thông tin thanh toán</h2>
            <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ và Tên<span className="text-red-500"> *</span></label>
                        <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email<span className="text-red-500"> *</span></label>
                        <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại<span className="text-red-500"> *</span></label>
                        <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="flex items-center">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700">Địa chỉ<span className="text-red-500"> *</span></label>
                            <div className="flex">
                                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                    <option value="" disabled selected>Chọn địa chỉ</option>
                                    <option value="address1">Địa chỉ 1</option>
                                    <option value="address2">Địa chỉ 2</option>
                                    <option value="address3">Địa chỉ 3</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="ml-2 p-2 border-none rounded-md shadow-sm text-gray-500"
                            onClick={handleModalToggle} // Open modal on button click
                        >
                            <FaCog className="hover:text-orange-700"/>
                        </button>
                    </div>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded" />
                    <label className="ml-2 block text-sm text-gray-900">Tạo tài khoản mới?</label>
                </div>
            </form>
            <h2 className="text-2xl font-bold mt-8 mb-4">Thông tin bổ sung</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700">Ghi chú đơn hàng (tuỳ chọn)</label>
                <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="4" placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."></textarea>
            </div>

            {/* Modal for Address Management */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96">
                        <h3 className="text-xl font-semibold mb-4">Quản lý Địa Chỉ</h3>
                        <AddressManagement />
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleModalToggle} // Close modal on button click
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
