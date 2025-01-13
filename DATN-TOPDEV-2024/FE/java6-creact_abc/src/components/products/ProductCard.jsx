import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../../services/CartService';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faHeart, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';


const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

const ProductCard = ({ product, index }) => {
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        const userId = localStorage.getItem('UserId'); // Lấy userId từ localStorage
        const role = localStorage.getItem('role'); // Lấy role từ localStorage

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

        if (role === 'ADMIN') {
            Swal.fire({
                title: 'Thông báo',
                text: 'Quản trị viên không được phép thêm sản phẩm vào giỏ hàng',
                icon: 'info',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            await addProductToCart(userId, product.id, 1); // Thêm sản phẩm vào giỏ hàng
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
            Swal.fire('Lỗi', 'Lỗi khi thêm sản phẩm vào giỏ hàng', 'error');
        }
    };


    const handleFavorite = () => {
        // Implement the logic for adding the product to favorites
        Swal.fire({
            title: 'Thông báo',
            text: 'Sản phẩm đã được thêm vào danh sách yêu thích',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    };

    const handleShowProductDetails = () => {
        // Logic for viewing product details can go here
        navigate(`/products/${product.id}/productdetail`);
    };

    // Check if the product is out of stock
    const isOutOfStock = product.stock === 0;

    return (
        <div
            className={`bg-white p-4 rounded shadow-md w-full relative overflow-hidden ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
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
            {/*<div className={`text-sm font-bold mb-2 ${isOutOfStock ? 'text-red-500' : 'text-orange-500'}`}>*/}
            {/*    {isOutOfStock ? 'Hết hàng' : `Còn lại: ${product.stock}`}*/}
            {/*</div>*/}

            {/* Hover Effect for Icons */}
            <div
                className={`absolute top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-0 hover:opacity-60 transition-opacity duration-300 flex justify-center items-center space-x-4 ${isOutOfStock ? 'pointer-events-none' : ''}`}
            >
                <FontAwesomeIcon
                    icon={faCartPlus}
                    className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-900"
                    onClick={handleAddToCart}
                />
                <FontAwesomeIcon
                    icon={faHeart}
                    className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-red-900"
                    onClick={handleFavorite}
                />
                {/* Exclamation Icon */}
                <FontAwesomeIcon
                    icon={faExclamationCircle}
                    className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-yellow-900"
                    onClick={handleShowProductDetails}
                />
            </div>
        </div>
    );
};

export default ProductCard;