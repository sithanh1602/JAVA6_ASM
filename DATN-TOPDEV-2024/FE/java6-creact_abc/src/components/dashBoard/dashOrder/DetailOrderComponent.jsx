import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DetailOrderComponent = ({ data }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/orders/products/${data.id}`)
            .then(res => {
                console.log("👉 Sản phẩm đơn hàng:", res.data); // 👈 thêm log
                setProducts(res.data);
            })
            .catch(err => console.error("Lỗi lấy sản phẩm của đơn hàng:", err))
            .finally(() => setIsLoading(false));
    }, [data.id]);


    console.log(data);
    return (
        <div className="p-4 bg-blue-50 rounded-md text-sm">
            <h4 className="font-semibold text-gray-700 mb-2">Thông tin khách hàng:</h4>
            <ul className="mb-3 grid grid-cols-2 gap-x-4 text-sm">
                <li><strong>Họ tên:</strong> {data.user.fullName}</li>
                <li><strong>Email:</strong> {data.user.email}</li>
                <li><strong>Điện thoại:</strong> {data.phone}</li>
                <li className="max-w-xs truncate">
                    <strong>Địa chỉ:</strong>{" "}
                    <span title={data.fullAddress}>{data.fullAddress}</span>
                </li>
                <li>
                    <strong>Phương thức thanh toán:</strong>{" "}
                    <span className="text-blue-600 font-medium">{data.paymentStatus}</span>
                </li>
                <li>
                    <strong>Phí ship:</strong>{" "}
                    <span
                        className="text-green-600 font-medium">{Number(data.shipping_fee).toLocaleString()} VNĐ</span>
                </li>
                <li>
                    <strong>Tổng tiền:</strong>{" "}
                    <span className="text-red-600 font-bold">{Number(data.totalPrice).toLocaleString()} VNĐ</span>
                </li>
            </ul>


            <h4 className="font-semibold text-gray-700 mb-2">Danh sách sản phẩm:</h4>
            {isLoading ? (
                <p className="text-blue-500">Đang tải sản phẩm...</p>
            ) : products.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-gray-300">
                        <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="py-1 px-2 text-left">Tên sản phẩm</th>
                            <th className="py-1 px-2 text-right">SL</th>
                            <th className="py-1 px-2 text-right">Giá</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((item, index) => (
                            <tr key={index} className="border-t border-gray-200">
                                <td className="py-1 px-2 flex items-center">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-8 h-8 rounded mr-2"
                                    />
                                    {item.name}
                                </td>
                                <td className="py-1 px-2 text-right">{item.quantity}</td>
                                <td className="py-1 px-2 text-right text-red-600">
                                    {(item.price * item.quantity).toLocaleString()} VNĐ
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500">Không có sản phẩm nào trong đơn này.</p>
            )}
        </div>
    );
};

export default DetailOrderComponent;
