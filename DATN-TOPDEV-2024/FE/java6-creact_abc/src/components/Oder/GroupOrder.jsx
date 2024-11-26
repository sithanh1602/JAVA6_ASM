import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';  // Import SweetAlert2
import BillingInfo from './OderBingllingInfor';  // Đảm bảo tên import chính xác
import OrderInfo from './OderInfor';      // Đảm bảo tên import chính xác
import OrderBr from './OderBr';
import OrderService from "../../services/OrderSevice"; // Đảm bảo tên import chính xác
import UserAddressService from "../../services/UserAddressService"; // Import dịch vụ UserAddress
import { useLocation } from 'react-router-dom';

const GroupOrder = () => {
    const location = useLocation();
    const { cartItems } = location.state || { cartItems: [] };  // Đảm bảo cartItems được truyền vào đúng cách

    const [userInfo, setUserInfo] = useState({
        id: '',
        fullName: '',
        phone: '',
        email: '',
        fullAddress: '' // Đảm bảo có fullAddress trong state
    });

    const [paymentMethod, setPaymentMethod] = useState('');  // Trạng thái phương thức thanh toán
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy thông tin người dùng khi component được mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            const userId = localStorage.getItem('UserId'); // Lấy userId từ localStorage

            if (userId) {
                try {
                    const userData = await UserAddressService.getDefaultUserInfo();  // Lấy dữ liệu người dùng từ dịch vụ
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
                    setError('Không thể tải thông tin người dùng.');
                }
            } else {
                console.error('Không tìm thấy user ID trong localStorage');
                setError('Người dùng chưa đăng nhập.');
            }
        };

        fetchUserInfo();
    }, []);  // Chỉ chạy một lần khi component được mount

    // Tính tổng giá trị của các sản phẩm trong giỏ hàng
    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
    };

    // Xử lý khi đặt hàng
    const handlePlaceOrder = async () => {
        setLoading(true);
        setError(null);

        const orderData = {
            userId: userInfo.id,
            fullAddress: userInfo.fullAddress,  // Đảm bảo truyền fullAddress
            cartItems: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                productName: item.productName,
                productPrice: item.productPrice,
            })),
            totalPrice: calculateTotalPrice(),
            paymentMethod: paymentMethod,
        };

        console.log('Dữ liệu đơn hàng:', orderData);

        // Hiển thị SweetAlert để thông báo đang xử lý
        Swal.fire({
            title: 'Đang xử lý...',
            text: 'Vui lòng chờ trong giây lát.',
            icon: 'info',
            allowOutsideClick: false,  // Không cho phép đóng ngoài
            didOpen: () => {
                Swal.showLoading();  // Hiển thị vòng quay loading
            },
        });

        try {
            const response = await OrderService.placeOrder(orderData);  // Đặt hàng sử dụng OrderService
            if (response.status === 201) {
                Swal.fire({
                    title: 'Thanh toán thành công!',
                    text: 'Cảm ơn bạn đã mua hàng.',
                    icon: 'success',
                });
                // Điều hướng hoặc thông báo cho người dùng ở đây, ví dụ: chuyển đến trang xác nhận đơn hàng
            }
        } catch (error) {
            setError('Đã xảy ra lỗi khi đặt hàng.');
            console.error('Lỗi khi đặt hàng:', error);
            Swal.fire({
                title: 'Lỗi',
                text: 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.',
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
                <BillingInfo setUserInfo={setUserInfo} /> {/* Truyền setUserInfo vào BillingInfo */}
                <OrderInfo setPaymentMethod={setPaymentMethod} /> {/* Truyền setPaymentMethod vào OrderInfo */}
            </div>
            <button
                onClick={handlePlaceOrder}
                className="mt-4 w-full bg-orange-600 text-white py-2 rounded-md"
                disabled={loading}
            >
                {loading ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
            </button>
            {error && <div className="text-red-600 mt-4">{error}</div>} {/* Hiển thị thông báo lỗi */}
        </div>
    );
};

export default GroupOrder;
