import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaHome,
    FaEnvelope,
    FaPencilAlt,
    FaPuzzlePiece,
    FaTable,
    FaMap,
    FaFileAlt,
    FaLayerGroup,
    FaChevronRight,
    FaBars,
    FaProductHunt,
    FaUser,
    FaDisease,
    FaFileExcel, FaFirstOrder
} from 'react-icons/fa';
import { MdCategory } from 'react-icons/md';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import UserService from "../../services/UserService";
import 'aos/dist/aos.css';

const VerticalMenu = ({ isOpen, toggleMenu }) => {
    const [openSubMenus, setOpenSubMenus] = useState({});
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize the navigate function

    const menuItems = [
        { icon: <FaHome className="text-blue-500" />, label: 'Thống kê', link: '/admin/dash' },
        { icon: <FaFirstOrder className="text-blue-500" />, label: 'Quản lý hoá đơn', link: '/admin/order' },
        { icon: <MdCategory className="text-red-500" />, label: 'Quản lý loại sản phẩm', link: '/admin/category' },
        { icon: <FaDisease className="text-red-500" />, label: 'Quản lý thương hiệu', link: '/admin/brand' },
        { icon: <FaProductHunt className="text-orange-500" />, label: 'Quản lý sản phẩm', link: '/admin/product' },
        { icon: <FaUser className="text-pink-500" />, label: 'Quản lý người dùng', link: '/admin/user' },
        { icon: <FaEnvelope className="text-purple-500" />, label: 'Quản lý phản hồi', link: '/admin/contact' },
        { icon: <FaFileExcel className="text-purple-500" />, label: 'Excel', link: '/admin/tplXlsx' },
        { icon: <FaPencilAlt className="text-blue-500" />, label: 'Bài viết', link: '/admin/post' },
        { icon: <FaPuzzlePiece className="text-pink-500" />, label: 'UI Elements', link: '/ui-elements' },
        { icon: <FaTable className="text-orange-500" />, label: 'Tables', hasArrow: true, subItems: [
                { label: 'Basic Table', link: '/tables/basic' },
                { label: 'Data Table', link: '/tables/data' },
                { label: 'Responsive Table', link: '/tables/responsive' }
            ]},
        { icon: <FaMap className="text-purple-500" />, label: 'Maps', hasArrow: true, subItems: [
                { label: 'Google Map', link: '/maps/google' },
                { label: 'OpenStreet Map', link: '/maps/openstreet' }
            ]},
        { icon: <FaFileAlt className="text-red-500" />, label: 'Pages', hasArrow: true, subItems: [
                { label: 'Login', link: '/pages/login' },
                { label: 'Register', link: '/pages/register' },
                { label: 'Forgot Password', link: '/pages/forgot-password' }
            ]},
        { icon: <FaLayerGroup className="text-green-500" />, label: 'Multiple Levels', hasArrow: true, subItems: [
                { label: 'Level 1', link: '/levels/level1' },
                { label: 'Level 2', link: '/levels/level2' }
            ]},
        { icon: <FaUser className="text-red-500" />, label: 'Logout', action: 'logout' } // Add the logout menu item
    ];

    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (userId) {
            UserService.getUserById(userId)
                .then((data) => {
                    if (data) {
                        setUser(data);
                    } else {
                        setError("Không tìm thấy thông tin người dùng.");
                    }
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
        setOpenSubMenus((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Xác nhận đăng xuất',
            text: "Bạn có chắc chắn muốn đăng xuất không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                localStorage.removeItem('UserId');
                localStorage.removeItem('roles');
                sessionStorage.removeItem('token');
                Cookies.remove('token');

                toast.success('Đăng xuất thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                navigate('/login');
            }
        });
    };

    const handleMenuClick = (action) => {
        if (action === 'logout') {
            handleLogout();
        }
    };

    return (
        <div className={`h-screen bg-white transition-width duration-300 ${isOpen ? 'w-64' : 'w-34'}`}>
            <div className="flex items-center justify-between h-16 border-b px-4">
                {user && user.image && (
                    <img src={user.image} alt="Adminator Logo" className={`rounded-full h-10 w-10 ${isOpen ? '' : 'hidden'}`}/>
                )}
                {isOpen && user && user.fullName && (
                    <span className="ml-2 text-xl font-bold">{user.fullName}</span>
                )}
                <FaBars className="cursor-pointer text-gray-600" onClick={toggleMenu}/>
            </div>

            <ul className="mt-4">
                {menuItems.map((item, index) => (
                    <li key={index} className="flex flex-col">
                        <div
                            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                if (item.hasArrow) {
                                    toggleSubMenu(index);
                                } else if (item.action) {
                                    handleMenuClick(item.action);
                                }
                            }}
                        >
                            {item.icon}
                            {isOpen && (
                                <Link to={item.link} className="ml-2">
                                    {item.label}
                                </Link>
                            )}
                            {item.hasArrow && isOpen && (
                                <FaChevronRight
                                    className={`ml-auto transition-transform ${openSubMenus[index] ? 'rotate-90' : ''}`}
                                />
                            )}
                        </div>
                        {item.subItems && openSubMenus[index] && (
                            <ul className="ml-8 mt-2 space-y-2">
                                {item.subItems.map((subItem, subIndex) => (
                                    <li key={subIndex}>
                                        <Link to={subItem.link} className="text-gray-600 hover:text-blue-500">
                                            {subItem.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VerticalMenu;
