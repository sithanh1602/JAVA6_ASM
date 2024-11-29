import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PaymentSuccess = () => {
    const location = useLocation();

    // Lấy thông tin từ query string
    const searchParams = new URLSearchParams(location.search);
    const transactionStatus = searchParams.get("vnp_TransactionStatus");
    const orderId = searchParams.get("vnp_TxnRef");
    console.log(transactionStatus);
    console.log(orderId);

    useEffect(() => {
        // Nếu thanh toán thất bại (status khác 00) hoặc có orderId
        if (orderId) {
            let newStatus = transactionStatus === "00" ? 3 : 2; // Thành công -> status = 3, Thất bại -> status = 2

            fetch(`http://localhost:8080/api/orders/${orderId}/status?status=${newStatus}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    // Thêm Authorization nếu cần
                    // Authorization: `Bearer ${yourAuthToken}`,
                },
                body: JSON.stringify({ status: newStatus }), // Cập nhật trạng thái (3 cho thành công, 2 cho thất bại)
            })
                .then((response) => {
                    if (!response.ok) {
                        // Nếu không thành công, log lỗi chi tiết
                        return response.text().then((text) => {
                            console.error("Error details:", text); // Log nội dung phản hồi dạng text
                            throw new Error(
                                `Failed to update order status: ${response.status} ${response.statusText}`
                            );
                        });
                    }
                    return response.json(); // Nếu thành công, phân tích cú pháp JSON
                })
                .then((data) => {
                    console.log("Order status updated successfully", data);
                })
                .catch((error) => console.error("Error updating order status:", error));
        }
    }, [transactionStatus, orderId]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">
                    {transactionStatus === "00"
                        ? "Thanh toán thành công!"
                        : "Thanh toán thất bại!"}
                </h1>
                <p className="text-gray-600 mb-6">
                    {transactionStatus === "00"
                        ? "Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được ghi nhận và sẽ sớm được xử lý."
                        : "Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại."}
                </p>
                {orderId && (
                    <div className="text-left text-gray-700 mb-6">
                        <p>
                            <strong>Mã đơn hàng:</strong> {orderId}
                        </p>
                    </div>
                )}
                <div className="text-center">
                    {transactionStatus === "00" ? (
                        <button
                            onClick={() => (window.location.href = "/")}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Tiếp tục mua sắm
                        </button>
                    ) : (
                        <button
                            onClick={() => (window.location.href = "/OrderUser")}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Xem đơn hàng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
