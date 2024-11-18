import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Đảm bảo sử dụng Link từ react-router-dom
import Swal from 'sweetalert2';
import logo from '../../assets/images/logoWeb.png';
import Cart from "../../pages/Cart"; // Component Giỏ Hàng
import AOS from 'aos';
import 'aos/dist/aos.css';

const Navbar = () => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartVisible, setIsCartVisible] = useState(false); // Trạng thái hiển thị giỏ hàng
    const [isCategoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const toggleCategoryDropdown = () => {
        setCategoryDropdownOpen(!isCategoryDropdownOpen);
    };

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
        document.cookie = 'token=; Max-Age=0';
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        localStorage.removeItem('UserId');
        setIsLoggedIn(false);
        setUserDropdownOpen(false);
        Swal.fire({
            icon: 'success',
            title: 'Đăng xuất thành công!',
            showConfirmButton: false,
            timer: 1500
        });
    };

    return (
        <nav className="bg-white shadow sticky top-0 z-50" data-aos="fade-down">
            <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-0">
                <div className="flex items-center space-x-4 p-3">
                    <img
                        src={logo}
                        alt="Mona Smart Technology Logo"
                        className="h-10"
                    />
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold">TECH SMART</span>
                        <span className="text-orange-300 text-sm">TECHNOLOGY</span>
                    </div>
                </div>
                    <div className="hidden md:flex justify-center flex-1">
                        <ul className="flex space-x-8">
                            <li>
                                <Link to="/" className="text-gray-700 hover:text-orange-500 transition duration-300">Trang
                                    chủ</Link>
                            </li>
                            <li>
                                <Link to="/aboutUs"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Giới
                                    thiệu</Link>
                            </li>
                            <li>
                                <Link to="/products"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Sản
                                    phẩm</Link>
                            </li>
                            <li>
                                <Link to="/news"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Tin tức</Link>
                            </li>
                            <li>
                                <Link to="/contact"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Liên hệ</Link>
                            </li>
                        </ul>
                    </div>
                <div className="flex items-center space-x-4 p-3">
                    <Link to="" className="text-gray-700 hover:text-orange-500"><i className="fas fa-heart"></i></Link>

                    {/* Giỏ hàng với hover để hiển thị tất cả sản phẩm trong giỏ hàng */}
                    <div className="relative group">
                        <Link to="/cart" className="text-gray-700 hover:text-orange-500">
                            <i className="fas fa-shopping-cart"></i>
                        </Link>

                        {/* Dropdown hiển thị sản phẩm khi hover */}
                        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md hidden group-hover:block">
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

                    {/* Dropdown cho người dùng */}
                    <div className="relative">
                        <i
                            onClick={toggleUserDropdown}
                            className="fas fa-user text-gray-700 hover:text-orange-500 cursor-pointer"
                        ></i>
                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20">
                                <ul className="py-2">
                                    <li>
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            Hồ sơ
                                        </Link>
                                    </li>
                                    {isLoggedIn ? (
                                        <>
                                            <li>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </li>
                                            <li>
                                                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                                                    Đổi mật khẩu
                                                </button>
                                            </li>
                                        </>
                                    ) : (
                                        <li>
                                            <Link
                                                to="/login"
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                Đăng nhập
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
