import React, { useEffect, useState } from 'react';
import { getAllCartItemsForUser, removeProductFromCart } from '../services/CartService';
import Breadcrumb from '../components/cart/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import CouponForm from '../components/cart/CouponForm';
import CartSummary from '../components/cart/CartSummary';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import 'aos/dist/aos.css';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        const storedUserId = JSON.parse(localStorage.getItem('UserId'));
        if (!storedUserId) {
            setError('Không tìm thấy userId trong localStorage.');
            setLoading(false);
            return;
        }
        setUserId(storedUserId);

        const fetchCartItems = async () => {
            try {
                const items = await getAllCartItemsForUser(storedUserId);
                if (items.length === 0) {
                    toast.error('Giỏ hàng của bạn hiện tại trống.');
                } else {
                    setCartItems(items);
                }
            } catch (err) {
                toast.error('Không thể tải giỏ hàng.');
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
        const interval = setInterval(fetchCartItems, 2000);
        return () => clearInterval(interval);
    }, []);

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
            setTimeout(() => {
                Swal.close();
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

    const handleProceedToCheckout = () => {
        navigate('/orders', { state: { cartItems } });
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
                        <div>Đang tải...</div>
                    ) : error ? (
                        <ToastContainer
                            position="top-center"
                            autoClose={5000}
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
                                />
                            ))
                        ) : (
                            <div className="flex justify-center items-center h-48 bg-gray-100 rounded-lg shadow-lg">
                                <p className="text-xl font-semibold text-gray-600">Giỏ hàng của bạn trống</p>
                            </div>
                        )
                    )}
                    <CouponForm />
                </div>
                <CartSummary />
                <div className="flex justify-end mt-4">
                    <button onClick={handleProceedToCheckout} className="bg-orange-500 text-white px-6 py-2">TIẾN HÀNH THANH TOÁN</button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
