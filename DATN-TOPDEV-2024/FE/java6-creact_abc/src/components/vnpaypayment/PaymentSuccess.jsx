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
        // Kiểm tra nếu orderId có dấu '_'
        if (orderId) {
            const cleanedOrderId = orderId.split('_')[0];  // Lấy phần trước dấu '_'
            
            let newStatus = transactionStatus === "00" ? 3 : 2; // Thành công -> status = 3, Thất bại -> status = 2
    
            fetch(`http://localhost:8080/api/orders/${cleanedOrderId}/status?status=${newStatus}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }), // Cập nhật trạng thái
            })
                .then((response) => {
                    if (!response.ok) {
                        return response.text().then((text) => {
                            console.error("Error details:", text);
                            throw new Error(
                                `Failed to update order status: ${response.status} ${response.statusText}`
                            );
                        });
                    }
                    return response.json();
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
                {/*{orderId && (*/}
                {/*    <div className="text-left text-gray-700 mb-6">*/}
                {/*        <p>*/}
                {/*            <strong>Mã đơn hàng:</strong> {orderId}*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*)}*/}
                <div className="text-center space-x-4">
                    {transactionStatus === "00" ? (
                        <>
                            <button
                                onClick={() => (window.location.href = "/")}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Tiếp tục mua sắm
                            </button>
                            <button
                                onClick={() => (window.location.href = "/OrderUser")}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Xem đơn hàng
                            </button>
                        </>
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
