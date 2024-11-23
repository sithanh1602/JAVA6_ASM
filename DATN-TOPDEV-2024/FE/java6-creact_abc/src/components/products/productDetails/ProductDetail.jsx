import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductService from "../../../services/ProductService";

const ProductDetails = () => {
    const { productId } = useParams(); // Lấy productId từ URL
    const [product, setProduct] = useState(null);
    const [brand, setBrand] = useState(null); // Thông tin thương hiệu
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch product details and brand when productId changes
        const fetchProductDetails = async () => {
            try {
                const fetchedProduct = await ProductService.getProductById(productId); // Lấy thông tin sản phẩm
                setProduct(fetchedProduct);

                // Lấy thông tin thương hiệu
                const fetchedBrand = await ProductService.getBrandByProductId(productId);
                setBrand(fetchedBrand);

                setLoading(false); // Kết thúc loading
            } catch (err) {
                setError('Error fetching product details');
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]); // Fetch lại dữ liệu khi productId thay đổi

    // Format the price only if product is not null
    const formattedPrice = product
        ? new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(product.price)
        : '';

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
                    {/* Hiển thị hình ảnh của sản phẩm */}
                    <img
                        src={product.imageUrl}
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

                    {/* Giá */}
                    <div className="mt-4">
                        <span className="text-2xl text-blue-600 font-bold">
                            {formattedPrice.replace('₫', '')} VND
                        </span>
                    </div>

                    {/*/!* Mô tả sản phẩm *!/*/}
                    {/*<p className="mt-4 text-gray-600">{product.description}</p>*/}

                    {/* Thông tin tồn kho */}
                    <p className="mt-4 text-sm">Còn lại: {product.stock}</p>

                    {/* Thêm vào giỏ hàng */}
                    <div className="flex items-center justify-center mt-4">
                        <button
                            disabled={product.stock === 0} // Vô hiệu hóa nút khi hết hàng
                            className={`${
                                product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                            } text-white px-4 py-2 rounded transition duration-200 ease-in-out`}>
                            {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
