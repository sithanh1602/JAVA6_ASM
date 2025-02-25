import React, { useEffect, useState } from 'react';
import { getAllCartItemsForUser, removeProductFromCart } from '../services/CartService';
import Breadcrumb from '../components/cart/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import CouponForm from '../components/cart/CouponForm';
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
    const [selectedItems, setSelectedItems] = useState({});

    const navigate = useNavigate();

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
                    const initialSelectedState = {};
                    items.forEach(item => {
                        initialSelectedState[item.product_variant_id] = false;
                    });
                    setSelectedItems(initialSelectedState);
                    setCartItems(items.map(item => ({
                        ...item,
                        quantity: item.quantity || 1
                    })));
                }
            } catch (err) {
                toast.error('Không thể tải giỏ hàng.');
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    useEffect(() => {
        // Đồng bộ hóa giỏ hàng với localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    }, [cartItems, selectedItems]);

    const handleDeleteItemFromCart = async (product_variant_id) => {
        try {
            await removeProductFromCart(userId, product_variant_id);
            setCartItems(cartItems.filter(item => item.product_variant_id !== product_variant_id));
            const newSelectedItems = { ...selectedItems };
            delete newSelectedItems[product_variant_id];
            setSelectedItems(newSelectedItems);

            Swal.fire({
                icon: 'success',
                title: 'Xóa thành công!',
                text: 'Sản phẩm đã được xóa khỏi giỏ hàng.',
                confirmButtonText: 'OK!'
            });

            setTimeout(() => {
                Swal.close();
            }, 1000);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
        }
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            if (selectedItems[item.product_variant_id]) {
                return total + (item.productPrice * item.quantity);
            }
            return total;
        }, 0);
    };

    const handleUpdateQuantity = (product_variant_id, newQuantity) => {
        const updatedCartItems = cartItems.map(item =>
            item.product_variant_id === product_variant_id ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCartItems);
    };

    const handleSelectChange = (product_variant_id, isSelected) => {
        const updatedSelectedItems = {
            ...selectedItems,
            [product_variant_id]: isSelected
        };
        setSelectedItems(updatedSelectedItems);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value).replace(/\s?₫/g, ' VND');
    };

    const handleProceedToCheckout = () => {
        const selectedCartItems = cartItems.filter(item => selectedItems[item.product_variant_id]);
        if (selectedCartItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa chọn sản phẩm',
                text: 'Vui lòng chọn ít nhất một sản phẩm để tiến hành thanh toán.',
                confirmButtonText: 'OK'
            });
            return;
        }
        navigate('/orders', { state: { cartItems: selectedCartItems } });
    };
    console.log(cartItems);

    return (
        <div className="flex justify-center">
            <div className="container mt-4 max-w-4xl">
                <Breadcrumb />
                <div className="border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-7 gap-4 items-center">
                        <div className="font-bold">Chọn</div>
                        <div className="col-span-2 font-bold">SẢN PHẨM</div>
                        <div className="font-bold">GIÁ</div>
                        <div className="font-bold pl-5">SỐ LƯỢNG</div>
                        <div className="font-bold pl-7">TẠM TÍNH</div>
                        <div className="font-bold"></div>
                    </div>
                    {loading ? (
                        <div>Đang tải...</div>
                    ) : error ? (
                        <div>Không thể tải giỏ hàng</div>
                    ) : cartItems.length > 0 ? (
                        cartItems.map(item => (
                            <CartItem
                                key={item.product_variant_id}
                                item={item}
                                onDelete={handleDeleteItemFromCart}
                                onUpdateQuantity={handleUpdateQuantity}
                                onSelectChange={handleSelectChange}
                                isSelected={selectedItems[item.product_variant_id]}
                            />
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-48 bg-gray-100 rounded-lg shadow-lg">
                            <p className="text-xl font-semibold text-gray-600">Giỏ hàng của bạn trống</p>
                        </div>
                    )}
                    <div className="mt-4 text-right pr-12">
                        <p className="font-bold">Tổng tiền: {formatCurrency(calculateTotalPrice())}</p>
                    </div>

                    <CouponForm />
                </div>
                <div className="flex justify-end mt-4">
                    <Link to="/products">
                        <button className="bg-orange-200 text-orange-700 px-4 py-2 ml-3 mr-2">Tiếp tục mua hàng</button>
                    </Link>
                    <button onClick={handleProceedToCheckout} className="bg-orange-500 text-white px-6 py-2">
                        TIẾN HÀNH THANH TOÁN
                    </button>

                </div>

                <ToastContainer />
            </div>
        </div>
    );
};

export default CartPage;
