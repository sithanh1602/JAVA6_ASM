import React, { useState } from 'react';

const CartItem = ({ item, onUpdateQuantity, onDelete }) => {
    const [quantity, setQuantity] = useState(item.quantity);

    // Xử lý khi số lượng thay đổi
    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;  // Ngăn không cho số lượng nhỏ hơn 1
        setQuantity(newQuantity);
        onUpdateQuantity(item.id, newQuantity);  // Gọi hàm cập nhật số lượng trong giỏ hàng
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            handleQuantityChange(quantity - 1);
        }
    };

    const handleIncrease = () => {
        handleQuantityChange(quantity + 1);
    };

    const handleDelete = () => {
        onDelete(item.id);  // Gọi hàm xóa sản phẩm khỏi giỏ hàng
    };

    // Đảm bảo có giá trị mặc định nếu price không có
    const price = item.productPrice || 0;
    const imageUrl = item.productImageUrl || 'https://placehold.co/50x50'; // Đảm bảo có hình ảnh mặc định

    return (
        <div className="grid grid-cols-5 gap-4 items-center mt-4">
            <div className="col-span-2 flex items-center">
                <img
                    src={imageUrl}
                    alt={item.productName}
                    className="w-12 h-12 mr-4"
                />
                <span>{item.productName}</span>
            </div>
            <div>{price}₫</div>
            <div className="flex items-center">
                <button
                    className="px-2 py-1 border"
                    onClick={handleDecrease}
                >
                    -
                </button>
                <input
                    type="text"
                    value={quantity}
                    className="w-12 text-center border mx-2"
                    readOnly
                />
                <button
                    className="px-2 py-1 border"
                    onClick={handleIncrease}
                >
                    +
                </button>
            </div>
            <div>{price * quantity}₫</div>
            <div>
                <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={handleDelete}
                >
                    Xóa
                </button>
            </div>
        </div>
    );
};

export default CartItem;
