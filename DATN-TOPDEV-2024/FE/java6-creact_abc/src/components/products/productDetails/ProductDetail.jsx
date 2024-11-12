import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductService from "../../../servies/ProductService";

const ProductDetails = () => {
    const { productId } = useParams(); // Lấy productId từ URL
    const [product, setProduct] = useState(null);
    const [brand, setBrand] = useState(null); // Thông tin thương hiệu
    const [variants, setVariants] = useState([]); // Danh sách các variant
    const [selectedVariant, setSelectedVariant] = useState(null); // Variant đã chọn
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch product details, brand, and variants when productId changes
        const fetchProductDetails = async () => {
            try {
                const fetchedProduct = await ProductService.getProductById(productId); // Lấy thông tin sản phẩm
                setProduct(fetchedProduct);

                // Lấy thông tin thương hiệu
                const fetchedBrand = await ProductService.getBrandByProductId(productId);
                setBrand(fetchedBrand);

                // Lấy danh sách các variant của sản phẩm
                const fetchedVariants = await ProductService.getProductVariants(productId);
                setVariants(fetchedVariants);
                setSelectedVariant(fetchedVariants[0]); // Chọn variant đầu tiên làm mặc định

                setLoading(false); // Kết thúc loading
            } catch (err) {
                setError('Error fetching product details');
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]); // Fetch lại dữ liệu khi productId thay đổi

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant); // Cập nhật variant đã chọn
    };

    // Format the price only if product and selectedVariant are not null
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(selectedVariant ? selectedVariant.price : (product ? product.price : 0));


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="flex justify-center p-10">
            <div className="flex w-full max-w-6xl">
                {/* Hình ảnh sản phẩm */}
                <div className="w-1/2">
                    {/* Hiển thị hình ảnh của variant đã chọn, nếu chưa chọn thì mặc định là ảnh của sản phẩm */}
                    <img
                        src={selectedVariant ? selectedVariant.image : product.imageUrl}
                        alt={product.name}
                        className="w-full"
                    />
                </div>

                {/* Chi tiết sản phẩm */}
                <div className="w-1/2 pl-10">
                    {/* Tên sản phẩm */}
                    <h1 className="text-3xl font-semibold leading-tight">
                        {product.name}
                    </h1>

                    {/* Thương hiệu và SKU */}
                    <div className="text-sm text-gray-500 mt-2">
                        Brand: <span className="text-blue-500">{brand ? brand.name : 'N/A'}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">SKU: {product.sku || 'N/A'}</div>

                    {/* Tùy chọn màu sắc */}
                    <div className="mt-4">
                        <h2 className="text-md font-semibold">Color:</h2>
                        <div className="flex space-x-2 mt-2">
                            {variants.map((variant, index) => (
                                <button
                                    key={index}
                                    className={`px-4 py-2 border rounded-lg ${selectedVariant === variant ? 'border-blue-500' : ''}`}
                                    onClick={() => handleVariantChange(variant)} // Cập nhật variant khi chọn màu
                                >
                                    {variant.color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tùy chọn phiên bản */}
                    <div className="mt-4">
                        <h2 className="text-md font-semibold">Version:</h2>
                        <div className="flex space-x-2 mt-2">
                            {variants.map((variant, index) => (
                                <button
                                    key={index}
                                    className={`px-4 py-2 border rounded-lg ${selectedVariant === variant ? 'border-blue-500' : ''}`}
                                    onClick={() => handleVariantChange(variant)} // Cập nhật variant khi chọn phiên bản
                                >
                                    {variant.versions}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price and Discount */}
                    <div className="mt-4">
                        <span className="text-2xl text-blue-600 font-bold">
                            {formattedPrice.replace('₫', '')} VND
                        </span>
                    </div>

                    {/* Mô tả sản phẩm */}
                    <p className="mt-4 text-gray-600">{product.description}</p>

                    {/* Thông tin tồn kho */}
                    <p className="mt-4 text-sm">Còn lại: {selectedVariant ? selectedVariant.quantity : product.stock}</p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
