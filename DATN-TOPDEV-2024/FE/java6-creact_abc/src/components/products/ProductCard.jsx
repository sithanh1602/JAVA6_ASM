import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../../services/CartService';
// Helper function to format price in VND without the currency symbol
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

const ProductCard = ({ product, index }) => {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        const userId = JSON.parse(localStorage.getItem('UserId')); // Lấy userId từ localStorage

        if (!userId) {
            setMessage('Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng');
            setTimeout(() => navigate('/login'), 1500); // Chuyển hướng đến trang đăng nhập sau 1.5 giây
            return;
        }

        try {
            await addProductToCart(userId, product.id, 1); // Truyền userId trước, sau đó là productId và quantity
            setMessage('Thêm vào giỏ hàng thành công!');
        } catch (error) {
            setMessage('Lỗi khi thêm sản phẩm vào giỏ hàng');
        }
    };

    // Check if the product is out of stock
    const isOutOfStock = product.stock === 0;

    return (
// <<<<<<< Updated upstream
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
{/*=======*/}
{/*        <div className="bg-white p-4 rounded shadow w-full">*/}
{/*            <div className="flex justify-center items-center">*/}
{/*                <img*/}
{/*                    src={product.imageUrl || `https://placehold.co/200x200?text=Product+Image+${index + 1}`}*/}
{/*                    alt={product.name || `Product Image ${index + 1}`}*/}
{/*                    className="h-48 object-cover mb-4"*/}
{/*                />*/}
{/*            </div>*/}
{/*            <h3 className="text-sm font-bold mb-2">{product.name}</h3>*/}
{/*            <div className="text-sm text-gray-600 mb-2">{product.price} VND</div>*/}
{/*            <div className="text-sm text-orange-500 font-bold mb-2">Còn lại: {product.stock}</div>*/}
{/*>>>>>>> Stashed changes*/}
            <div className="flex items-center justify-center mt-4">
                <button
                    onClick={handleAddToCart}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-200 ease-in-out"
                    disabled={isOutOfStock} // Disable button if out of stock
                >
                    {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </button>
            </div>
            {message && <div className={`mt-2 ${message.includes('Lỗi') ? 'text-red-500' : 'text-green-500'}`}>{message}</div>}
        </div>
    );
};

export default ProductCard;
