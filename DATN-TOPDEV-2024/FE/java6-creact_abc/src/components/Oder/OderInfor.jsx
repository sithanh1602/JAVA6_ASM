import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import logoMomo from "../../assets/images/logoMomo.png";
import logoVNP from "../../assets/images/logoVNP.jpg";

const OrderInfo = () => {
    const location = useLocation();
    const { cartItems } = location.state || { cartItems: [] };
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [selectedLogo, setSelectedLogo] = useState(''); // State to manage selected logo

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value).replace(/\s?₫/g, '') + ' VND';
    };

    const handleLogoClick = (logo) => {
        setSelectedLogo(logo);
        setPaymentMethod('bank'); // Ensure payment method is 'bank' when selecting a logo
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Thông tin đơn hàng</h2>
            <div className="border border-gray-300 rounded-md p-4">
                <table className="w-full text-left">
                    <thead>
                    <tr>
                        <th className="pb-2">Sản phẩm</th>
                        <th className="pb-2">Tạm tính</th>
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
                    <tr>
                        <td className="pt-2">Tạm tính</td>
                        <td className="pt-2">
                            {formatCurrency(cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0))}
                        </td>
                    </tr>
                    <tr>
                        <td className="pt-2 font-bold">Tổng</td>
                        <td className="pt-2 font-bold">
                            {formatCurrency(cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0))}
                        </td>
                    </tr>
                    </tfoot>
                </table>
                <div className="mt-4">
                    <div className="flex items-center">
                        <input
                            type="radio"
                            name="payment"
                            className="h-4 w-4 text-orange-600 border-gray-300"
                            checked={paymentMethod === 'bank'}
                            onChange={() => setPaymentMethod('bank')}
                        />
                        <label className="ml-2 block text-sm text-gray-900">Chuyển khoản ngân hàng</label>
                    </div>
                    {paymentMethod === 'bank' && (
                        <div>
                            <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700">
                                Thực hiện thanh toán vào ngay tài khoản ngân hàng của chúng tôi. Vui lòng sử dụng Mã đơn hàng của bạn trong phần Nội dung thanh toán. Đơn hàng sẽ được giao sau khi tiền đã chuyển.
                            </div>
                            <div className="mt-4 flex">
                                <div
                                    className={`flex items-center mr-4 cursor-pointer ${selectedLogo === 'vnp' ? 'border-2 border-orange-500 shadow-lg' : ''}`}
                                    onClick={() => handleLogoClick('vnp')}
                                >
                                    <img src={logoVNP} alt="Bank Logo VNP" className="h-12 w-12" />
                                </div>
                                <div
                                    className={`flex items-center cursor-pointer ${selectedLogo === 'momo' ? 'border-2 border-orange-500 shadow-lg' : ''}`}
                                    onClick={() => handleLogoClick('momo')}
                                >
                                    <img src={logoMomo} alt="Bank Logo Momo" className="h-12 w-12" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center mt-4">
                        <input
                            type="radio"
                            name="payment"
                            className="h-4 w-4 text-orange-600 border-gray-300"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                        />
                        <label className="ml-2 block text-sm text-gray-900">Trả tiền mặt khi nhận hàng</label>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                        Dữ liệu cá nhân của bạn sẽ được sử dụng để xử lý đơn đặt hàng, hỗ trợ trải nghiệm của bạn trên trang web này và cho các mục đích khác được mô tả trong <a href="#" className="text-orange-600">chính sách riêng tư</a> của chúng tôi.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderInfo;
