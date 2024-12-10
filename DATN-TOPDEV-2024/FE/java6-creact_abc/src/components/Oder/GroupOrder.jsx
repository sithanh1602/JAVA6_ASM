import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import BillingInfo from './OderBingllingInfor'; // Đảm bảo đường dẫn chính xác
import OrderInfo from './OderInfor'; // Đảm bảo đường dẫn chính xác
import OrderBr from './OderBr';
import OrderService from "../../services/OrderSevice"; // Đảm bảo đường dẫn chính xác
import UserAddressService from "../../services/UserAddressService";
import { useLocation, useNavigate } from 'react-router-dom';

const GroupOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems = [] } = location.state || {}; // Đảm bảo cartItems luôn là một mảng

    const [userInfo, setUserInfo] = useState({
        id: '',
        fullName: '',
        phone: '',
        email: '',
        fullAddress: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('');  // Payment method: 'bank' or 'cash'
    const [loading, setLoading] = useState(false);

    // Lấy thông tin người dùng khi component được mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            const userId = localStorage.getItem('UserId');
            if (!userId) {
                Swal.fire({
                    title: 'Lỗi',
                    text: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
                    icon: 'error',
                }).then(() => {
                    navigate('/login'); // Điều hướng đến trang đăng nhập
                });
                return;
            }

            try {
                const userData = await UserAddressService.getDefaultUserInfo(userId);  // Đảm bảo truyền userId
                if (userData) {
                    setUserInfo({
                        id: userId,
                        fullName: userData.fullName,
                        phone: userData.phone,
                        email: userData.email,
                        fullAddress: userData.fullAddress,
                    });
                }
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
                Swal.fire({
                    title: 'Lỗi',
                    text: 'Không thể tải thông tin người dùng.',
                    icon: 'error',
                });
            }
        };

        fetchUserInfo();
    }, [navigate]);

    // Tính tổng giá trị của giỏ hàng
    const calculateTotalPrice = () =>
        cartItems.reduce((total, item) => total + item.productPrice * item.quantity, 0);

    // Xử lý đặt hàng
    const handlePlaceOrder = async () => {
        console.log('Phương thức thanh toán:', paymentMethod);
        if (!paymentMethod) {
            Swal.fire({
                title: 'Lỗi',
                text: 'Vui lòng chọn phương thức thanh toán.',
                icon: 'error',
            });
            return;
        }

        if (!userInfo.fullAddress) {
            Swal.fire({
                title: 'Lỗi',
                text: 'Vui lòng cung cấp địa chỉ giao hàng.',
                icon: 'error',
            });
            return;
        }

        setLoading(true);

        const orderData = {
            userId: userInfo.id,
            fullAddress: userInfo.fullAddress,
            cartItems: cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                productName: item.productName,
                productPrice: item.productPrice,
            })),
            totalPrice: calculateTotalPrice(),
            paymentMethod,
        };

        try {
            if (paymentMethod === 'bank') {
                const response = await OrderService.placeOrder(orderData);
                Swal.fire({
                    title: 'Chuyển hướng...',
                    text: 'Đang chuyển đến cổng thanh toán.',
                    icon: 'info',
                });
                window.location.href = response; // Điều hướng đến URL thanh toán VNPay
            } else if (paymentMethod === 'cash') {
                await OrderService.placeOrderNoVnpay(orderData);

                // Tạo danh sách sản phẩm dưới dạng HTML
                const productDetails = cartItems
                    .map(
                        (item) =>
                            `<li>${item.productName} - Số lượng: ${item.quantity} - Giá: ${(
                                item.productPrice * item.quantity
                            ).toLocaleString()} VNĐ</li>`
                    )
                    .join('');

                // Hiển thị thông báo chi tiết đơn hàng
                Swal.fire({
                    title: 'Đặt hàng thành công!',
                    html: `
                    <p>Đơn hàng của bạn đã được ghi nhận.</p>
                    <ul style="text-align: left;">${productDetails}</ul>
                    <p><strong>Tổng tiền: ${calculateTotalPrice().toLocaleString()} VNĐ</strong></p>
                `,
                    icon: 'success',
                }).then(() => {
                    navigate('/OrderUser'); // Điều hướng đến trang quản lý đơn hàng
                });
            } else {
                Swal.fire({
                    title: 'Lỗi',
                    text: 'Phương thức thanh toán không hợp lệ.',
                    icon: 'error',
                });
            }
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            Swal.fire({
                title: 'Lỗi',
                text: 'Đã xảy ra lỗi trong quá trình đặt hàng. Vui lòng thử lại.',
                icon: 'error',
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container mx-auto p-4">
            <OrderBr />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BillingInfo setUserInfo={setUserInfo} userInfo={userInfo} />
                <OrderInfo setPaymentMethod={setPaymentMethod} />
            </div>
            <button
                onClick={handlePlaceOrder}
                className="mt-4 w-full bg-orange-600 text-white py-2 rounded-md"
                disabled={loading}
            >
                {loading ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
            </button>
        </div>
    );
};

export default GroupOrder;
