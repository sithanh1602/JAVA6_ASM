import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import { FaTruck, FaBook, FaCoins, FaBell, FaDesktop, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Popover, PopoverTrigger, PopoverContent, Badge, ScrollShadow, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import OrderService from "../../services/OrderSevice";
import DataTable from 'react-data-table-component';

const Header = () => {
    const [notifications, setNotifications] = useState([]);
    const [userId, setUserId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderProducts, setOrderProducts] = useState([]);



    useEffect(() => {
        AOS.init({ duration: 1000 });

        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.userId);
            fetchNotifications(decodedToken.userId);
        }
    }, []);

    const filterRecentNotifications = (notifications) => {
        const now = new Date();
        return notifications.map(notification => {
            const createdAt = new Date(notification.createdAt);
            const expirationDate = new Date(createdAt);
            expirationDate.setDate(createdAt.getDate() + 7);
            const timeLeft = Math.max(0, expirationDate - now);
            return { ...notification, timeLeft };
        }).filter(notification => notification.timeLeft > 0);
    };

    const fetchNotifications = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/notifications/user/${userId}`);
            const recentNotifications = filterRecentNotifications(response.data);
            setNotifications(recentNotifications);
            setUnreadCount(recentNotifications.filter(notification => !notification.read).length);
            console.log('Notifications:', recentNotifications); // Debug: Check notification data
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            console.log('Fetching order details for orderId:', orderId); // Debug
            const order = await OrderService.getOrderById(orderId);
            const products = await OrderService.getProductsByOrderId(orderId);
            console.log('Order:', order); // Debug: Check order data
            console.log('Products:', products); // Debug: Check products data

            if (order) {
                setSelectedOrder(order);
            } else {
                console.warn('Order not found');
            }
            if (products) {
                setOrderProducts(products);
            } else {
                setOrderProducts([]);
            }
            setIsModalOpen(true);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            setIsModalOpen(false); // Ensure modal doesn't open on error
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

    const formatTimeLeft = (timeLeft) => {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days} ngày, ${hours} giờ`;
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`);
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === notificationId ? { ...notification, isRead: true } : notification
                )
            );
            setUnreadCount((prevCount) => prevCount - 1);
        } catch (error) {
            console.error('Lỗi khi đánh dấu đã đọc:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        console.log('Clicked notification:', notification); // Debug: Check notification content
        markAsRead(notification.id);
        if (notification.order.id) {
            fetchOrderDetails(notification.order.id);
        } else {
            console.warn('No orderId found in notification');
        }
    };

    const productColumns = [
        { name: 'Ảnh', cell: row => <img src={row.imageUrl} alt={row.name} className="w-16 h-16 object-cover rounded-md" /> },
        { name: 'Tên Sản Phẩm', selector: row => row.name, sortable: true },
        { name: 'Số Lượng', selector: row => row.quantity, sortable: true },
        { name: 'Giá', selector: row => row.price, sortable: true, format: row => `${row.price.toLocaleString()} VNĐ` },
    ];

    return (
        <>
            <header className="sticky-header border-b border-gray-200 bg-white shadow-md" data-aos="fade-down">
                <div className="items-center justify-center">
                    <div className="w-[80%] max-w-full mx-auto">
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
                                    <span className="text-gray-700 hover:text-green-500 pl-2">Theo dõi đơn hàng</span>
                                </Link>
                                <Link to="/policies" className="flex items-center">
                                    <FaBook size={18} className="text-gray-700 hover:text-blue-600" />
                                    <span className="text-gray-700 hover:text-blue-600 pl-2">Chính sách</span>
                                </Link>
                                <Link to="/payment" className="flex items-center">
                                    <FaCoins size={18} className="text-gray-700 hover:text-blue-600" />
                                    <span className="text-gray-700 hover:text-blue-600 pl-2">Thanh toán</span>
                                </Link>
                                <Link to="/BuilderPC" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                                    <FaDesktop size={18} className="text-blue-600" />
                                    <span className="text-blue-600 font-semibold pl-2">Build PC</span>
                                </Link>

                                <Popover placement="bottom-end" showArrow={true}>
                                    <PopoverTrigger>
                                        <div className="relative cursor-pointer flex items-center ml-1">
                                            <Badge
                                                content={unreadCount}
                                                color="danger"
                                                size="sm"
                                                shape="circle"
                                                isInvisible={unreadCount === 0}
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
                                                    notifications.map((notification) => {
                                                        const isRead = notification.isRead;

                                                        return (
                                                            <div
                                                                key={notification.id}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={`p-4 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer ${
                                                                    !isRead ? 'bg-blue-50' : ''
                                                                }`}
                                                            >
                                                                {isRead ? (
                                                                    <FaEnvelopeOpen size={16} className="text-gray-400" />
                                                                ) : (
                                                                    <FaEnvelope size={16} className="text-blue-600" />
                                                                )}
                                                                <div>
                                                                    <p className={`text-sm mb-1 ${!isRead ? 'font-semibold' : ''}`}>
                                                                        {notification.content}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {notification.createdAt ? formatDate(notification.createdAt) : 'Mới đây'}
                                                                    </p>
                                                                    <p className="text-xs text-red-500">
                                                                        Thời hạn: {formatTimeLeft(notification.timeLeft)} còn lại
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
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

            {/* Modal for Order Details */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="5xl">
                <ModalContent className="rounded-none !border-radius-0">
                    <ModalHeader>
                        <h3>Chi tiết đơn hàng #{selectedOrder?.orderNum || 'N/A'}</h3>
                    </ModalHeader>
                    <ModalBody>
                        {selectedOrder ? (
                            <>
                                <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.orderDate)}</p>
                                <p><strong>Trạng thái:</strong> {selectedOrder.status || 'Chưa xác định'}</p>
                                <p><strong>Tổng tiền:</strong> {selectedOrder.
                                totalPrice?.toLocaleString('vi-VN') || 0} VNĐ</p>
                                <h4 className="mt-4">Sản phẩm trong đơn hàng:</h4>
                                {orderProducts.length > 0 ? (
                                    <DataTable
                                        columns={productColumns}
                                        data={orderProducts}
                                        dense
                                        noHeader
                                        highlightOnHover
                                        customStyles={{
                                            table: {
                                                style: {
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '4px',
                                                },
                                            },
                                            headCells: {
                                                style: {
                                                    backgroundColor: '#f3f4f6',
                                                    fontWeight: 'bold',
                                                    color: '#374151',
                                                },
                                            },
                                            cells: {
                                                style: {
                                                    padding: '8px',
                                                },
                                            },
                                        }}
                                    />
                                ) : (
                                    <p>Không có sản phẩm trong đơn hàng này.</p>
                                )}
                            </>
                        ) : (
                            <p>Không có thông tin đơn hàng để hiển thị.</p>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={() => setIsModalOpen(false)}>
                            Đóng
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Header;