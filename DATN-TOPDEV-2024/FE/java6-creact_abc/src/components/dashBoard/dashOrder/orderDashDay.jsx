import React, { useState } from "react";
import axios from "axios";

const OrderDashDay = () => {
    const [fromDate, setFromDate] = useState(""); // Fixed initialState to an empty string
    const [toDate, setToDate] = useState("");
    const [revenue, setRevenue] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchRevenue = async () => {
        if (!fromDate || !toDate) {
            alert("Vui lòng chọn đủ cả ngày bắt đầu và ngày kết thúc");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/dash/statistics", {
                params: {
                    from: fromDate,
                    to: toDate
                }
            });
            setRevenue(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy doanh thu:", error);
            alert("Đã có lỗi xảy ra khi lấy dữ liệu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
            <h2>📊 Thống kê doanh thu theo khoảng ngày</h2>
            <div style={{ marginBottom: "10px" }}>
                <label>Từ ngày: </label>
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: "10px" }}>
                <label>Đến ngày: </label>
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>
            <button onClick={fetchRevenue} disabled={loading}>
                {loading ? "Đang tải..." : "Xem doanh thu"}
            </button>

            {revenue !== null && (
                <div style={{ marginTop: "20px", fontSize: "18px", color: "green" }}>
                    💰 Tổng doanh thu: <strong>{revenue.toLocaleString()} VND</strong>
                </div>
            )}
        </div>
    );
};

export default OrderDashDay;
