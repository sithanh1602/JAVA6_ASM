import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const CartItem = ({ item, onUpdateQuantity, onDelete, onSelectChange, isSelected }) => {
    const [quantity, setQuantity] = useState(item.quantity);
    const [productQuantity, setProductQuantity] = useState(null);

    useEffect(() => {
        const fetchProductQuantity = async () => {
            try {
                // Thay {id} bằng item.product_variant_id
                const response = await axios.get(`http://localhost:8080/api/products/variants/${item.product_variant_id}`);
                setProductQuantity(response.data.quantity);
            } catch (error) {
                console.error('Error fetching product stock:', error);
            }
        };

        fetchProductQuantity();
    }, [item.product_variant_id]);

    useEffect(() => {
        setQuantity(item.quantity);
    }, [item.quantity]);

    const handleQuantityChange = (newQuantity) => {
        if (productQuantity === null) {
            console.warn('Stock data is not loaded yet.');
            return;
        }

        // Kiểm tra số lượng hợp lệ
        if (newQuantity < 1) {
            Swal.fire({
                icon: 'warning',
                title: 'Số lượng không hợp lệ!',
                text: 'Số lượng tối thiểu là 1.',
                confirmButtonText: 'Đóng',
            });
            return;
        }

        if (newQuantity > productQuantity) {
            Swal.fire({
                icon: 'warning',
                title: 'Số lượng vượt quá giới hạn!',
                text: `Chỉ còn ${productQuantity} sản phẩm trong kho.`,
                confirmButtonText: 'Đóng',
            });
            return;
        }

        setQuantity(newQuantity);
        onUpdateQuantity(item.product_variant_id, newQuantity);
    };

    const handleCheckboxChange = () => {
        onSelectChange(item.product_variant_id, !isSelected);
    };

    const price = item.productPrice || 0;
    const imageUrl = item.productImageUrl || 'https://placehold.co/50x50';
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value).replace(/\s?₫/g, ' VND');
    };
    console.log(item);

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
                <button
                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded-l-lg hover:bg-gray-400 focus:outline-none"
                    onClick={() => handleQuantityChange(quantity - 1)}
                >
                    -
                </button>
                <input
                    type="number"
                    className="mx-2 w-16 text-center border border-gray-300 rounded-none"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                />
                <button
                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded-r-lg hover:bg-gray-400 focus:outline-none"
                    onClick={() => handleQuantityChange(quantity + 1)}
                >
                    +
                </button>
            </div>
            <div className="pl-10 text-sm">{formatCurrency(price * quantity)}</div>
            <div>
                <button onClick={() => onDelete(item.product_variant_id)} className="text-red-600 hover:text-red-800 pl-10">
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
