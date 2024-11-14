import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Helper function to format price in VND without the currency symbol
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

const ProductCard = ({ product, index, userId }) => {
    // State để quản lý giỏ hàng trong session
    const [cart, setCart] = useState(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        return savedCart;
    });

    // Hàm thêm sản phẩm vào giỏ hàng
    const handleAddToCart = () => {
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingProduct = cart.find(item => item.id === product.id);

        if (existingProduct) {
            // Nếu có, cập nhật số lượng sản phẩm
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            // Nếu chưa, thêm sản phẩm mới vào giỏ hàng
            setCart([...cart, { ...product, quantity: 1 }]);
        }

        // Lưu giỏ hàng vào localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Gửi request đến BE để cập nhật giỏ hàng trong cơ sở dữ liệu
        addToCartBackend(userId, product.id);
    };

    // Gửi request thêm sản phẩm vào giỏ hàng của người dùng
    const addToCartBackend = (userId, productId) => {
        fetch('http://localhost:8080/api/cartdetail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                product_id: productId,
                quantity: 1, // mặc định mỗi lần thêm 1 sản phẩm
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Sản phẩm đã được thêm vào giỏ hàng:', data);
            })
            .catch(error => {
                console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
            });
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
