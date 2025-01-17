import React, { useState, useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom'; // Đảm bảo sử dụng Link từ react-router-dom
import Swal from 'sweetalert2';
import logo from '../../assets/images/cpu2.png';
import {Input} from "@nextui-org/react";
import { FiSearch } from "react-icons/fi";

const Navbar = () => {
    const [cartItems, setCartItems] = useState([]);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();  // Khởi tạo useNavigate

    const toggleUserDropdown = () => {
        setUserDropdownOpen(!isUserDropdownOpen);
    };

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(cart);

        const cookieToken = document.cookie.includes('token');
        const sessionToken = sessionStorage.getItem('token');
        const localToken = localStorage.getItem('token');
        setIsLoggedIn(cookieToken || sessionToken || localToken);
    }, []);

    const handleLogout = () => {
        // Xoá token và thông tin người dùng khỏi localStorage và sessionStorage
        document.cookie = 'token=; Max-Age=0';
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        localStorage.removeItem('UserId');

        // Đặt lại trạng thái đăng nhập
        setIsLoggedIn(false);
        setUserDropdownOpen(false);

        // Hiển thị thông báo SweetAlert
        Swal.fire({
            icon: 'success',
            title: 'Đăng xuất thành công!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            // Chuyển hướng về trang chủ ("/") sau khi thông báo hiển thị xong
            navigate('/');
        });
    };

    return (
        <nav className="shadow sticky top-0 z-50 bg-white" data-aos="fade-down">
            <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-0">
                <div className="flex items-center space-x-4 p-3">
                    <img
                        src={logo}
                        alt="Logo Mona Smart Technology"
                        className="h-10 w-10 animate-spin"
                    />
                    <div className="flex flex-col">
                        <span className="text-2xl font-semibold">TECHSMART.VN</span>
                        <span className="text-gray-500text-sm">TECH ELECTRONICS</span>
                    </div>
                </div>
                <div className="hidden md:flex justify-center flex-1">
                    <div className="relative flex items-center w-full max-w-md">
                        {/* Search Icon */}
                        <FiSearch className="absolute left-3 text-gray-400 text-lg"/>

                        {/* Input Field */}
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm, danh mục..."
                            className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-4 p-3">
                    <Link to="" className="text-gray-700 hover:text-orange-500"><i className="fas fa-heart fa-x"></i></Link>

                    {/* Giỏ hàng với hover để hiển thị tất cả sản phẩm trong giỏ hàng */}
                    <div className="relative group">
                        <Link to="/cart" className="text-gray-700 hover:text-orange-500">
                            <i className="fas fa-shopping-cart fa-x"></i>
                        </Link>

                        {/* Dropdown hiển thị sản phẩm khi hover */}
                        <div
                            className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md hidden group-hover:block">
                            <div className="p-4 max-h-60 overflow-y-auto">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2">
                                            <span>{item.name}</span>
                                            <span>{item.quantity} x {item.price}₫</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500">Giỏ hàng trống</p>
                                )}
                            </div>
                            <Link to="/cart" className="block text-center py-2 border-t border-gray-200 text-gray-700 hover:bg-gray-100">
                                Xem giỏ hàng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
