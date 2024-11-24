import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../firebase.config";
import UserService from "../../../../services/UserService";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const checkUniqueEmail = async (email, userId) => {
    try {
        const allUsers = await UserService.getAllUsers();

        if (userId) {
            return !allUsers.some(user => user.email === email && user.userId !== userId);
        } else {
            return !allUsers.some(user => user.email === email);
        }
    } catch (error) {
        console.error('Error checking email uniqueness:', error);
        return false;
    }
};

const checkUniqueUsername = async (userName, userId) => {
    try {
        const allUsers = await UserService.getAllUsers();

        if (userId) {
            return !allUsers.some(user => user.userName === userName && user.userId !== userId);
        } else {
            return !allUsers.some(user => user.userName === userName);
        }
    } catch (error) {
        console.error('Error checking username uniqueness:', error);
        return false;
    }
};

const schema = yup.object().shape({
    userName: yup
        .string()
        .required('Bắt buộc nhập tên người dùng')
        .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
        .test(
            'unique-username',
            'Tên người dùng đã tồn tại!',
            async (value, context) => {
                const userId = context.parent.userId || null;
                return await checkUniqueUsername(value, userId);
            }
        ),
    email: yup
        .string()
        .required('Bắt buộc nhập email')
        .email('Email không hợp lệ')
        .test(
            'unique-email',
            'Email đã tồn tại!',
            async (value, context) => {
                const userId = context.parent.userId || null;
                return await checkUniqueEmail(value, userId);
            }
        ),
    fullName: yup
        .string()
        .required('Bắt buộc nhập họ và tên')
        .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    phone: yup
        .string()
        .required('Bắt buộc nhập số điện thoại')
        .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số'),
    status: yup
        .string()
        .required('Trạng thái là bắt buộc')
});

const UserInput = ({ user, onSave }) => {
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            userName: '',
            email: '',
            fullName: '',
            phone: '',
            status: 'Active',
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                userId: user.userId || '',
                userName: user.userName || '',
                email: user.email || '',
                fullName: user.fullName || '',
                phone: user.phone || '',
                status: user.status || 'Active',
                image: user.image || ''
            });
            setImagePreview(user.image || '');
        }
    }, [user, reset]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setUploading(true);
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);

                const storageRef = ref(storage, `users/${Date.now()}_${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => {
                        setUploading(false);
                        Swal.fire({
                            icon: "error",
                            title: "Upload Failed",
                            text: "Could not upload the image. Please try again.",
                        });
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            setUploading(false);
                            setValue('image', downloadURL);
                            setImagePreview(downloadURL);
                            Swal.fire({
                                icon: "success",
                                title: "Image Uploaded",
                                text: "The image has been uploaded successfully!",
                            });
                        } catch (error) {
                            console.error("Error getting download URL:", error);
                            setUploading(false);
                        }
                    }
                );
            } catch (error) {
                console.error("Error uploading image:", error);
                setUploading(false);
            }
        }
    };

    const onSubmit = async (data) => {
        try {
            // Giữ lại ảnh cũ nếu không có ảnh mới upload
            const finalData = {
                ...data,
                image: data.image || imagePreview || user?.image || null
            };

            if (user) {
                // Lọc bỏ các giá trị undefined/null trước khi cập nhật
                const updateData = Object.fromEntries(
                    Object.entries(finalData).filter(([_, value]) => value !== undefined && value !== null)
                );

                await UserService.updateUser(user.userId, updateData);
                Swal.fire("Success", "User updated successfully", "success");
            } else {
                await UserService.createUser(finalData);
                Swal.fire("Success", "User created successfully", "success");
            }
            onSave();
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "An error occurred", "error");
        }
    };

    return (
        <div className="h-full bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="h-full grid grid-cols-2 gap-8">
                {/* Left Column - Image Upload */}
                <div className="w-full flex justify-center">
                    <div
                        className="relative w-[400px] h-[400px]"> {/* Fixed width and height to maintain perfect circle */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="image-upload"
                        />
                        <label
                            htmlFor="image-upload"
                            className="cursor-pointer block w-full h-full rounded-full border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors duration-300"
                        >
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <svg
                                            className="w-12 h-12 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="flex flex-col space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                        <input
                            {...register("fullName")}
                            placeholder="Nhập họ và tên"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.fullName && (
                            <span className="text-red-500 text-sm">{errors.fullName.message}</span>
                        )}
                    </div>

                    {/* Username and Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
                            <input
                                {...register("userName")}
                                placeholder="Nhập tên người dùng"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.userName && (
                                <span className="text-red-500 text-sm">{errors.userName.message}</span>
                            )}
                        </div>

                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                {...register("email")}
                                placeholder="Nhập email"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.email && (
                                <span className="text-red-500 text-sm">{errors.email.message}</span>
                            )}
                        </div>
                    </div>

                    {/* Phone and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input
                                {...register("phone")}
                                placeholder="Nhập số điện thoại"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.phone && (
                                <span className="text-red-500 text-sm">{errors.phone.message}</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                            <select
                                {...register("status")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Active">Còn Hoạt Động</option>
                                <option value="Inactive">Hết Hoạt Động</option>
                            </select>
                            {errors.status && (
                                <span className="text-red-500 text-sm">{errors.status.message}</span>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-auto">
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full px-6 py-2 rounded-lg transition-colors ${
                                uploading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                        >
                            {user ? "Cập Nhật Người Dùng" : "Tạo Người Dùng"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserInput;