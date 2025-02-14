import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import BillingInfo from './OderBingllingInfor';
import OrderInfo from './OderInfor';
import OrderBr from './OderBr';
import OrderService from "../../services/OrderSevice";
import UserAddressService from "../../services/UserAddressService";
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const GroupOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems = [] } = location.state || {};

    const [userInfo, setUserInfo] = useState({
        id: '',
        fullName: '',
        phone: '',
        email: '',
        fullAddress: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [voucherDiscount, setVoucherDiscount] = useState(0); // Thêm state lưu giảm giá
    const [voucherCode, setVoucherCode] = useState(null);
    const [loading, setLoading] = useState(false);

    const getUserIdFromToken = () => {
        const token = Cookies.get("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                return decodedToken.userId;
            } catch (err) {
                console.error("Token không hợp lệ:", err);
                return null;
            }
        }
        return null;
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            const userId = getUserIdFromToken();
            if (!userId) {
                Swal.fire({
                    title: 'Lỗi',
                    text: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
                    icon: 'error',
                }).then(() => {
                    navigate('/login');
                });
                return;
            }

            try {
                const userData = await UserAddressService.getDefaultUserInfo(userId);
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

    // Cập nhật logic tính tổng tiền (có trừ giảm giá)
    const calculateTotalPrice = () => {
        const total = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
        return Math.max(total - voucherDiscount, 0); // Đảm bảo không bị âm
    };

    console.log("tổng tiền", voucherDiscount)

    const handlePlaceOrder = async () => {
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
            phone: userInfo.phone,
            cartItems: cartItems.map((item) => ({
                productVariantId: item.product_variant_id,
                quantity: item.quantity,
                productName: item.productName,
                productPrice: item.productPrice,
            })),
            totalPrice: calculateTotalPrice(),
            paymentMethod,
            voucherDiscount,
            voucherCode,
        };
        try {
            if (paymentMethod === 'bank') {
                const response = await OrderService.placeOrder(orderData);
                Swal.fire({
                    title: 'Chuyển hướng...',
                    text: 'Đang chuyển đến cổng thanh toán.',
                    icon: 'info',
                });
                window.location.href = response;
            } else if (paymentMethod === 'cash') {
                await OrderService.placeOrderNoVnpay(orderData);

                const productDetails = cartItems
                    .map(item => `<li>${item.productName} - Số lượng: ${item.quantity} - Giá: ${(
                        item.productPrice * item.quantity
                    ).toLocaleString()} VNĐ</li>`)
                    .join('');

                Swal.fire({
                    title: 'Đặt hàng thành công!',
                    html: `
                        <p>Đơn hàng của bạn đã được ghi nhận.</p>
                        <ul style="text-align: left;">${productDetails}</ul>
                        <p><strong>Tổng tiền: ${calculateTotalPrice().toLocaleString()} VNĐ</strong></p>
                    `,
                    icon: 'success',
                }).then(() => {
                    navigate('/OrderUser');
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
                {/* Truyền setVoucherDiscount vào OrderInfo */}
                <OrderInfo setPaymentMethod={setPaymentMethod} setVoucherDiscount={setVoucherDiscount} setVoucherCode={setVoucherCode}/>
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
