// CartItem.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';


const CartItem = ({ item, onUpdateQuantity, onDelete, onSelectChange, isSelected }) => {

    const [quantity, setQuantity] = useState(item.quantity);
    const [productStock, setProductStock] = useState(null);

    useEffect(() => {
        const fetchProductStock = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/products/${item.productId}`);
                setProductStock(response.data.stock);
            } catch (error) {
                console.error('Error fetching product stock:', error);
            }
        };

        fetchProductStock();
    }, [item.productId]);

    useEffect(() => {
        setQuantity(item.quantity);
    }, [item.quantity]);

    const handleQuantityChange = (newQuantity) => {
        if (productStock === null) {
            console.warn('Stock data is not loaded yet.');
            return;
        }

        if (newQuantity < 1) {
            Swal.fire({
                icon: 'warning',
                title: 'Số lượng không hợp lệ!',
                text: 'Số lượng tối thiểu là 1.',
                confirmButtonText: 'Đóng',
            });
            return;
        }

        if (newQuantity > productStock) {
            Swal.fire({
                icon: 'warning',
                title: 'Số lượng vượt quá giới hạn!',
                text: `Chỉ còn ${productStock} sản phẩm trong kho.`,
                confirmButtonText: 'Đóng',
            });
            return;
        }

        setQuantity(newQuantity);
        onUpdateQuantity(item.productId, newQuantity);
    };

    const handleCheckboxChange = () => {
        onSelectChange(item.productId, !isSelected);
    };

    const price = item.productPrice || 0;
    const imageUrl = item.productImageUrl || 'https://placehold.co/50x50';
    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    return (
        <div className="grid grid-cols-7 gap-4 items-center mt-4">
            <div>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    className="w-5 h-5"
                />
            </div>
            <div className="col-span-2 flex items-center">
                <img src={imageUrl} alt={item.productName} className="w-12 h-12 mr-4" />
                <span>{item.productName}</span>
            </div>
            <div>{formatCurrency(price)}</div>
            <div className="flex items-center">
                <button className="px-2 py-1 border" onClick={() => handleQuantityChange(quantity - 1)}>
                    -
                </button>
                <input
                    type="text"
                    value={quantity}
                    className="w-12 text-center border mx-2"
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                />
                <button className="px-2 py-1 border" onClick={() => handleQuantityChange(quantity + 1)}>
                    +
                </button>
            </div>
            <div>{formatCurrency(price * quantity)}</div>
            <div>
                <button className="bg-red-500 text-white items-center px-5 py-1 rounded" onClick={() => onDelete(item.productId)}>
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default CartItem;