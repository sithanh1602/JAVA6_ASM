import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import logoMomo from '../../assets/images/logoMomo.png';
import logoVNP from '../../assets/images/logoVNP.jpg';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import classNames from 'classnames';
import Swal from 'sweetalert2';

const OrderInfo = ({ setPaymentMethod, setSelectedLogo, setVoucherDiscount, setVoucherCode }) => {
    const location = useLocation();
    const { cartItems = [] } = location.state || {};

    const [selectedPayment, setSelectedPayment] = useState('bank');
    const [selectedLogo, setLocalSelectedLogo] = useState('');
    const [showVouchers, setShowVouchers] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const getUserIdFromToken = useCallback(() => {
        const token = Cookies.get('token');
        if (token) {
            try {
                return jwtDecode(token).userId;
            } catch (err) {
                console.error('Token không hợp lệ:', err);
            }
        }
        return null;
    }, []);

    const fetchVouchers = useCallback(async () => {
        const userId = getUserIdFromToken();
        if (!userId) return;
        try {
            const response = await axios.get(`http://localhost:8080/api/vouchers/user/${userId}`);
            setVouchers(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách vouchers:', error);
        }
    }, [getUserIdFromToken]);

    useEffect(() => {
        if (showVouchers) fetchVouchers();
    }, [showVouchers, fetchVouchers]);

    const formatCurrency = value => new Intl.NumberFormat('vi-VN', {
        style: 'currency', currency: 'VND'
    }).format(value);

    const handleLogoClick = (logo) => {
        setLocalSelectedLogo(logo);
        setSelectedLogo?.(logo);
    };

    const handlePaymentChange = (method) => {
        setSelectedPayment(method);
        setPaymentMethod?.(method);
    };


    const handleApplyVoucher = (voucher) => {
        setSelectedVoucher(voucher);
        setDiscountAmount(voucher.discount);
        setVoucherDiscount(voucher.discount);
        setVoucherCode(voucher.code);


        Swal.fire({
            title: 'Mã giảm giá áp dụng thành công!',
            text: `Bạn đã được giảm ${formatCurrency(voucher.discount)}.`,
            icon: 'success',
            confirmButtonText: 'OK',
            timer: 2000,
            timerProgressBar: true
        });
    };

    const totalAmount = cartItems.reduce((total, item) => total + item.productPrice * item.quantity, 0);
    const totalAfterDiscount = totalAmount - discountAmount;


    useEffect(() => {
        setPaymentMethod('bank');
    }, [setPaymentMethod]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Thông tin đơn hàng</h2>
            <div className="border border-gray-300 rounded-md p-4">
                <table className="w-full text-left">
                    <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Tạm tính</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cartItems.map((item, index) => (
                        <tr key={index}>
                            <td>{item.productName} × {item.quantity}</td>
                            <td>{formatCurrency(item.productPrice * item.quantity)}</td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr><td>Tạm tính</td><td>{formatCurrency(totalAmount)}</td></tr>
                    {discountAmount > 0 && (
                        <tr><td>Giảm giá</td><td>{formatCurrency(discountAmount)}</td></tr>
                    )}
                    <tr><td className="font-bold">Tổng</td><td className="font-bold">{formatCurrency(totalAfterDiscount)}</td></tr>
                    </tfoot>
                </table>

                <button
                    onClick={() => setShowVouchers(prev => !prev)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
                    {showVouchers ? "Ẩn mã giảm giá" : "Xem mã giảm giá"}
                </button>

                {showVouchers && (
                    <div className="mt-4 p-4 border rounded-md bg-gray-100">
                        <h3 className="text-lg font-bold mb-2">Danh sách mã giảm giá</h3>
                        {vouchers.filter(voucher => voucher.quantity > 0).length > 0 ? (
                            <ul>
                                {vouchers
                                    .filter(voucher => voucher.quantity > 0) // Lọc những voucher còn số lượng
                                    .map((voucher, index) => (
                                        <li key={index} className="p-2 border-b flex justify-between">
                                            <span>Giảm {formatCurrency(voucher.discount)}</span>
                                            <button
                                                className="px-2 py-1 bg-green-500 text-white rounded-md"
                                                onClick={() => handleApplyVoucher(voucher)}
                                            >
                                                Sử dụng
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Bạn chưa có mã giảm giá nào.</p>
                        )}
                    </div>
                )}

                <div className="mt-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="payment"
                            checked={selectedPayment === 'bank'}
                            onChange={() => handlePaymentChange('bank')}
                            className="h-4 w-4 text-orange-600"
                        />
                        <span className="ml-2">Chuyển khoản ngân hàng</span>
                    </label>
                    {selectedPayment === 'bank' && (
                        <div className="mt-2 p-2 border bg-gray-100 text-sm">
                            Vui lòng chuyển khoản vào tài khoản ngân hàng của chúng tôi. Sử dụng mã đơn hàng làm nội dung thanh toán.
                        </div>
                    )}

                    <div className="mt-4 flex">
                        {['vnp', 'momo'].map((logo, idx) => (
                            <div
                                key={idx}
                                className={classNames("flex items-center mr-4 cursor-pointer", {
                                    'border-2 border-orange-500 shadow-lg': selectedLogo === logo
                                })}
                                onClick={() => handleLogoClick(logo)}
                            >
                                <img
                                    src={logo === 'vnp' ? logoVNP : logoMomo}
                                    alt={`${logo} Logo`}
                                    className="h-12 w-12"
                                />
                            </div>
                        ))}
                    </div>

                    <label className="flex items-center mt-4">
                        <input
                            type="radio"
                            name="payment"
                            checked={selectedPayment === 'cash'}
                            onChange={() => handlePaymentChange('cash')}
                            className="h-4 w-4 text-orange-600"
                        />
                        <span className="ml-2">Trả tiền mặt khi nhận hàng</span>
                    </label>
                    <p className="mt-2 text-sm">
                        Dữ liệu cá nhân của bạn sẽ được sử dụng theo <a href="#" className="text-orange-600">chính sách riêng tư</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderInfo;
