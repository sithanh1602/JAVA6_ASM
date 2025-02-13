import React, { useEffect, useState } from 'react';
import { Link, useNavigate,useLocation } from 'react-router-dom';
import { FiMenu } from "react-icons/fi";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Button } from "@nextui-org/react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import UserService from "../../services/UserService";

const HeaderDownNavbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // State lưu thông tin người dùng
    const [loading, setLoading] = useState(true); // State để xử lý trạng thái loading
    const [error, setError] = useState(""); // State để lưu lỗi
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation(); // Lấy đường dẫn hiện tại
    const navigate = useNavigate();

    // Check if token is present in localStorage and fetch user details
    useEffect(() => {
        // Nếu không phải trang chủ thì ẩn menu
        if (location.pathname !== "/") {
            setIsOpen(false);
        }
    }, [location.pathname]); // Chạy lại khi đường dẫn thay đổi

    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (userId) {
            UserService.getUserById(userId)
                .then((data) => {
                    if (data) {
                        setUser(data); // Lưu thông tin người dùng vào state
                        setIsLoggedIn(true);
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

    // Handle logout function
    const handleLogout = () => {
        // Remove the token from localStorage
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        localStorage.removeItem('UserId');

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

        // Reload the page
        window.location.reload();
    };

    const menuItems = [
        { icon: "fas fa-laptop", text: "Thiết bị điện tử" },
        { icon: "fas fa-headphones-alt", text: "Phụ kiện" },
        { icon: "fas fa-tv", text: "TV & Đồ gia dụng" },
        { icon: "fas fa-heartbeat", text: "Sức khỏe & Làm đẹp" },
        { icon: "fas fa-baby", text: "Mẹ & Bé" },
        { icon: "fas fa-tshirt", text: "Thời trang" },
        { icon: "fas fa-home", text: "Nhà cửa & Đời sống" },
        { icon: "fas fa-futbol", text: "Thể thao & Du lịch" },
        { icon: "fas fa-futbol", text: "Thể thao & Du lịch" },
        { icon: "fas fa-futbol", text: "Thể thao & Du lịch" },
    ];

    return (
        <Navbar className="bg-white text-black ">
            <div className="relative w-64">
                <button
                    className="w-full capitalize text-white flex items-center px-4 py-4 border border-gray-300 shadow-sm bg-blue-800"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <FiMenu className="mr-2"/> Danh mục sản phẩm
                </button>

                <motion.div
                    initial={{opacity: 0, y: -10, height: 0}}
                    animate={isOpen ? {opacity: 1, y: 0, height: "auto"} : {opacity: 0, y: -10, height: 0}}
                    transition={{duration: 0.3, ease: "easeInOut"}}
                    className="absolute left-0 w-full bg-white border border-gray-200 shadow-lg z-50 overflow-hidden"
                >
                    <ul className="divide-y divide-gray-200">
                        {menuItems.map((item, index) => (
                            <li key={index} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer">
                                <i className={`${item.icon} mr-3`}></i>
                                <span className="flex-grow">{item.text}</span>
                                <i className="fas fa-chevron-right"></i>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>
            <NavbarContent className="hidden sm:flex justify-center w-full gap-6 pl-20">
                <NavbarItem>
                    <Link color="foreground" className="hover:text-blue-500 hover:underline" to={"/"}>Trang chủ</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link aria-current="page" className="hover:text-blue-500 hover:underline" color="secondary" to={"/aboutUs"}>Giới
                        thiệu</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" className="hover:text-blue-500 hover:underline" to={"/products"}>Sản phẩm</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" className="hover:text-blue-500 hover:underline" to={"/news"}>Tin tức</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" className="hover:text-blue-500 hover:underline" to={"/contact"}>Liên hệ</Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent as="div" justify="end" className="flex items-center gap-2">
                {loading ? (
                    <Button disabled>Đang tải...</Button> // Hiển thị khi đang tải thông tin
                ) : isLoggedIn && user ? (
                    <Dropdown placement="bottom-end" backdrop="blur">
                        <DropdownTrigger>
                            <div className="flex items-center gap-2">
                                <Avatar
                                    isBordered
                                    color="primary"
                                    as="button"
                                    className="transition-transform"
                                    src={user.image} // Dùng ảnh từ API
                                    name={user.name} // Dùng tên từ API
                                    size="md"
                                />
                                <p className="text-sm">{user.fullName}!!</p> {/* Hiển thị họ tên */}
                            </div>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat" radius="none">
                            <DropdownItem>
                                <p className="font-semibold text-md">{user.fullName}</p> {/* Hiển thị họ tên */}
                                <p className="text-sm text-gray-500">{user.email}</p> {/* Hiển thị email */}
                            </DropdownItem>
                            <DropdownItem>
                                <Link to="/profile" variant="outlined" color="secondary">
                                    Hồ sơ
                                </Link>
                            </DropdownItem>
                            <DropdownItem key="help_and_feedback">Hỗ trợ</DropdownItem>
                            <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                                Đăng xuất
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                ) : (
                    <div className="ml-auto">
                        <Button
                            color="primary"
                            radius="none"
                        >
                            <Link to="/loginn" variant="outlined" color="secondary">
                                Đăng nhập
                            </Link>
                        </Button>
                    </div>
                )}

                {error && (
                    <DropdownItem>{error}</DropdownItem> // Hiển thị lỗi nếu có
                )}
            </NavbarContent>
        </Navbar>
    );
};

export default HeaderDownNavbar;
