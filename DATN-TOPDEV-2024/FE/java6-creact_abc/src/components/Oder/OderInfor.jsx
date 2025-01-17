import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import logoMomo from '../../assets/images/logoMomo.png';
import logoVNP from '../../assets/images/logoVNP.jpg';

const OrderInfo = ({ setPaymentMethod, setSelectedLogo }) => {
    const location = useLocation();
    const { cartItems } = location.state || { cartItems: [] };
    const [selectedPayment, setSelectedPayment] = useState('bank'); // Mặc định chọn "bank"
    const [selectedLogo, setLocalSelectedLogo] = useState('');

    // Định dạng giá trị tiền tệ thành đơn vị VNĐ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    // Xử lý chọn logo
    const handleLogoClick = (logo) => {
        setLocalSelectedLogo(logo);
        setSelectedLogo?.(logo); // Nếu có hàm từ component cha, thực thi nó
    };

    const handlePaymentChange = (method) => {
        setSelectedPayment(method); // Cập nhật local state
        setPaymentMethod?.(method);  // Gọi hàm từ cha để cập nhật state của cha
    };

    // Tính tổng giá trị đơn hàng
    const calculateTotal = () =>
        cartItems.reduce((total, item) => total + item.productPrice * item.quantity, 0);

    useEffect(() => {
        // Khi load xong, mặc định chọn thanh toán bằng chuyển khoản ngân hàng
        setPaymentMethod('bank');
    }, [setPaymentMethod]);

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
                        <td className="pt-2">{formatCurrency(calculateTotal())}</td>
                    </tr>
                    <tr>
                        <td className="pt-2 font-bold">Tổng</td>
                        <td className="pt-2 font-bold">{formatCurrency(calculateTotal())}</td>
                    </tr>
                    </tfoot>
                </table>

                {/* Payment Methods */}
                <div className="mt-4">
                    {/* Phương thức thanh toán: Chuyển khoản */}
                    <div className="flex items-center">
                        <input
                            type="radio"
                            name="payment"
                            className="h-4 w-4 text-orange-600 border-gray-300"
                            checked={selectedPayment === 'bank'}
                            onChange={() => handlePaymentChange('bank')}
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                            Chuyển khoản ngân hàng
                        </label>
                    </div>
                    {selectedPayment === 'bank' && (
                        <div>
                            <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700">
                                Vui lòng chuyển khoản vào tài khoản ngân hàng của chúng tôi. Sử dụng mã đơn hàng làm nội dung thanh toán.
                            </div>
                            <div className="mt-4 flex">
                                {/* Logo VNP */}
                                <div
                                    className={`flex items-center mr-4 cursor-pointer ${selectedLogo === 'vnp' ? 'border-2 border-orange-500 shadow-lg' : ''}`}
                                    onClick={() => handleLogoClick('vnp')}
                                >
                                    <img src={logoVNP} alt="VNP Logo" className="h-12 w-12" />
                                </div>
                                {/* Logo Momo */}
                                <div
                                    className={`flex items-center cursor-pointer ${selectedLogo === 'momo' ? 'border-2 border-orange-500 shadow-lg' : ''}`}
                                    onClick={() => handleLogoClick('momo')}
                                >
                                    <img src={logoMomo} alt="Momo Logo" className="h-12 w-12" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Phương thức thanh toán: Trả tiền mặt */}
                    <div className="flex items-center mt-4">
                        <input
                            type="radio"
                            name="payment"
                            className="h-4 w-4 text-orange-600 border-gray-300"
                            checked={selectedPayment === 'cash'}
                            onChange={() => handlePaymentChange('cash')}
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                            Trả tiền mặt khi nhận hàng
                        </label>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                        Dữ liệu cá nhân của bạn sẽ được sử dụng để xử lý đơn đặt hàng và hỗ trợ trải nghiệm của bạn theo <a href="#" className="text-orange-600">chính sách riêng tư</a>.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderInfo;
