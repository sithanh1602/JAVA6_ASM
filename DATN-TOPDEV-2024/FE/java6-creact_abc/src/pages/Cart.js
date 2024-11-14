import React, { useEffect, useState } from 'react';
import { getAllCartItemsForUser } from '../services/CartService'; // Đảm bảo đường dẫn đúng
import Breadcrumb from '../components/cart/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import CouponForm from '../components/cart/CouponForm';
import CartSummary from '../components/cart/CartSummary';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);  // State lưu trữ dữ liệu giỏ hàng
    const [loading, setLoading] = useState(true);     // State lưu trữ trạng thái loading
    const [error, setError] = useState(null);         // State lưu trữ lỗi nếu có
    const [userId, setUserId] = useState(null);       // State lưu trữ userId

    useEffect(() => {
        // Lấy userId từ localStorage
        const storedUserId = JSON.parse(localStorage.getItem('UserId'));

        // Nếu không có userId trong localStorage, bạn có thể xử lý theo ý muốn
        if (!storedUserId) {
            setError('Không tìm thấy userId trong localStorage.');
            setLoading(false);
            return;
        }

        setUserId(storedUserId); // Lưu userId vào state

        const fetchCartItems = async () => {
            try {
                const items = await getAllCartItemsForUser(storedUserId); // Gọi API để lấy giỏ hàng
                if (items.length === 0) {
                    setError('Giỏ hàng của bạn hiện tại trống.');
                } else {
                    setCartItems(items);  // Lưu trữ dữ liệu vào state
                }
            } catch (err) {
                setError('Không thể tải giỏ hàng.');
            } finally {
                setLoading(false); // Đặt trạng thái loading là false sau khi có dữ liệu hoặc lỗi
            }
        };

        fetchCartItems();
    }, []); // Chỉ chạy 1 lần khi component render lần đầu tiên

    return (
        <div className="flex justify-center">
            <div className="container mt-4 max-w-4xl">
                <Breadcrumb />
                <div className="border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-2 font-bold">SẢN PHẨM</div>
                        <div className="font-bold">GIÁ</div>
                        <div className="font-bold">SỐ LƯỢNG</div>
                        <div className="font-bold">TẠM TÍNH</div>
                    </div>

                    {loading ? (
                        <div>Đang tải...</div>  // Hiển thị trạng thái loading
                    ) : error ? (
                        <div className="text-red-500">{error}</div>  // Hiển thị lỗi nếu có
                    ) : (
                        cartItems.length > 0 ? (
                            cartItems.map(item => (
                                <CartItem key={item.id} item={item} /> // Hiển thị các mục giỏ hàng
                            ))
                        ) : (
                            <div className="text-center text-gray-500">Giỏ hàng của bạn trống</div>
                        )
                    )}

                    <CouponForm />
                </div>
                <CartSummary />
                <div className="flex justify-end mt-4">
                    <button className="bg-orange-500 text-white px-6 py-2">TIẾN HÀNH THANH TOÁN</button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
