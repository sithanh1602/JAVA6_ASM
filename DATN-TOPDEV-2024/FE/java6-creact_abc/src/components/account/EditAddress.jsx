import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getAddressById, updateAddress } from "../../services/AddressService";
import { useLocation, useNavigate } from "react-router-dom";

const AddressForm = () => {
    const API_HOST = "https://provinces.open-api.vn/api/";
    const userId = localStorage.getItem("UserId");
    const location = useLocation();
    const navigate = useNavigate();
    const addressId = location.state?.addressId;

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

    // Dùng useMemo để tính toán địa chỉ đầy đủ
    const fullAddress = useMemo(() => {
        const addressParts = [
            streetAddress,
            wards.find((item) => String(item.code) === String(selectedWard))?.name,
            districts.find((item) => String(item.code) === String(selectedDistrict))?.name,
            provinces.find((item) => String(item.code) === String(selectedProvince))?.name,
        ];
        return addressParts.filter(Boolean).join(", ");
    }, [selectedProvince, selectedDistrict, selectedWard, streetAddress, provinces, districts, wards]);

    // Lấy danh sách tỉnh/thành phố
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const { data } = await axios.get(`${API_HOST}?depth=1`);
                setProvinces(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
            }
        };
        fetchProvinces();
    }, []);

    // Lấy thông tin địa chỉ chi tiết
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

                        const provinceResponse = await axios.get(`${API_HOST}p/${provinceMatch.code}?depth=2`);
                        setDistricts(provinceResponse.data.districts);

                        const districtMatch = provinceResponse.data.districts.find(district => district.name === data.district);
                        if (districtMatch) {
                            setSelectedDistrict(districtMatch.code);

                            const districtResponse = await axios.get(`${API_HOST}d/${districtMatch.code}?depth=2`);
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

    // Lấy danh sách quận/huyện khi chọn tỉnh
    const fetchDistricts = async (provinceCode) => {
        try {
            const { data } = await axios.get(`${API_HOST}p/${provinceCode}?depth=2`);
            setDistricts(data.districts || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách quận/huyện:", error);
        }
    };

    // Lấy danh sách phường/xã khi chọn quận
    const fetchWards = async (districtCode) => {
        try {
            const { data } = await axios.get(`${API_HOST}d/${districtCode}?depth=2`);
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
        setSelectedDistrict(""); // Không reset các giá trị khác
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

        if (!phoneNumber || !/^\d{10,11}$/.test(phoneNumber)) {
            setErrorMessage("Số điện thoại không hợp lệ. Vui lòng nhập đúng.");
            return;
        }

        if (!streetAddress || !selectedProvince || !selectedDistrict || !selectedWard) {
            setErrorMessage("Vui lòng điền đầy đủ các trường thông tin.");
            return;
        }

        const addressData = {
            userId,
            streetAddress,
            phoneNumber,
            isDefault, // Sử dụng isDefault thay vì defaults
            province: provinces.find((item) => String(item.code) === String(selectedProvince))?.name,
            district: districts.find((item) => String(item.code) === String(selectedDistrict))?.name,
            ward: wards.find((item) => String(item.code) === String(selectedWard))?.name,
            fullAddress: fullAddress,
        };

        try {
            await updateAddress(addressId, addressData);
            alert("Cập nhật địa chỉ thành công!");
            navigate("/address");
        } catch (error) {
            setErrorMessage("Lỗi khi lưu địa chỉ: " + error.message);
        }
    };

    return (
        <div className="max-w-3xl mx-auto  p-5 rounded-lg  bg-white">
            <h1 className="text-2xl font-bold mb-5 text-center">Cập nhật địa chỉ</h1>
            <div className="space-y-4">
                <div>
                    <label className="block font-medium">Tỉnh/Thành phố:</label>
                    <select
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
                    <label className="block font-medium">Quận/Huyện:</label>
                    <select
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
                    <label className="block font-medium">Phường/Xã:</label>
                    <select
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
                    <label className="block font-medium">Địa chỉ chi tiết:</label>
                    <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Nhập địa chỉ chi tiết"
                    />
                </div>

                <div>
                    <label className="block font-medium">Số điện thoại:</label>
                    <input
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

                {errorMessage && (
                    <div className="text-red-500 text-center">{errorMessage}</div>
                )}

                <div className="text-center mt-5">
                    <button
                        onClick={handleSaveAddress}
                        className="bg-blue-500 text-white px-6 py-2 rounded"
                    >
                        Lưu địa chỉ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressForm;
