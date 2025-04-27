// src/components/revenue/ChartHeader.jsx
import React from "react";
import DetailedPercentChange from "./DetailedPercentChange";

const ChartHeader = ({
                         percentChange,
                         monthlyData,
                         revenueComparison,
                         fromDate,
                         toDate,
                         setFromDate,
                         setToDate,
                         loadData,
                         loading,
                         formatCurrency
                     }) => {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "15px",
            background: "linear-gradient(to right, #f6f9fc, #edf2f7)",
            padding: "15px",
            borderRadius: "8px"
        }}>
            <div>
                <h3 style={{ margin: "0 0 5px", color: "#2d3748" }}>Doanh thu theo tháng</h3>
                <DetailedPercentChange
                    percentChange={percentChange}
                    monthlyData={monthlyData}
                    revenueComparison={revenueComparison}
                    formatCurrency={formatCurrency}
                />
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
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
                            borderRadius: '6px',
                            border: '1px solid #cbd5e0',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    />
                </div>
                <button
                    onClick={loadData}
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
            </div>
        </div>
    );
};

export default ChartHeader;