import React, { useState, useEffect } from "react";

const UserProfileForm = ({ user, setUser, handleImageChange, handleSave }) => {
    const [imagePreview, setImagePreview] = useState(user?.image || "https://placehold.co/150x150");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setImagePreview(user?.image || "https://placehold.co/150x150");
    }, [user]);

    useEffect(() => {
        const phonePattern = /^(0[3|5|7|8|9|1][0-9]{8})|(\+(\d{1,3})\s?)?(\d{10,15})$/;
        if (user?.phone && !phonePattern.test(user.phone)) {
            setErrors((prev) => ({ ...prev, phone: "Số điện thoại không hợp lệ. Vui lòng nhập đúng số điện thoại." }));
        } else {
            setErrors((prev) => {
                const { phone, ...rest } = prev;
                return rest;
            });
        }
    }, [user?.phone]);

    const validateForm = () => {
        const newErrors = {};

        if (/\d/.test(user?.fullName || "")) {
            newErrors.fullName = "Tên không được chứa số.";
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(user?.email || "")) {
            newErrors.email = "Email không hợp lệ. Vui lòng nhập đúng định dạng email.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm() && Object.keys(errors).length === 0) {
            handleSave();
        }
    };

    return (
        <main className="max-w-3xl mx-auto p-5 rounded-lg bg-white h-[650px]">
            <h2 className="text-2xl font-bold text-center mp-6">Thông tin cá nhân</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div>
                        <FormField
                            label="Tên đầy đủ"
                            value={user?.fullName || ""}
                            onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                            error={errors.fullName}
                        />
                        <FormField
                            label="Email"
                            value={user?.email || ""}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            error={errors.email}
                        />
                        <FormField
                            label="Số điện thoại"
                            value={user?.phone || ""}
                            onChange={(e) => setUser({ ...user, phone: e.target.value })}
                            error={errors.phone}
                        />
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative w-40 h-40 border-4 border-dashed border-gray-400 rounded-full overflow-hidden mb-4">
                            <img
                                src={imagePreview}
                                alt="User profile"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                <label htmlFor="profileImage" className="text-white text-sm font-semibold cursor-pointer">
                                    Chọn ảnh
                                </label>
                            </div>
                        </div>
                        <input
                            type="file"
                            id="profileImage"
                            accept="image/*"
                            onChange={(e) => {
                                handleImageChange(e.target.files[0]);
                                setImagePreview(URL.createObjectURL(e.target.files[0]));
                            }}
                            className="hidden"
                        />
                        <p className="text-sm text-gray-500 mt-2">Dung lượng file tối đa 1 MB</p>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full md:w-auto bg-red-500 text-white px-8 py-3 rounded-full mt-6 hover:bg-red-600 transition-colors"
                >
                    Lưu Thay Đổi
                </button>
            </form>
        </main>
    );
};

const FormField = ({ label, value, onChange, error }) => (
    <div className="mb-6">
        <label className="block text-gray-700 font-medium">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            className={`w-full p-3 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : ""
            }`}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
);

export default UserProfileForm;
