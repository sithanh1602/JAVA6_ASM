import React, { useEffect, useState } from 'react';
import {getAllCartItemsForUser, removeProductFromCart} from '../services/CartService'; // Đảm bảo đường dẫn đúng
import Breadcrumb from '../components/cart/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import CouponForm from '../components/cart/CouponForm';
import CartSummary from '../components/cart/CartSummary';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

import 'aos/dist/aos.css'; // Import AOS styles


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
                    toast.error('Giỏ hàng của bạn hiện tại trống.');
                } else {
                    setCartItems(items);  // Lưu trữ dữ liệu vào state
                }
            } catch (err) {
                toast.error('Không thể tải giỏ hàng.');
            } finally {
                setLoading(false); // Đặt trạng thái loading là false sau khi có dữ liệu hoặc lỗi
            }
        };

        fetchCartItems();
        // Tự động reload giỏ hàng mỗi 5 giây
        const interval = setInterval(fetchCartItems, 2000);

        // Cleanup interval khi component unmount
        return () => clearInterval(interval);
    }, []); // Chỉ chạy 1 lần khi component render lần đầu tiên

    const handleDeleteItemFromCart = async (productId) => {
        try {
            await removeProductFromCart(userId, productId);
            setCartItems(cartItems.filter(item => item.productId !== productId));
            Swal.fire({
                icon: 'success',
                title: 'Xóa thành công!',
                text: 'Sản phẩm đã được xóa khỏi giỏ hàng.',
                confirmButtonText: 'OK !'
            });
            // Close the modal automatically after 1.5 seconds
            setTimeout(() => {
                Swal.close(); // Close the SweetAlert popup
            }, 1000);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
        }
    };




    const handleIncreaseQuantity = (productId) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.productId === productId) {
                    if (item.quantity < item.stock) {
                        return { ...item, quantity: item.quantity + 1 };
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Số lượng vượt quá giới hạn!',
                            text: `Chỉ còn ${item.stock} sản phẩm trong kho.`,
                            confirmButtonText: 'Đóng'
                        });
                    }
                }
                return item;
            })
        );
    };


    const handleDecreaseQuantity = (productId) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.productId === productId && item.quantity > 1) {
                    return { ...item, quantity: item.quantity - 1 };
                }
                return item;
            })
        );
    };



    return (
        <div className="flex justify-center" data-aos="fade-up">
            <div className="container mt-4 max-w-4xl">
                <Breadcrumb />
                <div className="border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-6 gap-5 items-center">
                        <div className="col-span-2 font-bold">SẢN PHẨM</div>
                        <div className="font-bold">GIÁ</div>
                        <div className="font-bold">SỐ LƯỢNG</div>
                        <div className="font-bold">TẠM TÍNH</div>
                        <div className="font-bold">HÀNH ĐỘNG</div>
                    </div>

                    {loading ? (
                        <div>Đang tải...</div>  // Hiển thị trạng thái loading
                    ) : error ? (
                        <ToastContainer
                            position="top-center" // Position the toast
                            autoClose={5000}      // Auto-close after 5 seconds
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />

                    ) : (
                        cartItems.length > 0 ? (
                            cartItems.map(item => (
                                <CartItem key={item.id} userId={userId} item={item}
                                          onDelete={handleDeleteItemFromCart}
                                /> // Hiển thị các mục giỏ hàng
                            ))
                        ) : (
                            <div className="flex justify-center items-center h-48 bg-gray-100 rounded-lg shadow-lg">
                                <p className="text-xl font-semibold text-gray-600">Giỏ hàng của bạn trống</p>
                            </div>
                        )
                    )}

                    <CouponForm/>
                </div>
                <CartSummary/>
                <div className="flex justify-end mt-4">
                    <button className="bg-orange-500 text-white px-6 py-2">TIẾN HÀNH THANH TOÁN</button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
