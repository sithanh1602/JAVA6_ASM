// AddressManagement.js
import React, { useState } from 'react';

const AddressManagement = () => {
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            country: 'Việt Nam',
            address: '123 Main St',
            houseNumber: '123',
            postalCode: '100000',
            city: 'Hà Nội',
            phoneNumber: '0987654321',
            email: 'example@example.com',
        },
        // Add more initial addresses as needed
    ]);

    const handleEdit = (id) => {
        // Implement the edit logic
    };

    const handleDelete = (id) => {
        setAddresses(addresses.filter(address => address.id !== id));
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Quản lý địa chỉ</h2>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                <tr>
                    <th className="py-2 px-4 border-b">Quốc gia/Khu vực</th>
                    <th className="py-2 px-4 border-b">Địa chỉ</th>
                    <th className="py-2 px-4 border-b">Số nhà</th>
                    <th className="py-2 px-4 border-b">Mã bưu điện</th>
                    <th className="py-2 px-4 border-b">Tỉnh / Thành phố</th>
                    <th className="py-2 px-4 border-b">Số điện thoại</th>
                </tr>
                </thead>
                <tbody>
                {addresses.map((address) => (
                    <tr key={address.id}>
                        <td className="py-2 px-4 border-b">{address.country}</td>
                        <td className="py-2 px-4 border-b">{address.address}</td>
                        <td className="py-2 px-4 border-b">{address.houseNumber}</td>
                        <td className="py-2 px-4 border-b">{address.city}</td>
                        <td className="py-2 px-4 border-b">{address.phoneNumber}</td>
                        <td className="py-2 px-4 border-b">
                            <button
                                onClick={() => handleEdit(address.id)}
                                className="text-blue-500 hover:underline mr-2"
                            >
                                Sửa
                            </button>
                            <button
                                onClick={() => handleDelete(address.id)}
                                className="text-red-500 hover:underline"
                            >
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AddressManagement;
