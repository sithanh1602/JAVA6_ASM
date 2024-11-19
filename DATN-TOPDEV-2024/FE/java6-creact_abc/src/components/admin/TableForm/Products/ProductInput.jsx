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

const schema = yup.object().shape({
    name: yup
        .string()
        .required('Bắt buộc nhập tên sản phẩm')
        .test('unique-name', 'Tên sản phẩm đã tồn tại', async function(value) {
            if (!value) return true;
            try {
                const products = await ProductService.getAllProducts();
                const existingProduct = products.find(
                    p => p.name.toLowerCase() === value.toLowerCase() &&
                        (!this.parent.id || p.id !== this.parent.id)
                );
                return !existingProduct;
            } catch (error) {
                return true;
            }
        }),
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
        defaultValues: {
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
        fetchCategories();
        fetchBrands();
        if (product) {
            reset({
                name: product.name,
                description: product.description,
                stock: product.stock,
                price: product.price,
                categoryId: product.category.id,
                brandId: product.brand.brandsId,
                status: product.status
            });
            setImagePreview(product.imageUrl);
        }
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
                imageUrl,
                category: { id: data.categoryId },
                brand: { brandsId: data.brandId },
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

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </label>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                        <input
                            {...register('name')}
                            placeholder="Nhập Tên Sản Phẩm"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Giá Sản Phẩm</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                {...register('price')}
                                type="number"
                                placeholder="0.00"
                                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                                    errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                        </div>
                        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tồn Kho</label>
                        <input
                            {...register('stock')}
                            type="number"
                            placeholder="Nhập Số Lượng"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                                errors.stock ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
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

                {/* Description */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Mô Tả</label>
                    <textarea
                        {...register('description')}
                        placeholder="Nhập Mô Tả Sản Phẩm"
                        rows={4}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                            errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition-colors"
                    >
                        {product ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductInput;