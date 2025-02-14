import React from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../../services/CartService';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faHeart, faExclamationCircle, faStar } from '@fortawesome/free-solid-svg-icons';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

const ProductCard = ({ variant, index }) => {
    const navigate = useNavigate();
    const isOutOfStock = variant.quantity === 0;

    const handleAddToCart = async () => {
        const userId = localStorage.getItem('UserId');
        const role = localStorage.getItem('role');

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
            await addProductToCart(userId, variant.id, 1);
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
            Swal.fire('Lỗi', 'Số lượng sản phẩm không đủ', 'error');
        }
    };

    const handleFavorite = () => {
        Swal.fire({
            title: 'Thông báo',
            text: 'Sản phẩm đã được thêm vào danh sách yêu thích',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    };

    const   handleShowProductDetails = () => {
        navigate(`/products/${variant.product.id}/productdetail`);
    };

    return (
        <div
            className={`relative bg-white p-4 border shadow-md overflow-hidden group ${isOutOfStock ? 'opacity-50' : ''}`}>
            <div className="relative cursor-pointer" onClick={!isOutOfStock ? handleShowProductDetails : undefined}>
                <img
                    src={variant.image || `https://placehold.co/200x200?text=Variant+Image+${index + 1}`}
                    alt={variant.name || `Variant Image ${index + 1}`}
                    className="h-64 w-full object-cover rounded-lg"
                />
                {isOutOfStock && (
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-red-800 font-bold text-lg">
                        HẾT HÀNG
                    </div>
                )}
            </div>
            {variant.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{variant.discount}%
                </span>
            )}
            <h3 className="text-sm font-bold mt-3">{variant.nameVariants}</h3>
            <div className="text-sm font-bold text-red-500">{formatPrice(variant.price)}</div>
             <div className="text-sm font-bold text-red-500 hidden">{variant.product.brand.name}</div>
            <div className="text-sm font-bold text-red-500 hidden">{variant.product.category.name}</div>
            <div className="flex mt-2">
                <button className="text-gray-500 hover:text-red-500" onClick={handleFavorite}>
                    <FontAwesomeIcon icon={faHeart}/>
                </button>
                <button className="text-gray-500 p-2 hover:text-orange-500" onClick={handleShowProductDetails}>
                    <FontAwesomeIcon icon={faExclamationCircle}/>
                </button>
            </div>
            <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 mr-1"/>
                ))}
            </div>
            <button
                className="w-full mt-3 px-4 py-2 text-xs font-bold bg-white text-black  shadow opacity-100 hover:bg-gray-100 transition"
                onClick={handleAddToCart}
            >
                <FontAwesomeIcon icon={faCartPlus}/> THÊM VÀO GIỎ HÀNG
            </button>
        </div>
    );
};

export default ProductCard;
