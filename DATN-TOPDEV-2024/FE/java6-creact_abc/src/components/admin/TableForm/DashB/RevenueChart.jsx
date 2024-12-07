import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import RevenueService from "../../../../services/RevenueService";

const RevenueBarChart = () => {
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState("2024-01-01");
    const [endDate, setEndDate] = useState("2024-12-31");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDailyRevenue();
    }, [startDate, endDate]);

    const fetchDailyRevenue = async () => {
        setLoading(true);
        try {
            const response = await RevenueService.getDailyRevenue(startDate, endDate);
            const dailyRevenue = response.data;

            // Chuyển đổi dữ liệu để phù hợp với biểu đồ
            const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
                date,
                revenue,
            }));

            setData(chartData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu doanh thu hàng ngày:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Biểu Đồ Doanh Thu Hàng Ngày</h2>
            <div style={{ marginBottom: "20px" }}>
                <label>Ngày bắt đầu: </label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <label style={{ marginLeft: "20px" }}>Ngày kết thúc: </label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p>Không có dữ liệu cho khoảng thời gian đã chọn.</p>
            )}
        </div>
    );
};

export default RevenueBarChart;
