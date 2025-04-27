import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
    Cell
} from "recharts";

const RevenueCharts = () => {
    const [fromDate, setFromDate] = useState("2025-01-01");
    const [toDate, setToDate] = useState("2025-12-12");
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [percentChange, setPercentChange] = useState(null);
    const [revenueComparison, setRevenueComparison] = useState({
        firstValue: 0,
        lastValue: 0,
        absoluteChange: 0
    });
    const [analysis, setAnalysis] = useState({
        trend: "",
        highestMonth: { month: "", revenue: 0 },
        lowestMonth: { month: "", revenue: Infinity },
        averageRevenue: 0,
        volatility: "",
        recommendation: ""
    });
    const [analyzingWithAI, setAnalyzingWithAI] = useState(false);

    // Mảng màu sắc cho biểu đồ cột
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'];

    // Lấy dữ liệu doanh thu theo tháng
    const fetchMonthlyRevenue = async () => {
        if (!fromDate || !toDate) return;

        setLoading(true);

        try {
            const response = await axios.get("http://localhost:8080/api/dash/monthly-revenue", {
                params: { from: fromDate, to: toDate }
            });

            const formattedData = response.data.map(item => ({
                month: item.month,
                revenue: parseFloat(item.revenue),
                yearMonth: item.yearMonth
            }));

            setMonthlyData(formattedData);

            // Tính % thay đổi
            if (formattedData.length > 0) {
                calculatePercentChange(formattedData);
                // Đã xóa phần gọi generateAnalysis tự động tại đây
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // Tính phần trăm thay đổi
    const calculatePercentChange = (data) => {
        if (data.length < 2) return;

        const firstValue = data[0].revenue;
        const lastValue = data[data.length - 1].revenue;
        const absoluteChange = lastValue - firstValue;
        const change = (absoluteChange / firstValue) * 100;

        setPercentChange(change);
        setRevenueComparison({
            firstValue,
            lastValue,
            absoluteChange
        });
    };

    // Hàm xử lý khi nhấn nút khuyến nghị AI
    const handleAIRecommendation = async () => {
        if (monthlyData.length < 2) {
            alert("Cần có ít nhất 2 tháng dữ liệu để phân tích");
            return;
        }
        
        setAnalyzingWithAI(true);
        try {
            await generateAnalysis(monthlyData);
        } finally {
            setAnalyzingWithAI(false);
        }
    };

    const generateAnalysis = async (data) => {
        if (data.length < 2) return;

        try {
            console.log("Dữ liệu gửi đến backend:", data);
            
            // Tạo instance axios mới với withCredentials: false
            const geminiAxios = axios.create({
                baseURL: 'http://localhost:5000',
                headers: { 'Content-Type': 'application/json' },
                withCredentials: false
            });
            
            const response = await geminiAxios.post("/gemini/api/analyze-revenue", {
                data
            });

            const analysisData = response.data;

            setAnalysis({
                trend: analysisData.trend,
                highestMonth: analysisData.highestMonth,
                lowestMonth: analysisData.lowestMonth,
                averageRevenue: analysisData.averageRevenue,
                volatility: analysisData.volatility,
                recommendation: analysisData.recommendation
            });
        } catch (error) {
            console.error("Lỗi khi phân tích dữ liệu với Gemini:", error);
            console.error("Chi tiết lỗi:", error.response ? error.response.data : error.message);
            setAnalysis({
                trend: "Lỗi",
                highestMonth: { month: "N/A", revenue: 0 },
                lowestMonth: { month: "N/A", revenue: 0 },
                averageRevenue: 0,
                volatility: "N/A",
                recommendation: "Không thể phân tích dữ liệu do lỗi kết nối."
            });
        }
    };

    // Lấy dữ liệu khi component mount hoặc khi fromDate/toDate thay đổi
    useEffect(() => {
        // Không tự động gọi fetchMonthlyRevenue khi component mount
    }, []); // Đã xóa dependencies để không trigger khi date thay đổi

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{label}</p>
                    <p style={{ margin: '0', color: payload[0].color }}>
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Gradient cho line chart
    const gradientOffset = () => {
        if (monthlyData.length === 0) return 0;

        const dataMax = Math.max(...monthlyData.map(i => i.revenue));
        const dataMin = Math.min(...monthlyData.map(i => i.revenue));

        if (dataMax <= 0) return 0;
        if (dataMin >= 0) return 1;

        return dataMax / (dataMax - dataMin);
    };

    // Component hiển thị chi tiết % thay đổi
    const DetailedPercentChange = () => {
        if (percentChange === null) return null;

        const isPositive = percentChange >= 0;
        const firstMonthName = monthlyData.length > 0 ? monthlyData[0].month : "";
        const lastMonthName = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].month : "";

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                // backgroundColor: '#f8fafc',
                padding: '8px',
                borderRadius: '6px',
                marginTop: '8px',
                borderLeft: `3px solid ${isPositive ? '#4CAF50' : '#F44336'}`,
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isPositive ? '#4CAF50' : '#F44336',
                }}>
                    <span>{isPositive ? '▲' : '▼'}</span>
                    <span>{Math.abs(percentChange).toFixed(2)}%</span>
                    <span style={{fontSize: '12px', color: '#4a5568'}}>
            ({isPositive ? 'tăng' : 'giảm'})
        </span>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{color: '#4a5568'}}>Doanh thu {firstMonthName}:</span>
                        <span style={{fontWeight: '500'}}>{formatCurrency(revenueComparison.firstValue)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{color: '#4a5568'}}>Doanh thu {lastMonthName}:</span>
                        <span style={{fontWeight: '500'}}>{formatCurrency(revenueComparison.lastValue)}</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px dashed #e2e8f0',
                        paddingTop: '3px',
                        marginTop: '3px',
                        fontWeight: '600'
                    }}>
                        <span style={{color: '#4a5568'}}>Chênh lệch:</span>
                        <span style={{color: isPositive ? '#4CAF50' : '#F44336'}}>
                {isPositive ? '+' : ''}{formatCurrency(revenueComparison.absoluteChange)}
            </span>
                    </div>
                </div>
            </div>
        );
    };

    // Component hiển thị phân tích doanh thu
    const RevenueAnalysis = () => {
        if (monthlyData.length < 2) return null;

        const getTrendIcon = (trend) => {
            if (trend.includes("tăng")) return "▲";
            if (trend.includes("giảm")) return "▼";
            return "◆";
        };

        const getTrendColor = (trend) => {
            if (trend.includes("tăng")) return "#4CAF50";
            if (trend.includes("giảm")) return "#F44336";
            return "#3182ce";
        };

        return (
            <div style={{
                padding: '20px',
                marginTop: '20px'
            }}>
                <h3 style={{
                    margin: '0 0 15px',
                    color: '#2d3748',
                    borderBottom: '2px solid #edf2f7',
                    paddingBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    Nhận định doanh thu
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    {/* Xu hướng */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '15px',
                        borderLeft: `4px solid ${getTrendColor(analysis.trend)}`
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', fontSize: '11px' }}>
                            XU HƯỚNG TỔNG THỂ
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: getTrendColor(analysis.trend),
                            fontWeight: 'bold',
                            fontSize: '11px'
                        }}>
                            <span>{getTrendIcon(analysis.trend)}</span>
                            <span style={{ textTransform: 'uppercase' }}>
                                {analysis.trend}
                            </span>
                        </div>
                    </div>

                    {/* Doanh thu cao nhất */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '15px',
                        borderLeft: '4px solid #3182ce'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', fontSize: '11px' }}>
                            DOANH THU CAO NHẤT
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
                            {analysis.highestMonth.month}
                        </div>
                        <div style={{ color: '#4CAF50', fontWeight: '500' }}>
                            {formatCurrency(analysis.highestMonth.revenue)}
                        </div>
                    </div>

                    {/* Doanh thu thấp nhất */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '15px',
                        borderLeft: '4px solid #3182ce'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', fontSize: '11px' }}>
                            DOANH THU THẤP NHẤT
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
                            {analysis.lowestMonth.month}
                        </div>
                        <div style={{ color: '#F44336', fontWeight: '500' }}>
                            {formatCurrency(analysis.lowestMonth.revenue)}
                        </div>
                    </div>

                    {/* Doanh thu trung bình */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '15px',
                        borderLeft: '4px solid #3182ce'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', fontSize: '11px' }}>
                            DOANH THU TRUNG BÌNH
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#2d3748' }}>
                            {formatCurrency(analysis.averageRevenue)}
                        </div>
                        <div style={{ fontSize: '13px', color: '#718096' }}>
                            Tính từ {monthlyData.length} tháng
                        </div>
                    </div>

                    {/* Độ biến động */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '15px',
                        borderLeft: '4px solid #3182ce'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', fontSize: '11px' }}>
                            ĐỘ BIẾN ĐỘNG
                        </div>
                        <div style={{
                            fontWeight: 'bold',
                            fontSize: '11px',
                            color: analysis.volatility === "cao" ? "#F44336" :
                                analysis.volatility === "trung bình" ? "#FF9800" : "#4CAF50"
                        }}>
                            {analysis.volatility.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Khuyến nghị */}
                <div style={{
                    backgroundColor: '#ebf8ff',
                    padding: '15px',
                    borderLeft: '4px solid #4299e1',
                    marginTop: '10px'
                }}>
                    <div style={{ fontWeight: 'bold', color: '#2c5282', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        KHUYẾN NGHỊ
                    </div>
                    <div style={{ color: '#2a4365', lineHeight: '1' }}>
                        {analysis.recommendation}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ width: "100%" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "15px",
                // background: "linear-gradient(to right, #f6f9fc, #edf2f7)",
                padding: "15px",
            }}>
                <div>
                    <h3 style={{ margin: "0 0 5px", color: "#2d3748" }}>Doanh thu theo tháng</h3>
                    <DetailedPercentChange />
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{
                                padding: '6px 8px',
                                border: '1px solid #cbd5e0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{
                                padding: '6px 8px',
                                border: '1px solid #cbd5e0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        />
                    </div>
                    <button
                        onClick={fetchMonthlyRevenue}
                        disabled={loading}
                        style={{
                            backgroundColor: "#3182ce",
                            color: "white",
                            padding: "6px 14px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            transition: "all 0.2s ease",
                            opacity: loading ? "0.7" : "1"
                        }}
                    >
                        {loading ? "Đang tải..." : "Cập nhật"}
                    </button>
                    
                    {/* Thêm nút khuyến nghị AI mới */}
                    {monthlyData.length > 0 && (
                        <button
                            onClick={handleAIRecommendation}
                            disabled={analyzingWithAI || monthlyData.length < 2}
                            style={{
                                backgroundColor: "#9c27b0",
                                color: "white",
                                padding: "6px 14px",
                                border: "none",
                                borderRadius: "6px",
                                cursor: analyzingWithAI ? "not-allowed" : "pointer",
                                fontSize: "13px",
                                fontWeight: "500",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                transition: "all 0.2s ease",
                                opacity: analyzingWithAI ? "0.7" : "1",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            {analyzingWithAI ? "Đang phân tích..." : "AI nhận định"}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
                {/* Line Chart */}
                <div style={{
                    flex: "1",
                    padding: "15px",
                }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.3}/>
                                </linearGradient>
                                <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#ff7300" stopOpacity={1} />
                                    <stop offset="25%" stopColor="#0088fe" stopOpacity={1} />
                                    <stop offset="50%" stopColor="#00C49F" stopOpacity={1} />
                                    <stop offset="75%" stopColor="#FFBB28" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#FF8042" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11, dy: 10, fontWeight:"bold"}}
                                textAnchor="middle"
                                height={50}
                                interval={1}
                            />
                            <YAxis
                                tickFormatter={(value) => (value / 1000000).toFixed(0) + "M"}
                                fontSize={11}
                                width={40}
                                tick={{ fontWeight: "bold" }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                name="Doanh thu"
                                stroke="url(#colorLine)"
                                strokeWidth={4}
                                dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4, fill: 'white' }}
                                activeDot={{ r: 8, stroke: '#8884d8', strokeWidth: 2, fill: '#fff' }}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div style={{
                    flex: "1",
                    padding: "15px",
                }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11, dy: 10, fontWeight:"bold"}}
                                textAnchor="middle"
                                height={50}
                                interval={1}
                            />
                            <YAxis
                                tickFormatter={(value) => (value / 1000000).toFixed(0) + "M"}
                                fontSize={11}
                                width={40}
                                tick={{ fontWeight: "bold" }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="revenue"
                                name="Doanh thu"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            >
                                {monthlyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Phần nhận định doanh thu */}
            <RevenueAnalysis />
        </div>
    );
};

export default RevenueCharts;