import React, { useState, useEffect } from "react";
import { getAddressesForUser, deleteAddress } from "../../services/AddressService"; // Use deleteAddress from AddressService
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios"


const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    console.log(addresses)

    const userId = localStorage.getItem("UserId");

    useEffect(() => {
        if (!userId) {
            setError("Không có userId trong localStorage.");
            setLoading(false);
            return;
        }

        const fetchAddresses = async () => {
            try {
                const data = await getAddressesForUser(userId);
                if (Array.isArray(data)) {
                    setAddresses(data);
                } else {
                    setError("Dữ liệu trả về không hợp lệ.");
                }
            } catch (err) {
                setError("Lỗi khi lấy địa chỉ: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [userId]);

    const handleEditAddress = (addressId) => {
        // Redirect to AddressForm with the selected address data
        navigate("/address-form", { state: { addressId } });
    };

    const handleDeleteAddressClick = async (idAddress) => {
        try {
            await deleteAddress(idAddress);
            setAddresses((prevAddresses) => prevAddresses.filter(address => address.idAddress !== idAddress));
            alert("Xóa địa chỉ thành công!");
        } catch (error) {
            console.error("Không thể xóa địa chỉ:", error);
        }
    };

    if (loading) {
        return <div className="text-center mt-4">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-4">Lỗi: {error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-center mb-6">Danh sách địa chỉ của bạn</h2>
            <div className="flex justify-end mb-4">
                <Link to="/ProvinceSelect">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Thêm địa chỉ
                    </button>
                </Link>
            </div>
            {addresses.length === 0 ? (
                <p className="text-center text-gray-500">Không có địa chỉ nào.</p>
            ) : (
                <div className="space-y-4">
                    {addresses.map((address, index) => (
                        <div key={address.idAddress} className="border p-4 rounded-lg shadow-md hover:bg-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Địa chỉ {index + 1}</h3>
                                <div className="flex gap-2">
                                    <Link
                                        to="/Editadderss"
                                        state={{ addressId: address.idAddress }} // Truyền `state` chứa ID của địa chỉ
                                    >
                                        <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                                            Sửa
                                        </button>
                                    </Link>

                                    <button
                                        onClick={() => handleDeleteAddressClick(address.idAddress)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                            <p><strong>Địa chỉ:</strong> {address.fullAddress}</p>
                            <p><strong>Số điện thoại:</strong> {address.phone}</p>
                            <p><strong>Mặc định:</strong> {address.defaults
                                ? "Có" : "Không"}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressList;
