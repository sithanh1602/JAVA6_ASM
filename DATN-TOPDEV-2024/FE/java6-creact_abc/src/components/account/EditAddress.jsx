import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getAddressById, updateAddress } from "../../services/AddressService";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2"; // Thêm import Swal

const AddressForm = () => {
    const API_HOST = "https://provinces.open-api.vn/api/";
    const location = useLocation();
    const navigate = useNavigate();
    const addressId = location.state?.addressId;

    const getUserIdFromToken = () => {
        const token = Cookies.get("jwtToken");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                return decodedToken.userId;
            } catch (err) {
                console.error("Token không hợp lệ:", err);
                return null;
            }
        }
        return null;
    };

    const userId = getUserIdFromToken();

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fullAddress = useMemo(() => {
        const addressParts = [
            streetAddress,
            wards.find((item) => String(item.code) === String(selectedWard))?.name,
            districts.find((item) => String(item.code) === String(selectedDistrict))?.name,
            provinces.find((item) => String(item.code) === String(selectedProvince))?.name,
        ];
        return addressParts.filter(Boolean).join(", ");
    }, [selectedProvince, selectedDistrict, selectedWard, streetAddress, provinces, districts, wards]);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const { data } = await axios.get(`${API_HOST}?depth=1`, { withCredentials: false });
                setProvinces(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        const fetchAddressDetails = async () => {
            if (addressId) {
                try {
                    const data = await getAddressById(addressId);
                    setStreetAddress(data.streetaddress || "");
                    setPhoneNumber(data.phone || "");
                    setIsDefault(data.defaults || false);

                    const provinceMatch = provinces.find(province => province.name === data.province);
                    if (provinceMatch) {
                        setSelectedProvince(provinceMatch.code);

                        const provinceResponse = await axios.get(`${API_HOST}p/${provinceMatch.code}?depth=2`, { withCredentials: false });
                        setDistricts(provinceResponse.data.districts);

                        const districtMatch = provinceResponse.data.districts.find(district => district.name === data.district);
                        if (districtMatch) {
                            setSelectedDistrict(districtMatch.code);

                            const districtResponse = await axios.get(`${API_HOST}d/${districtMatch.code}?depth=2`, { withCredentials: false });
                            setWards(districtResponse.data.wards);

                            const wardMatch = districtResponse.data.wards.find(ward => ward.name === data.ward);
                            if (wardMatch) {
                                setSelectedWard(wardMatch.code);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching address details:", error);
                }
            }
        };

        if (provinces.length > 0) {
            fetchAddressDetails();
        }
    }, [addressId, provinces]);

    const fetchDistricts = async (provinceCode) => {
        try {
            const { data } = await axios.get(`${API_HOST}p/${provinceCode}?depth=2`, { withCredentials: false });
            setDistricts(data.districts || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách quận/huyện:", error);
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const { data } = await axios.get(`${API_HOST}d/${districtCode}?depth=2`, { withCredentials: false });
            setWards(data.wards || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phường/xã:", error);
        }
    };

    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        setSelectedProvince(provinceCode);
        if (provinceCode) {
            fetchDistricts(provinceCode);
        }
        setSelectedDistrict("");
        setWards([]);
        setSelectedWard("");
    };

    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        setSelectedDistrict(districtCode);
        if (districtCode) {
            fetchWards(districtCode);
        }
        setSelectedWard("");
    };

    const handleSaveAddress = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        if (!userId) {
            setErrorMessage("Không thể xác định userId từ token. Vui lòng đăng nhập lại.");
            return;
        }

        if (!phoneNumber || !/^\d{10,11}$/.test(phoneNumber)) {
            setErrorMessage("Số điện thoại không hợp lệ. Vui lòng nhập đúng.");
            return;
        }

        if (!streetAddress || !selectedProvince || !selectedDistrict || !selectedWard) {
            setErrorMessage("Vui lòng điền đầy đủ các trường thông tin.");
            return;
        }

        if (!provinces || !districts || !wards) {
            setErrorMessage("Dữ liệu không hợp lệ.");
            return;
        }

        const addressData = {
            userId,
            streetAddress,
            phoneNumber,
            isDefault,
            province: provinces.find((item) => String(item.code) === String(selectedProvince))?.name,
            district: districts.find((item) => String(item.code) === String(selectedDistrict))?.name,
            ward: wards.find((item) => String(item.code) === String(selectedWard))?.name,
            fullAddress: fullAddress,
        };

        // Sử dụng Swal để hiển thị hộp thoại xác nhận
        const result = await Swal.fire({
            title: "Xác nhận",
            text: "Bạn có chắc chắn muốn sửa địa chỉ này không?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
            buttonsStyling: true,
            customClass: {
                confirmButton: "bg-blue-500 text-white px-4 py-2 rounded",
                cancelButton: "bg-gray-500 text-white px-4 py-2 rounded mr-2",
            },
        });

        if (!result.isConfirmed) {
            setSuccessMessage("Đã hủy cập nhật địa chỉ.");
            console.log("Người dùng đã hủy cập nhật địa chỉ.");
            return;
        }

        try {
            await updateAddress(addressId, addressData);
            setSuccessMessage("Cập nhật địa chỉ thành công!");
            setTimeout(() => navigate("/profile/address-list"), 2000);
        } catch (error) {
            setErrorMessage("Lỗi khi lưu địa chỉ: " + error.message);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-5 rounded-lg bg-white">
            <h1 className="text-2xl font-bold mb-5 text-center">Cập nhật địa chỉ</h1>
            <div className="space-y-4">
                <div>
                    <label className="block font-medium" htmlFor="province-select">Tỉnh/Thành phố:</label>
                    <select
                        id="province-select"
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-medium" htmlFor="district-select">Quận/Huyện:</label>
                    <select
                        id="district-select"
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((district) => (
                            <option key={district.code} value={district.code}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-medium" htmlFor="ward-select">Phường/Xã:</label>
                    <select
                        id="ward-select"
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        disabled={!selectedDistrict}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Chọn phường/xã</option>
                        {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-medium" htmlFor="street-address">Địa chỉ chi tiết:</label>
                    <input
                        id="street-address"
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Nhập địa chỉ chi tiết"
                    />
                </div>

                <div>
                    <label className="block font-medium" htmlFor="phone-number">Số điện thoại:</label>
                    <input
                        id="phone-number"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Nhập số điện thoại"
                    />
                </div>

                <div>
                    <label className="block font-medium">Đặt làm địa chỉ mặc định:</label>
                    <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={() => setIsDefault(!isDefault)}
                    />
                </div>

                {errorMessage && <p id="error-message" className="text-red-500">{errorMessage}</p>}
                {successMessage && <p id="success-message" className="text-green-500">{successMessage}</p>}
                <div className="flex justify-center space-x-4 mt-5">
                    <button onClick={handleSaveAddress} className="px-4 py-2 bg-blue-500 text-white rounded">
                        Cập nhật địa chỉ
                    </button>
                    <button onClick={() => navigate("/profile/address-list")} className="px-4 py-2 bg-gray-500 text-white rounded">
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressForm;