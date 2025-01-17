import React, { useState, useEffect } from 'react';
import CategoryService from '../../../../services/CategoryService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../firebase.config';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const checkUniqueName = async (name, categoryId) => {
    try {
        const allCategories = await CategoryService.getAllCategories();

        if (categoryId) {
            // Editing: check for duplicates excluding current category
            return !allCategories.some(
                category => category.name === name && category.id !== categoryId
            );
        } else {
            // Creating new: check against all categories
            return !allCategories.some(category => category.name === name);
        }
    } catch (error) {
        console.error('Error checking category name uniqueness:', error);
        return false;
    }
};

const schema = yup.object().shape({
    name: yup
        .string()
        .required('Tên danh mục là bắt buộc')
        .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
        .test(
            'unique-name',
            'Tên danh mục đã tồn tại!',
            async (value, context) => {
                const categoryId = context.parent.id || null;
                return await checkUniqueName(value, categoryId);
            }
        ),
    description: yup
        .string()
        .required('Mô tả là bắt buộc')
        .min(10, 'Mô tả phải có ít nhất 10 ký tự'),
});

const CategoryInput = ({ category, onSave = () => {} }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: category || {
            id: null, // Add this
            name: '',
            description: '',
            image: ''
        }
    });

    useEffect(() => {
        if (category) {
            setValue('id', category.id); // Add this
            setValue('name', category.name || '');
            setValue('description', category.description || '');
            setValue('image', category.image || '');
            setImagePreview(category.image || '');
        }
    }, [category, setValue]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const previewURL = URL.createObjectURL(file);
            setImagePreview(previewURL);
            setValue('image', file);
        }
    };

    const uploadImage = async (file) => {
        if (!file) return null;
        const fileRef = ref(storage, `categories/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            let imageUrl = data.image;

            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            }

            const updatedData = {
                ...data,
                image: imageUrl,
            };

            if (category) {
                await CategoryService.updateCategory(category.id, updatedData);
            } else {
                await CategoryService.createCategory(updatedData);
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
        reset();
        setSelectedImage(null);
        setImagePreview('');
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-full mx-auto bg-white rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    {category ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                        {/* Tên danh mục */}
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                                Tên Danh Mục
                            </label>
                            <input
                                id="name"
                                {...register('name')}
                                placeholder="Nhập Tên Danh Mục"
                                className={`w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                ${errors.name ? 'border-red-500' : ''}`}
                            />
                            {errors.name && (
                                <div className="text-red-500 text-sm mt-1">{errors.name.message}</div>
                            )}
                        </div>

                        {/* Mô tả */}
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                                Mô Tả
                            </label>
                            <input
                                id="description"
                                {...register('description')}
                                placeholder="Nhập Mô Tả"
                                className={`w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500
                                ${errors.description ? 'border-red-500' : ''}`}
                            />
                            {errors.description && (
                                <div className="text-red-500 text-sm mt-1">{errors.description.message}</div>
                            )}
                        </div>

                        {/* Input cho ảnh */}
                        <div className="w-full flex justify-center">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer block w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors duration-300"
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
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Nút */}
                    <div className="flex space-x-2 mt-6 justify-start">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`${
                                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        >
                            {loading ? 'Đang xử lý...' : category ? 'Lưu Thay Đổi' : 'Thêm Danh Mục'}
                        </button>

                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={loading}
                            className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Làm mới
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryInput;