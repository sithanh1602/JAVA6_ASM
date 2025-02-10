import React, { useState } from "react";
import { storage } from "../../../../firebase.config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PostService from '../../../../services/PostService';
import * as yup from "yup";
import ProductService from "../../../../services/ProductService";

const schema = yup.object().shape({
    title: yup.string().required("Tiêu đề không được để trống"),
    status: yup.string().required("Vui lòng chọn trạng thái"),
    content: yup.string().required("Nội dung không được để trống"),
});

const PostInput = ({ post }) => {
    const [imagePreview, setImagePreview] = useState(post?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const [imageError, setImageError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: post || {
            status: "false",
        },
    });

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setImageError(""); // Xóa lỗi nếu đã chọn ảnh

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file) => {
        if (!file) return null;
        const storageRef = ref(storage, `posts/${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const onSubmit = async (data) => {
        try {
            let imageUrl = imagePreview;

            // Nếu có ảnh mới, upload ảnh lên Firebase
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            // Nếu không có ảnh (và đang tạo bài viết mới), báo lỗi
            if (!imageUrl) {
                setImageError("Ảnh không được để trống");
                Swal.fire("Lỗi!", "Vui lòng chọn một ảnh trước khi gửi!", "error");
                return;
            }

            const postData = { ...data, image: imageUrl };

            if (post) {
                await PostService.updatePost(post.id, postData);
                Swal.fire("Thành công!", "Bài viết đã được cập nhật.", "success");
            } else {
                await PostService.createPost(postData);
                Swal.fire("Thành công!", "Bài viết đã được tạo.", "success");

                // Reset form sau khi tạo bài viết
                setImagePreview(null);
                setImageFile(null);
                setImageError("");
            }
        } catch (error) {
            Swal.fire("Lỗi!", "Có lỗi xảy ra, vui lòng thử lại!", "error");
            console.error("Lỗi khi gửi bài viết:", error);
        }
    };


    return (
        <div className="h-full bg-white p-6">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="h-full grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* Hình ảnh */}
                <div className="w-full flex justify-center">
                    <div className="relative w-full h-[400px]">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                        />
                        <label
                            htmlFor="image-upload"
                            className="cursor-pointer block w-full h-full rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors duration-300"
                        >
                            <div className="w-full h-full rounded-lg overflow-hidden relative">
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
                        {imageError && (
                            <p className="text-red-500 text-sm mt-2">{imageError}</p>
                        )}
                    </div>
                </div>

                {/* Form nhập bài viết */}
                <div className="flex flex-col space-y-4">
                    {/* Tiêu đề bài viết */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Tiêu đề bài viết
                        </label>
                        <input
                            {...register("title")}
                            placeholder="Nhập Tiêu Đề Bài Viết"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.title && (
                            <span className="text-red-500 text-sm">{errors.title.message}</span>
                        )}
                    </div>

                    {/* Trạng thái */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Trạng Thái
                        </label>
                        <select
                            {...register("status")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="false">Còn hoạt động</option>
                            <option value="true">Hết hoạt động</option>
                        </select>
                        {errors.status && (
                            <span className="text-red-500 text-sm">{errors.status.message}</span>
                        )}
                    </div>

                    {/* Nội dung bài viết */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Nội dung bài viết
                        </label>
                        <textarea
                            {...register("content")}
                            placeholder="Nhập Nội Dung Bài Viết"
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                        {errors.content && (
                            <span className="text-red-500 text-sm">{errors.content.message}</span>
                        )}
                    </div>

                    {/* Nút submit */}
                    <div className="mt-auto">
                        <button
                            type="submit"
                            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            {post ? "Cập Nhật Bài Viết" : "Tạo Bài Viết"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PostInput;
