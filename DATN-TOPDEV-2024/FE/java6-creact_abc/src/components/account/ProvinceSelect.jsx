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
        if (!phoneNumber || !/^\d{10,11}$/.test(phoneNumber)) {
            setErrorMessage("Số điện thoại không hợp lệ. Vui lòng nhập lại.");
            return;
        }

        if (!fullAddress || !streetAddress || !selectedProvince || !selectedDistrict || !selectedWard) {
            setErrorMessage("Vui lòng nhập đầy đủ thông tin địa chỉ.");
            return;
        }

        try {
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

            console.log("Dữ liệu địa chỉ gửi đi:", address);

            await createAddress(address);
            alert("Địa chỉ đã được lưu thành công!");

            window.location.reload();
        } catch (error) {
            setErrorMessage("Đã xảy ra lỗi khi lưu địa chỉ: " + error.message);
        }
    };

    return (
        <div className="max-w-xl mx-auto  p-3 ">
            <h1 className="text-2xl font-bold mb-5 text-center">Thêm địa chỉ</h1>
            <div className="grid gap-5">
                <div className="flex flex-col gap-2">
                    <label htmlFor="province" className="text-gray-700 font-medium">Tỉnh/Thành phố</label>
                    <select
                        id="province"
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        className="border rounded-md p-2 bg-white text-gray-700"
                    >
                        <option value="">Vui lòng chọn</option>
                        {provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="district" className="text-gray-700 font-medium">Quận/Huyện</label>
                    <select
                        id="district"
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince}
                        className="border rounded-md p-2 bg-white text-gray-700"
                    >
                        <option value="">Vui lòng chọn</option>
                        {districts.map((district) => (
                            <option key={district.code} value={district.code}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="ward" className="text-gray-700 font-medium">Xã/Phường</label>
                    <select
                        id="ward"
                        value={selectedWard}
                        onChange={handleWardChange}
                        disabled={!selectedDistrict}
                        className="border rounded-md p-2 bg-white text-gray-700"
                    >
                        <option value="">Vui lòng chọn</option>
                        {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="street-address" className="text-gray-700 font-medium">Số nhà/Đường</label>
                    <input
                        type="text"
                        id="street-address"
                        value={streetAddress}
                        onChange={handleStreetAddressChange}
                        placeholder="Nhập số nhà, tên đường"
                        className="border rounded-md p-2 text-gray-700"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="phone-number" className="text-gray-700 font-medium">Số điện thoại</label>
                    <input
                        type="text"
                        id="phone-number"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        placeholder="Nhập số điện thoại"
                        className="border rounded-md p-2 text-gray-700"
                    />
                </div>

                {errorMessage && (
                    <div className="text-red-500 text-sm text-center">{errorMessage}</div>
                )}

                <button
                    onClick={handleSaveAddress}
                    disabled={!fullAddress || !phoneNumber}
                    className="w-full py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition disabled:bg-gray-300"
                >
                    Lưu Địa Chỉ
                </button>
            </div>
        </div>
    );
};

export default App;
