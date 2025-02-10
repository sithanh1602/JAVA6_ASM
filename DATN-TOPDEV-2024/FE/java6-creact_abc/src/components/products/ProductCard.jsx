import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../../services/CartService';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@nextui-org/react';
import { faCartPlus, faHeart, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

const ProductCard = ({ variant, index }) => {
    const navigate = useNavigate();
    console.log(variant);
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
            Swal.fire('Lỗi', 'Lỗi khi thêm sản phẩm vào giỏ hàng', 'error');
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

    const handleShowProductDetails = () => {
        navigate(`/products/${variant.product.id}/productdetail`);
    };

    const isOutOfStock = variant.stock === 0;

    return (
        <div
            className={`bg-white p-4 rounded shadow-md w-full relative overflow-hidden ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="flex justify-center items-center" onClick={handleShowProductDetails}>
                    <img
                        src={variant.image || `https://placehold.co/200x200?text=Variant+Image+${index + 1}`}
                        alt={variant.name || `Variant Image ${index + 1}`}
                        className="h-48 object-cover mb-4"
                    />
                </div>
            <h3 className="text-sm font-bold mb-2">{variant.nameVariants}</h3>
            <div className="text-sm text-gray-600 mb-2">{formatPrice(variant.price)}</div>
            <div className={`text-sm font-bold mb-2 ${isOutOfStock ? 'text-red-500' : 'text-orange-500'}`}>
                {isOutOfStock ? 'Hết hàng' : `Còn lại: ${variant.quantity}`}
            </div>
            <div className=" justify-center items-center mt-3">
                <Button color="warning" onClick={handleAddToCart}>
                    <FontAwesomeIcon icon={faCartPlus}/> Thêm vào giỏ
                </Button>
            </div>
            <div className=" justify-center items-center space-x-4 mt-3">
                <Button color="danger" onClick={handleFavorite}>
                    <FontAwesomeIcon icon={faHeart}/>
                </Button>
                <Button color="primary"
                        onClick={handleShowProductDetails}>
                    <FontAwesomeIcon icon={faExclamationCircle}/>
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;
