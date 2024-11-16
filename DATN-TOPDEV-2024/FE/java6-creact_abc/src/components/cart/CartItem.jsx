import React, { useState} from 'react';
import {FaTrash} from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'aos/dist/aos.css'; // Import AOS styles

const CartItem = ({ item, onUpdateQuantity,onDelete,userId }) => {
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

    // Function to handle quantity increment
    const handleIncrease = () => {
        if (quantity < item.stock) {
            setQuantity(prevQuantity => prevQuantity + 1);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Số lượng vượt quá giới hạn!',
                text: `Chỉ còn ${item.stock} sản phẩm trong kho.`,
                confirmButtonText: 'Đóng'
            });
        }
    };

    // Hàm xử lý xóa sản phẩm
    const handleDelete = () => {
        if (onDelete) {
            onDelete(item.productId); // Gọi hàm xóa từ component cha với productId
        }
    };


    // Đảm bảo có giá trị mặc định nếu price không có
    const price = item.productPrice || 0;
    const imageUrl = item.productImageUrl || 'https://placehold.co/50x50'; // Đảm bảo có hình ảnh mặc định
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
    };

    return (
        <div className="grid grid-cols-6 gap-4 items-center mt-4" data-aos="fade-down">
            <div className="col-span-2 flex items-center">
                <img src={imageUrl} alt={item.productName} className="w-12 h-12 mr-4"/>
                <span>{item.productName}</span>
            </div>
            <div>{formatCurrency(price)}</div>
            <div className="flex items-center">
                <button className="px-2 py-1 border" onClick={handleDecrease}> - </button>
                <input  type="text" value={quantity} className="w-12 text-center border mx-2" readOnly/>
                <button className="px-2 py-1 border" onClick={handleIncrease}> + </button>
            </div>
            <div>{formatCurrency(price * quantity)}</div>
            <div>
                <button className="bg-red-500 text-white items-center px-5 py-1 rounded" onClick={handleDelete}> <FaTrash></FaTrash> </button>
            </div>
        </div>
    );
};

export default CartItem;
