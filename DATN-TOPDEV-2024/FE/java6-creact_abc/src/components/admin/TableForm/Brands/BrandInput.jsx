import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import BrandService from '../../../../services/BrandService';
import { storage } from '../../../../firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Xác thực dữ liệu form
const schema = yup.object().shape({
    name: yup.string().required('Bắt buộc nhập tên thương hiệu'),
    contactInfo: yup.string().required('Bắt buộc nhập thông tin liên hệ'),
});

const BrandInput = ({ brand, onSave }) => {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageError, setImageError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [nameError, setNameError] = useState(''); // Lỗi từ server cho tên thương hiệu

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: brand?.name || '',
            contactInfo: brand?.contactInfo || '',
        },
    });

    useEffect(() => {
        if (brand) {
            reset({
                name: brand.name,
                contactInfo: brand.contactInfo,
            });
            setImagePreview(brand.image || '');
        }
    }, [brand, reset]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setImageError('');
        }
    };

    const onSubmit = async (data) => {
        try {
            setNameError(''); // Reset lỗi name trước khi xử lý
            setImageError(''); // Reset lỗi ảnh
            if (!imageFile && !brand?.image) {
                setImageError('Bắt buộc chọn ảnh!');
                return;
            }

            setUploadingImage(true);
            let imageUrl = brand?.image || '';

            if (imageFile) {
                const timestamp = new Date().getTime();
                const fileName = `brand-${timestamp}-${imageFile.name}`;
                const imageRef = ref(storage, `brand-images/${fileName}`);

                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            const brandData = {
                name: data.name,
                contactInfo: data.contactInfo,
                image: imageUrl,
            };

            let result;
            if (brand?.id || brand?.brandsId) {
                const brandId = brand.id || brand.brandsId;
                result = await BrandService.updateBrand(brandId, brandData);
            } else {
                result = await BrandService.createBrand(brandData);
            }

            if (onSave && result) {
                onSave(result);
            }
        } catch (error) {
            console.error('Error:', error);

            const errorMessage = error.response?.data?.message || 'Tên thương hiệu đã tồn tại';
            const errorStatus = error.response?.status;

            if (errorStatus === 400 || errorStatus === 409) {
                // Lỗi trùng lặp hoặc dữ liệu không hợp lệ
                setNameError('Tên thương hiệu đã tồn tại, vui lòng chọn tên khác.');
            } else {
                setNameError(`Lỗi: ${errorMessage}`);
            }
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8">
                {/* Image Upload */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Brand Preview"
                                className="w-48 h-48 object-cover rounded-lg shadow-md"
                            />
                        ) : (
                            <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">Chưa có ảnh được chọn</span>
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="hidden"
                            id="file-upload"
                            accept="image/*"
                        />
                        <label
                            htmlFor="file-upload"
                            className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </label>
                    </div>
                    {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Brand Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tên Thương Hiệu</label>
                        <input
                            {...register('name')}
                            placeholder="Nhập tên thương hiệu"
                            onChange={(e) => {
                                register('name').onChange(e); // React-hook-form xử lý
                                setNameError(''); // Reset lỗi khi có thay đổi
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                                errors.name || nameError ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Thông Tin Liên Hệ</label>
                        <input
                            {...register('contactInfo')}
                            placeholder="Nhập thông tin liên hệ"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                                errors.contactInfo ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.contactInfo && <p className="text-red-500 text-sm">{errors.contactInfo.message}</p>}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={uploadingImage}
                    >
                        {uploadingImage ? 'Đang xử lý...' : brand?.id ? 'Cập Nhật Thương Hiệu' : 'Tạo Thương Hiệu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BrandInput;
