import React, { useState } from 'react';
import { toast } from 'react-toastify';
import UserService from "../../services/UserService";

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const userId = localStorage.getItem('UserId') ? JSON.parse(localStorage.getItem('UserId')) : null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { oldPassword, newPassword, confirmPassword } = formData;

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp.');
            return;
        }

        try {
            const response = await UserService.changePassword(
                userId,
                oldPassword,
                newPassword,
                confirmPassword
            );
            toast.success(response || 'Mật khẩu đã được thay đổi thành công');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err || 'Đã xảy ra lỗi trong quá trình đổi mật khẩu');
        }
    };

    return (
        <div className="max-w-xl mx-auto p-5">
            <h1 className="text-2xl font-bold mb-5 text-center">Đổi Mật Khẩu</h1>

            <div className="grid gap-5">
                <div className="flex flex-col gap-2">
                    <label htmlFor="oldPassword" className="text-gray-700 font-medium">Mật khẩu cũ</label>
                    <input
                        type="password"
                        id="oldPassword"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                        className="border rounded-md p-2 text-gray-700"
                        placeholder="Nhập mật khẩu cũ"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="newPassword" className="text-gray-700 font-medium">Mật khẩu mới</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        className="border rounded-md p-2 text-gray-700"
                        placeholder="Nhập mật khẩu mới"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="confirmPassword" className="text-gray-700 font-medium">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="border rounded-md p-2 text-gray-700"
                        placeholder="Xác nhận mật khẩu mới"
                    />
                </div>

                <div className="flex flex-col gap-2 mt-5">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="w-full py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition disabled:bg-gray-300"
                    >
                        Đổi mật khẩu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
