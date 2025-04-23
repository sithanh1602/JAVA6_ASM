import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("checking");
    const [orderInfo, setOrderInfo] = useState({});
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const resultCode = searchParams.get("resultCode");
        const message = searchParams.get("message");
        const orderId = searchParams.get("orderId");
        const amount = searchParams.get("amount") || searchParams.get("vnp_Amount");
        const transactionId = searchParams.get("transId");
        const paymentMethod = searchParams.get("payType");

        setOrderInfo({ orderId, message, amount });

        if (!orderId) {
            setStatus("failed");
            setErrorMsg("Không tìm thấy mã đơn hàng hợp lệ.");
            return;
        }

        // Gửi yêu cầu cập nhật trạng thái đơn hàng (không cần gửi body nếu query param đã đủ)
        axios
            .put(`http://localhost:8080/api/orders/momo/${orderId}/status`, null, {
                params: {
                    status: 3,
                    transactionId: transactionId || "",
                },
            })
            .then(() => {
                setStatus("success");
            })
            .catch((err) => {
                const msg =
                    err.response?.data?.error ||
                    `Thanh toán thành công nhưng không thể cập nhật trạng thái đơn hàng ${orderId}. Vui lòng liên hệ hỗ trợ.`;
                setErrorMsg(msg);
                setStatus("success");
            });
    }, [searchParams]);

    const OrderInfoBox = () => (
        <div className="mt-4 bg-gray-100 rounded-xl px-6 py-4 shadow-md w-full max-w-md mx-auto">
            <p className="text-lg text-gray-700">Đơn hàng: <strong>{orderInfo.orderId}</strong></p>
            <p>Số tiền: <strong>{Number(orderInfo.amount).toLocaleString()}đ</strong></p>
            <p className="text-gray-600 mt-2">Thông điệp: {orderInfo.message}</p>
            {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
        </div>
    );

    if (status === "checking") {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <FaSpinner className="text-5xl text-blue-500 animate-spin mb-4" />
<p className="text-lg font-medium text-gray-700">Đang xử lý kết quả thanh toán...</p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
                <FaCheckCircle className="text-6xl text-green-500 mb-4" />
                <h1 className="text-3xl font-bold text-green-600">Thanh toán thành công!</h1>
                <OrderInfoBox />
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Tiếp tục mua sắm</a>
                    <a href="/OrderUser" className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">Xem đơn hàng</a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
            <FaTimesCircle className="text-6xl text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-red-600">Thanh toán thất bại!</h1>
            <OrderInfoBox />
            <a
                href="/cart"
                className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
            >
                Quay lại giỏ hàng
            </a>
        </div>
    );
};

export default PaymentResult;