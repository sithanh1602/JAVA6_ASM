import React from 'react';
import { useLocation } from 'react-router-dom';

const OrderInfo = () => {
    const location = useLocation();
    const { cartItems } = location.state || { cartItems: [] };
    console.log(cartItems); // Debugging: to check the structure of cartItems

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
                            <td>{item.productPrice * item.quantity}₫</td> {/* Corrected reference to productPrice */}
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td className="pt-2">Tạm tính</td>
                        <td className="pt-2">
                            {cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0)}₫
                        </td>
                    </tr>
                    <tr>
                        <td className="pt-2 font-bold">Tổng</td>
                        <td className="pt-2 font-bold">
                            {cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0)}₫
                        </td>
                    </tr>
                    </tfoot>
                </table>
                <div className="mt-4">
                    <div className="flex items-center">
                        <input type="radio" name="payment" className="h-4 w-4 text-orange-600 border-gray-300" checked />
                        <label className="ml-2 block text-sm text-gray-900">Chuyển khoản ngân hàng</label>
                    </div>
                    <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700">
                        Thực hiện thanh toán vào ngay tài khoản ngân hàng của chúng tôi. Vui lòng sử dụng Mã đơn hàng của bạn trong phần Nội dung thanh toán. Đơn hàng sẽ được giao sau khi tiền đã chuyển.
                    </div>
                    <div className="flex items-center mt-4">
                        <input type="radio" name="payment" className="h-4 w-4 text-orange-600 border-gray-300" />
                        <label className="ml-2 block text-sm text-gray-900">Trả tiền mặt khi nhận hàng</label>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                        Dữ liệu cá nhân của bạn sẽ được sử dụng để xử lý đơn đặt hàng, hỗ trợ trải nghiệm của bạn trên trang web này và cho các mục đích khác được mô tả trong <a href="#" className="text-orange-600">chính sách riêng tư</a> của chúng tôi.
                    </div>
                    <button className="mt-4 w-full bg-orange-600 text-white py-2 rounded-md">ĐẶT HÀNG</button>
                </div>
            </div>
        </div>
    );
};

export default OrderInfo;
