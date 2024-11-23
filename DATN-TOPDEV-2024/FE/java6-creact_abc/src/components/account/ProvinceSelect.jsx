import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { createAddress } from "../../services/AddressService"; // Đảm bảo đường dẫn đúng

const App = () => {
    const API_HOST = "https://provinces.open-api.vn/api/";
    const userId = localStorage.getItem("UserId");

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [fullAddress, setFullAddress] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); // Thêm state để lưu lỗi

    // Dùng useMemo để tính toán địa chỉ đầy đủ
    const fullAddressText = useMemo(() => {
        const addressParts = [
            streetAddress,
            wards.find((item) => String(item.code) === String(selectedWard))?.name,
            districts.find((item) => String(item.code) === String(selectedDistrict))?.name,
            provinces.find((item) => String(item.code) === String(selectedProvince))?.name,
        ];
        return addressParts.filter(Boolean).join(", ");
    }, [selectedProvince, selectedDistrict, selectedWard, streetAddress, provinces, districts, wards]);

    useEffect(() => {
        setFullAddress(fullAddressText || "Vui lòng nhập đầy đủ thông tin để hiển thị địa chỉ.");
    }, [fullAddressText]);

    useEffect(() => {
        axios
            .get(`${API_HOST}?depth=1`)
            .then((response) => setProvinces(response.data))
            .catch((error) => console.error("Lỗi khi lấy danh sách Tỉnh/Thành:", error));
    }, []);

    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        setSelectedProvince(provinceCode);
        setSelectedDistrict("");
        setSelectedWard("");

        if (provinceCode) {
            axios
                .get(`${API_HOST}p/${provinceCode}?depth=2`)
                .then((response) => {
                    setDistricts(response.data.districts);
                    setWards([]);
                })
                .catch((error) => console.error("Lỗi khi lấy danh sách Quận/Huyện:", error));
        } else {
            setDistricts([]);
            setWards([]);
        }
    };

    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        setSelectedDistrict(districtCode);
        setSelectedWard("");

        if (districtCode) {
            axios
                .get(`${API_HOST}d/${districtCode}?depth=2`)
                .then((response) => {
                    setWards(response.data.wards);
                })
                .catch((error) => console.error("Lỗi khi lấy danh sách Xã/Phường:", error));
        } else {
            setWards([]);
        }
    };

    const handleWardChange = (e) => {
        setSelectedWard(e.target.value);
    };

    const handleStreetAddressChange = (e) => setStreetAddress(e.target.value);
    const handlePhoneNumberChange = (e) => setPhoneNumber(e.target.value);

    const handleSaveAddress = async () => {
        // Kiểm tra số điện thoại hợp lệ
        if (!phoneNumber || !/^\d{10,11}$/.test(phoneNumber)) {
            setErrorMessage("Số điện thoại không hợp lệ. Vui lòng nhập lại.");
            return;
        }

        // Kiểm tra các trường dữ liệu đã nhập đầy đủ chưa
        if (!fullAddress || !streetAddress || !selectedProvince || !selectedDistrict || !selectedWard) {
            setErrorMessage("Vui lòng nhập đầy đủ thông tin địa chỉ.");
            return;
        }

        try {
            // Cấu trúc dữ liệu địa chỉ
            const address = {
                userId,
                streetAddress,
                phoneNumber,
                isDefault,
                province: provinces.find((item) => String(item.code) === String(selectedProvince))?.name,
                district: districts.find((item) => String(item.code) === String(selectedDistrict))?.name,
                ward: wards.find((item) => String(item.code) === String(selectedWard))?.name,
                fullAddress: fullAddressText,
            };

            // Log dữ liệu địa chỉ ra console để kiểm tra
            console.log("Dữ liệu địa chỉ gửi đi:", address);

            // Lưu địa chỉ
            await createAddress(address);
            alert("Địa chỉ đã được lưu thành công!");

            // Reload trang để hiển thị lại danh sách địa chỉ
            window.location.reload();
        } catch (error) {
            setErrorMessage("Đã xảy ra lỗi khi lưu địa chỉ: " + error.message);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-5 border rounded-lg shadow-lg bg-white">
            <h1 className="text-2xl font-bold mb-5 text-center">Thêm Địa Chỉ</h1>
            <div className="space-y-4">
                {/* Các trường chọn tỉnh, quận, xã, đường, số điện thoại */}
                <div>
                    <label htmlFor="province" className="block font-medium">
                        Tỉnh/Thành phố:
                    </label>
                    <select
                        id="province"
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Vui lòng chọn</option>
                        {provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="district" className="block font-medium">
                        Quận/Huyện:
                    </label>
                    <select
                        id="district"
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Vui lòng chọn</option>
                        {districts.map((district) => (
                            <option key={district.code} value={district.code}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="ward" className="block font-medium">
                        Xã/Phường:
                    </label>
                    <select
                        id="ward"
                        value={selectedWard}
                        onChange={handleWardChange}
                        disabled={!selectedDistrict}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Vui lòng chọn</option>
                        {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="street-address" className="block font-medium">
                        Số nhà/Đường:
                    </label>
                    <input
                        type="text"
                        id="street-address"
                        value={streetAddress}
                        onChange={handleStreetAddressChange}
                        className="w-full p-2 border rounded"
                        placeholder="Nhập số nhà, tên đường"
                    />
                </div>
                <div>
                    <label htmlFor="phone-number" className="block font-medium">
                        Số điện thoại:
                    </label>
                    <input
                        type="text"
                        id="phone-number"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        className="w-full p-2 border rounded"
                        placeholder="Nhập số điện thoại"
                    />
                </div>

                {/* Hiển thị thông báo lỗi nếu có */}
                {errorMessage && <div className="text-red-500">{errorMessage}</div>}

                <button
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    disabled={!fullAddress || !phoneNumber}
                    onClick={handleSaveAddress} // Gọi hàm xử lý lưu
                >
                    Lưu Địa Chỉ
                </button>
            </div>
        </div>
    );
};

export default App;
