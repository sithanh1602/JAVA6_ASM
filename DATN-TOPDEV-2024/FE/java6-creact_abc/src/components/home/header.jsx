import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import { FaTruck, FaBook, FaCoins, FaBell, FaDesktop } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Popover, PopoverTrigger, PopoverContent, Divider, ScrollShadow, Badge } from '@nextui-org/react';

const Header = () => {
    const [notifications, setNotifications] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });

        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.userId);
            fetchNotifications(decodedToken.userId);
        }
    }, []);

    const fetchNotifications = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/notifications/user/${userId}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`);
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('Lỗi khi đánh dấu đã đọc:', error);
        }
    };

    // const unreadCount = notifications.filter(notification => !notification.read).length;

    return (
        <header className="sticky-header border-b border-gray-200 bg-white shadow-md" data-aos="fade-down">
            <div className="items-center justify-center">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-4 space-y-2 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-2">
                                <i className="fas fa-map-marker-alt text-red-500"></i>
                                <span className="text-gray-700 hover:text-red-500 cursor-pointer transition duration-300">
                                    306h/2 KDC Hàng Bàng, An Khánh, Ninh Kiều, Cần Thơ
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <i className="fas fa-envelope text-blue-500"></i>
                                <span className="text-gray-700 hover:text-blue-500 cursor-pointer transition duration-300">
                                    info@fivestar.team
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <Link to="/OrderUser" className="flex items-center">
                                <FaTruck size={20} color="green" />
                                <span className="text-gray-700 hover:text-green-500 cursor-pointer transition duration-300 pl-2">
                                    Theo dõi đơn hàng
                                </span>
                            </Link>
                            <Link to="/policies" className="flex items-center">
                                <FaBook size={18} className="text-gray-700 hover:text-blue-600 transition duration-300" />
                                <span className="text-gray-700 hover:text-blue-600 cursor-pointer transition duration-300 pl-2">
                                    Chính sách
                                </span>
                            </Link>
                            <Link to="/payment" className="flex items-center">
                                <FaCoins size={18} className="text-gray-700 hover:text-blue-600 transition duration-300" />
                                <span className="text-gray-700 hover:text-blue-600 cursor-pointer transition duration-300 pl-2">
                                    Thanh toán
                                </span>
                            </Link>
                            <Link to="/BuilderPC" className="flex items-center p-2 hover:bg-gray-100 transition duration-300 rounded-md">
                                <FaDesktop size={18} className="text-blue-600 hover:text-blue-800 transition duration-300" />
                                <span className="text-blue-600 font-semibold hover:text-blue-800 cursor-pointer transition duration-300 pl-2">
                                    Build PC
                                </span>
                            </Link>
                            <Popover
                                placement="bottom-end"
                                showArrow={true}
                                onOpenChange={(open) => {
                                    if (open) {
                                        notifications.forEach(notification => {
                                            if (!notification.read) {
                                                markAsRead(notification.id);
                                            }
                                        });
                                    }
                                }}
                            >
                                <PopoverTrigger>
                                    <div className="relative cursor-pointer flex items-center ml-1">
                                        <Badge
                                            // content={unreadCount}
                                            color="danger"
                                            size="sm"
                                            shape="circle"
                                            // isInvisible={unreadCount === 0}
                                            classNames={{
                                                badge: "font-bold text-xs"
                                            }}
                                        >
                                            <FaBell size={25} className="text-yellow-500" />
                                        </Badge>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <div className="w-80 max-w-80">
                                        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                                            <h3>Thông báo của bạn</h3>
                                        </div>
                                        <ScrollShadow className="max-h-80">
                                            {notifications.length > 0 ? (
                                                notifications.map((notification, index) => (
                                                    <div key={notification.id || index}>
                                                        <div className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                                                            <p className={`text-sm mb-1 ${!notification.read ? 'font-semibold' : ''}`}>
                                                                {notification.content}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {notification.createdAt ? formatDate(notification.createdAt) : "Mới đây"}
                                                            </p>
                                                        </div>
                                                        {index < notifications.length - 1 && <Divider />}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-gray-500">
                                                    <p>Không có thông báo</p>
                                                </div>
                                            )}
                                        </ScrollShadow>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;