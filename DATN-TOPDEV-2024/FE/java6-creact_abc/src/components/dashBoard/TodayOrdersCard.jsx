import { useState, useEffect } from 'react';
import DashService from "../../services/DashService";

function TodayOrderCount() {
    const [count, setCount] = useState(0);
    const [orders, setOrders] = useState([]);
    const [showOrders, setShowOrders] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [isToday, setIsToday] = useState(true);

    // Hàm kiểm tra xem ngày chọn có phải là hôm nay không
    const checkIfToday = (dateString) => {
        const today = new Date().toISOString().slice(0, 10);
        return dateString === today;
    };

    // Hàm tải trạng thái ban đầu
    const loadInitialState = () => {
        const today = new Date().toISOString().slice(0, 10);
        setSelectedDate(today);
        setIsToday(true);

        setIsLoading(true);
        // Tải lại số lượng đơn hàng hôm nay
        DashService.getTodayOrderCount()
            .then(count => {
                setCount(count);
                // Tải lại danh sách đơn hàng hôm nay
                return DashService.getOrdersByDate(today);
            })
            .then(orderData => {
                setOrders(orderData);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Lỗi khi tải lại dữ liệu:", err);
                setIsLoading(false);
            });
    };

    // Lấy số lượng đơn hàng hôm nay khi component được tải
    useEffect(() => {
        loadInitialState();
    }, []);

    // Hàm lấy đơn hàng theo ngày
    const fetchOrdersByDate = (date) => {
        setIsLoading(true);
        DashService.getOrdersByDate(date)
            .then(orderData => {
                setOrders(orderData);

                // Nếu ngày được chọn không phải hôm nay, cập nhật count từ dữ liệu Frontend
                const isDateToday = checkIfToday(date);
                setIsToday(isDateToday);

                if (!isDateToday) {
                    setCount(orderData.length); // Đếm số đơn từ dữ liệu Frontend
                } else {
                    // Nếu là hôm nay, cập nhật lại count từ API
                    DashService.getTodayOrderCount()
                        .then(todayCount => setCount(todayCount))
                        .catch(err => console.error("Lỗi khi lấy số lượng đơn hôm nay:", err));
                }

                setIsLoading(false);
            })
            .catch(err => {
                console.error("Lỗi khi lấy danh sách đơn:", err);
                setIsLoading(false);
            });
    };

    const handleToggle = () => {
        setShowOrders(!showOrders);
        if (!showOrders) {
            // Khi mở dropdown, cập nhật dữ liệu
            fetchOrdersByDate(selectedDate);
        }
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        fetchOrdersByDate(date);
    };

    // Xử lý khi click vào nút reload
    const handleReload = (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện lan ra phần tử cha
        loadInitialState();
    };

    const formatCurrency = (amount) => {
        return amount?.toLocaleString('vi-VN') + 'đ';
    };

    // Định dạng ngày hiển thị
    const formatDisplayDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="relative w-64">
            <div
                className={`bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow-md border border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer ${showOrders ? 'border-blue-400' : ''}`}
                onClick={handleToggle}
            >
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-blue-800">
                        {isToday ? "Đơn hàng hôm nay" : "Đơn hàng"}
                    </h2>
                    <div className="flex items-center">
                        {/* Nút reload */}
                        <button
                            onClick={handleReload}
                            className="p-1 mr-2 hover:bg-blue-200 rounded-full transition-colors duration-200 text-blue-600"
                            title="Tải lại dữ liệu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <div className="bg-blue-500 p-1 rounded-full text-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <p className="text-2xl font-bold text-blue-600">{count}</p>
                </div>
                <div className="flex items-center justify-center mt-2 text-blue-600 text-xs">
                    <span>{formatDisplayDate(selectedDate)}</span>
                    <span className={`ml-2 transition-transform duration-300 ${showOrders ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                        </svg>
                    </span>
                </div>
            </div>

            <div
                className={`absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-lg z-20 text-left overflow-hidden transition-all duration-300 ${showOrders ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
            >
                <div className="p-3">
                    <div className="sticky top-0 bg-white pb-2">
                        <div className="flex justify-between items-center mb-2 border-b pb-1">
                            <h3 className="font-medium text-sm text-blue-800">Đơn hàng theo ngày</h3>
                            <div className="flex items-center">
                                {/* Nút reload trong dropdown */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); loadInitialState(); }}
                                    className="p-1 mr-1 hover:bg-blue-100 rounded-full transition-colors duration-200 text-blue-600"
                                    title="Tải lại dữ liệu hôm nay"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowOrders(false); }}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    aria-label="Đóng"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="border rounded px-2 py-1 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center p-4">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : orders.length > 0 ? (
                            <ul className="divide-y divide-gray-200 text-xs mt-2">
                                {orders.map(order => (
                                    <li key={order.id} className="py-2 hover:bg-blue-50 px-2 rounded transition-colors duration-200">
                                        <div className="flex justify-between">
                                            <div className="font-semibold text-blue-700">Mã: {order.orderNum}</div>
                                            <div className="text-gray-600">
                                                {new Date(order.orderDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="font-medium">{order.user?.fullName}</div>
                                        <div className="text-gray-600 truncate">{order.fullAddress}</div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                                Đơn mới
                                            </span>
                                            <div className="font-bold text-green-600">
                                                {formatCurrency(order.totalPrice)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-xs">
                                Không có đơn hàng nào
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TodayOrderCount;