import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaHome, FaEnvelope, FaPencilAlt, FaTable, FaFileAlt, 
    FaChevronRight, FaBars, FaProductHunt, FaUser, FaDisease, FaFirstOrder, 
    FaDesktop, FaMoon, FaSun,FaDonate
} from 'react-icons/fa';
import { MdCategory } from 'react-icons/md';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import UserService from "../../services/UserService";
import { useTheme } from '../../views/ThemeContext';
import 'aos/dist/aos.css';

const VerticalMenu = ({ isOpen, toggleMenu }) => {
    const [openSubMenus, setOpenSubMenus] = useState({});
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useTheme();

    const menuItems = [
        { icon: <FaHome className="text-blue-500 dark:text-blue-400" />, label: 'Thống kê', link: '/admin/dash' },
        { icon: <FaFirstOrder className="text-blue-500 dark:text-blue-400" />, label: 'Quản lý hoá đơn', link: '/admin/order' },
        { icon: <MdCategory className="text-red-500 dark:text-red-400" />, label: 'Quản lý loại sản phẩm', link: '/admin/category' },
        { icon: <FaDisease className="text-red-500 dark:text-red-400" />, label: 'Quản lý thương hiệu', link: '/admin/brand' },
        { icon: <FaProductHunt className="text-orange-500 dark:text-orange-400" />, label: 'Quản lý sản phẩm', link: '/admin/product' },
        { icon: <FaDesktop className="text-green-500 dark:text-green-400" />, label: 'Cấu hình PC', link: '/admin/pc-builds' },
        { icon: <FaDonate className="text-green-500 dark:text-green-400" />, label: 'Quản lý voucher', link: '/admin/voucher' },
        { icon: <FaFileAlt className="text-pink-500" />, label: "Quản lý đánh giá", link: "/admin/reviews" },
        { icon: <FaUser className="text-pink-500 dark:text-pink-400" />, label: 'Quản lý người dùng', link: '/admin/user' },
        { icon: <FaEnvelope className="text-purple-500 dark:text-purple-400" />, label: 'Quản lý phản hồi', link: '/admin/contact' },
        { icon: <FaPencilAlt className="text-blue-500 dark:text-blue-400" />, label: 'Bài viết', link: '/admin/post' },
        
        { icon: <FaTable className="text-orange-500 dark:text-orange-400" />, label: 'Tables', hasArrow: true, subItems: [
                { label: 'Basic Table', link: '/tables/basic' },
                { label: 'Data Table', link: '/tables/data' },
                { label: 'Responsive Table', link: '/tables/responsive' }
            ]},
        { icon: <FaUser className="text-red-500 dark:text-red-400" />, label: 'Logout', action: 'logout' }
    ];

    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (userId) {
            UserService.getUserById(userId)
                .then((data) => {
                    if (data) setUser(data);
                    else setError("Không tìm thấy thông tin người dùng.");
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching user:", err);
                    setError("Không thể tải thông tin người dùng.");
                    setLoading(false);
                });
        } else {
            setError("UserId không tồn tại trong localStorage.");
            setLoading(false);
        }
    }, []);

    const toggleSubMenu = (index) => {
        setOpenSubMenus((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const handleLogout = () => {
        Swal.fire({
            title: "Xác nhận đăng xuất",
            text: "Bạn có chắc chắn muốn đăng xuất không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Đăng xuất",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                localStorage.removeItem("UserId");
                localStorage.removeItem("roles");
                sessionStorage.removeItem("token");
                Cookies.remove("token");
                toast.success("Đăng xuất thành công!", { position: "top-right", autoClose: 3000 });
                navigate("/login");
            }
        });
    };

    const handleMenuClick = (action) => {
        if (action === "logout") handleLogout();
    };

    return (
        <div
            className={`h-screen bg-white dark:bg-gray-800 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'w-64' : 'w-16'
            }`}
        >
            <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 px-4">
                {isOpen ? (
                    <div className="flex items-center overflow-hidden">
                        {user && user.image && (
                            <img
                                src={user.image}
                                alt="User"
                                className="rounded-full h-8 w-8 object-cover transition-opacity duration-300"
                            />
                        )}
                        {user && user.fullName && (
                            <span className="ml-2 text-lg font-bold truncate transition-opacity duration-300 dark:text-white">
                                {user.fullName}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="flex-1"></div>
                )}
                <div className="flex items-center">
                    <button
                        className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={toggleMenu}
                        aria-label={isOpen ? 'Close menu' : 'Open menu'}
                    >
                        <FaBars
                            className={`text-gray-600 dark:text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            </div>

            <ul className="mt-4">
                {menuItems.map((item, index) => (
                    <li key={index} className="flex flex-col">
                        <div
                            className={`flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${
                                isOpen ? '' : 'justify-center'
                            }`}
                            onClick={() => {
                                if (item.hasArrow) toggleSubMenu(index);
                                else if (item.action) handleMenuClick(item.action);
                                else if (item.link && !isOpen) navigate(item.link);
                            }}
                        >
                            <div className={`text-xl ${isOpen ? '' : 'mx-auto'}`}>
                                {item.icon}
                            </div>
                            {item.link && isOpen ? (
                                <Link
                                    to={item.link}
                                    className="ml-3 whitespace-nowrap transition-all duration-300 dark:text-white"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={`ml-3 whitespace-nowrap transition-all duration-300 dark:text-white ${
                                        isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'
                                    }`}
                                >
                                    {item.label}
                                </span>
                            )}
                            {item.hasArrow && isOpen && (
                                <FaChevronRight
                                    className={`ml-auto transition-transform duration-300 dark:text-gray-400 ${
                                        openSubMenus[index] ? 'rotate-90' : ''
                                    }`}
                                />
                            )}
                        </div>
                        {item.subItems && isOpen && (
                            <ul
                                className={`ml-8 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                                    openSubMenus[index] ? 'max-h-40 opacity-100 my-2' : 'max-h-0 opacity-0'
                                }`}
                            >
                                {item.subItems.map((subItem, subIndex) => (
                                    <li key={subIndex} className="py-1">
                                        <Link
                                            to={subItem.link}
                                            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                                        >
                                            {subItem.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            <div className="pl-2">
                <button
                    className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
                    onClick={toggleDarkMode}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {darkMode ? (
                        <FaSun className="text-yellow-400" />
                    ) : (
                        <FaMoon className="text-gray-600" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default VerticalMenu;