import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../../services/CartService';
import Swal from 'sweetalert2';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

const ProductCard = ({ product, index }) => {
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        const userId = JSON.parse(localStorage.getItem('UserId')); // Get userId from localStorage

        if (!userId) {
            Swal.fire({
                title: 'Thông báo',
                text: 'Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng',
                icon: 'warning',
                confirmButtonText: 'Đăng nhập'
            }).then(() => {
                navigate('/login');
            });
            return;
        }

        try {
            await addProductToCart(userId, product.id, 1); // Pass userId first, then productId and quantity
            Swal.fire({
                title: 'Thành công',
                text: 'Thêm vào giỏ hàng thành công!',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Xem giỏ hàng',
                cancelButtonText: 'Tiếp tục mua sắm'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/cart');
                }
            });
        } catch (error) {
            Swal.fire('Lỗi',
                'Lỗi khi thêm sản phẩm vào giỏ hàng',
                'error');
        }
    };

    // Check if the product is out of stock
    const isOutOfStock = product.stock === 0;

    return (
        <div className={`bg-white p-4 rounded shadow-md hover:scale-105 transform transition duration-300 w-full ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Link to={`/product/${product.id}`}>
                <div className="flex justify-center items-center">
                    <img
                        src={product.imageUrl || `https://placehold.co/200x200?text=Product+Image+${index + 1}`}
                        alt={product.name || `Product Image ${index + 1}`}
                        className="h-48 object-cover mb-4"
                    />
                </div>
            </Link>
            <h3 className="text-sm font-bold mb-2">{product.name}</h3>
            <div className="text-sm text-gray-600 mb-2">{formatPrice(product.price)}</div>
            <div className={`text-sm font-bold mb-2 ${isOutOfStock ? 'text-red-500' : 'text-orange-500'}`}>
                {isOutOfStock ? 'Hết hàng' : `Còn lại: ${product.stock}`}
            </div>
            <div className="flex items-center justify-center mt-4">
                <button
                    onClick={handleAddToCart}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-200 ease-in-out"
                    disabled={isOutOfStock} // Disable button if out of stock
                >
                    {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
