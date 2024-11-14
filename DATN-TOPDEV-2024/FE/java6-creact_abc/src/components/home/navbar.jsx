import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logoWeb.png';
import AOS from 'aos'; // Import AOS library
import 'aos/dist/aos.css'; // Import AOS styles

const Navbar = () => {
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
        // Initialize AOS
        AOS.init({
            duration: 1000, // Set animation duration
            easing: 'ease-in-out', // Set easing type
            once: true, // Run animation only once
        });

        // Check for a token in cookie, sessionStorage, or localStorage
        const cookieToken = document.cookie.includes('token');
        const sessionToken = sessionStorage.getItem('token');
        const localToken = localStorage.getItem('token');

        setIsLoggedIn(cookieToken || sessionToken || localToken); // Set login status
    }, []);

    const handleLogout = () => {
        // Remove token from all storage and cookies
        document.cookie = 'token=; Max-Age=0'; // Clear token in cookies
        sessionStorage.removeItem('token');    // Clear token in sessionStorage
        localStorage.removeItem('token');      // Clear token in localStorage
        localStorage.removeItem('roles');
        setIsLoggedIn(false);                  // Update login status
        setUserDropdownOpen(false);
        // Show success message using SweetAlert2
        Swal.fire({
            icon: 'success',
            title: 'Đăng xuất thành công!',
            showConfirmButton: false,
            timer: 1500
        });
    };

    return (
        <>
            <nav className="bg-white shadow sticky top-0 z-50" data-aos="fade-down">
                <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-0">
                    {/* Logo Section */}
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

                    {/* Menu Section (Centered) */}
                    <div className="hidden md:flex justify-center flex-1">
                        <ul className="flex space-x-8">
                            <li>
                                <Link to="/" className="text-gray-700 hover:text-orange-500 transition duration-300">Trang
                                    chủ</Link>
                            </li>
                            <li>
                                <Link to="/about"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Giới
                                    thiệu</Link>
                            </li>
                            <li>
                                <Link to="/products"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Sản
                                    phẩm</Link>
                            </li>
                            <li>
                                <Link to=""
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Tin tức</Link>
                            </li>
                            <li>
                                <Link to=""
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Liên hệ</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Icons and User Section */}
                    <div className="flex items-center space-x-4 p-3">
                        <Link to="" className="text-gray-700 hover:text-orange-500 transition duration-300">
                            <i className="fas fa-heart"></i>
                        </Link>
                        <Link to="/cart" className="text-gray-700 hover:text-orange-500 transition duration-300">
                            <i className="fas fa-shopping-cart"></i>
                        </Link>

                        {/* User Dropdown */}
                        <div className="relative">
                            <i
                                onClick={toggleUserDropdown}
                                className="fas fa-user text-gray-700 hover:text-orange-500 transition duration-300 cursor-pointer"
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
                                            <li>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                >
                                                    Đăng xuất
                                                </button>
                                                <button
                                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                >
                                                    Đổi mật khẩu
                                                </button>
                                            </li>
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

        </>
    );
};

export default Navbar;
