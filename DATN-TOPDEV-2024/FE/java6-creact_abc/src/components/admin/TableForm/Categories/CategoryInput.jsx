import React, { useState, useEffect } from 'react';
import CategoryService from '../../../../services/CategoryService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../firebase.config'; // Đường dẫn tới file config của bạn

const CategoryInput = ({ category, onSave = () => {} }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '', // Thêm trường image
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setFormData(category);
        }
    }, [category]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    // Xử lý khi người dùng chọn file
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    // Hàm upload ảnh lên Firebase Storage
    const uploadImage = async (file) => {
        if (!file) return null;

        const fileRef = ref(storage, `categories/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        return downloadURL;
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            let image = formData.image;

            // Upload ảnh mới nếu có
            if (selectedImage) {
                image = await uploadImage(selectedImage);
            }

            const updatedFormData = {
                ...formData,
                image: image,
            };

            if (category) {
                await CategoryService.updateCategory(category.id, updatedFormData);
            } else {
                await CategoryService.createCategory(updatedFormData);
            }

            onSave();
            handleClear();
        } catch (error) {
            console.error('Lỗi khi thêm hoặc sửa danh mục:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            name: '',
            description: '',
            image: '',
        });
        setSelectedImage(null);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-full mx-auto bg-white rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    {category ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục'}
                </h2>
                <div className="flex flex-wrap gap-4">
                    {/* Tên danh mục */}
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                            Tên Danh Mục
                        </label>
                        <input
                            id="name"
                            placeholder="Nhập Tên Danh Mục"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Mô tả */}
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                            Mô Tả
                        </label>
                        <input
                            id="description"
                            placeholder="Nhập Mô Tả"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Input cho ảnh */}
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Hình Ảnh
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {formData.image && (
                            <img
                                src={formData.image}
                                alt="Preview"
                                className="mt-2 h-32 object-cover rounded-md"
                            />
                        )}
                    </div>
                </div>

                {/* Nút */}
                <div className="flex space-x-2 mt-6 justify-start">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`${
                            loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                        } text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                        {loading ? 'Đang xử lý...' : category ? 'Lưu Thay Đổi' : 'Thêm Danh Mục'}
                    </button>

                    <button
                        onClick={handleClear}
                        disabled={loading}
                        className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Làm mới
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryInput;