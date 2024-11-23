import React, { useState, useEffect } from 'react';
import { storage } from '../../../../firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProductService from '../../../../services/ProductService';
import CategoryService from '../../../../services/CategoryService';
import BrandService from '../../../../services/BrandService';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const checkUniqueName = async (name, productId) => {
    try {
        const allProducts = await ProductService.getAllProducts();

        if (productId) {
            // Đang sửa: kiểm tra trùng với sản phẩm khác (không phải chính nó)
            return !allProducts.some(
                product => product.name === name && product.id !== productId
            );
        } else {
            // Đang thêm mới: kiểm tra trùng với tất cả sản phẩm
            return !allProducts.some(product => product.name === name);
        }
    } catch (error) {
        console.error('Error checking product name uniqueness:', error);
        return false;
    }
};

const schema = yup.object().shape({
    name: yup
        .string()
        .required('Bắt buộc nhập tên sản phẩm')
        .test(
            'unique-name',
            'Tên sản phẩm đã tồn tại!',
            async (value, context) => {
                const productId = context.parent.id || null;
                return await checkUniqueName(value, productId);
            }
        ),
    description: yup.string().required('Bắt buộc nhập mô tả sản phẩm'),
    stock: yup
        .number()
        .required('Bắt buộc nhập số lượng')
        .typeError('Số lượng phải là số')
        .min(0, 'Số lượng không thể là số âm'),
    price: yup
        .number()
        .required('Bắt buộc nhập giá')
        .typeError('Giá phải là số')
        .min(0, 'Giá không thể là số âm'),
    categoryId: yup.string().required('Danh mục là bắt buộc'),
    brandId: yup.string().required('Thương hiệu là bắt buộc'),
    status: yup.string().required('Trạng thái là bắt buộc')
});

const ProductInput = ({ product, onSave }) => {
    const [imageFile, setImageFile] = useState('');
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [imagePreview, setImagePreview] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: product || {
            name: '',
            description: '',
            stock: '',
            price: '',
            categoryId: '',
            brandId: '',
            status: 'Available',
        }
    });

    useEffect(() => {
        Promise.all([fetchCategories(), fetchBrands()]).then(() => {
            if (product) {
                const categoryId = product.category?.id || product.category?.categoryId || '';
                const brandId = product.brand?.brandsId || product.brand?.id || '';

                reset({
                    id: product.id, // Thêm id vào để validation biết đang edit
                    name: product.name,
                    description: product.description,
                    stock: product.stock,
                    price: product.price,
                    categoryId: categoryId,
                    brandId: brandId,
                    status: product.status
                });
                setImagePreview(product.imageUrl);
            }
        });
    }, [product, reset]);

    const fetchCategories = async () => {
        try {
            const data = await CategoryService.getAllCategories();
            setCategories(data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch categories!'
            });
        }
    };

    const fetchBrands = async () => {
        try {
            const data = await BrandService.getAllBrands();
            setBrands(data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch brands!'
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const onSubmit = async (data) => {
        try {
            let imageUrl = product?.imageUrl || '';

            if (imageFile) {
                const imageRef = ref(storage, `product-images/${imageFile.name}`);
                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            const productData = {
                ...data,
                id: product?.id || null,
                imageUrl,
                category: {
                    id: data.categoryId,
                    name: categories.find(c => c.id === data.categoryId)?.name
                },
                brand: {
                    brandsId: data.brandId,
                    name: brands.find(b => b.brandsId === data.brandId)?.name
                },
            };

            if (product) {
                await ProductService.updateProduct(product.id, productData);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Product updated successfully!'
                });
            } else {
                await ProductService.createProduct(productData);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Product created successfully!'
                });
            }

            onSave();
        } catch (error) {
            if (error.response && error.response.data) {
                const backendErrors = error.response.data;
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please check the form for errors',
                    html: Object.values(backendErrors).join('<br>')
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'An unexpected error occurred'
                });
            }
        }
    };

    return(
        <div className="h-full bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="h-full grid grid-cols-2 gap-8">
                {/* Left Column - Image Upload */}
                <div className="flex flex-col">
                    <div className="relative w-full h-[400px]">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-[500px] object-cover rounded-lg shadow-md"
                            />
                        ) : (
                            <div
                                className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
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
                            className="absolute bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </label>
                    </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="flex flex-col space-y-4">
                    {/* Product Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                        <input
                            {...register('name', {required: true})}
                            placeholder="Nhập Tên Sản Phẩm"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                    </div>

                    {/* Price and Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Giá Sản Phẩm</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    {...register('price', {required: true, min: 0})}
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            {errors.price && <span className="text-red-500 text-sm">{errors.price.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Tồn Kho</label>
                            <input
                                {...register('stock', {required: true, min: 0})}
                                type="number"
                                placeholder="Nhập Số Lượng"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.stock && <span className="text-red-500 text-sm">{errors.stock.message}</span>}
                        </div>
                    </div>

                    {/* Status and Category */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Category - Left side */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Loại Sản Phẩm</label>
                            <select
                                {...register('categoryId')}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                                    errors.categoryId ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Chọn Loại Sản Phẩm</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
                        </div>

                        {/* Brand - Right side */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Thương Hiệu Sản Phẩm</label>
                            <select
                                {...register('brandId')}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                                    errors.brandId ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Chọn Thương Hiệu</option>
                                {brands.map(brand => (
                                    <option key={brand.brandsId} value={brand.brandsId}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                            {errors.brandId && <p className="text-red-500 text-sm">{errors.brandId.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Trạng Thái</label>
                        <select
                            {...register('status')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Available">Còn Hàng</option>
                            <option value="Unavailable">Hết Hàng</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Mô Tả</label>
                        <textarea
                            {...register('description')}
                            placeholder="Nhập Mô Tả Sản Phẩm"
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mt-auto">
                        <button
                            type="submit"
                            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            {product ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
        ;
};

export default ProductInput;