import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu } from "react-icons/fi";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, Button } from "@nextui-org/react";
import Swal from "sweetalert2";
import UserService from "../../services/UserService";

const HeaderDownNavbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // State lưu thông tin người dùng
    const [loading, setLoading] = useState(true); // State để xử lý trạng thái loading
    const [error, setError] = useState(""); // State để lưu lỗi
    const navigate = useNavigate();

    // Check if token is present in localStorage and fetch user details
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

    return (
        <Navbar className="bg-gray-500 text-white text-lg">
            <NavbarBrand>
                <Dropdown>
                    <DropdownTrigger>
                        <Button className="capitalize" variant="bordered">
                            <FiMenu /> Danh mục sản phẩm
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        disallowEmptySelection
                        aria-label="Single selection example"
                        selectionMode="single"
                        variant="flat"
                    >
                        <DropdownItem key="text">Category1</DropdownItem>
                        <DropdownItem key="number">Category1</DropdownItem>
                        <DropdownItem key="date">Category1</DropdownItem>
                        <DropdownItem key="single_date">Category1</DropdownItem>
                        <DropdownItem key="iteration">Category1</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </NavbarBrand>

            <NavbarContent className="hidden sm:flex gap-4" justify="left">
                <NavbarItem>
                    <Link color="foreground" href="#" to={"/"}>Trang chủ</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link aria-current="page" color="secondary" href="#" to={"/aboutUs"}>Giới thiệu</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#" to={"/products"}>Sản phẩm</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#" to={"/news"}>Tin tức</Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#" to={"/contact"}>Liên hệ</Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent as="div" justify="end" className="flex items-center gap-2">
                {loading ? (
                    <Button disabled>Đang tải...</Button> // Hiển thị khi đang tải thông tin
                ) : isLoggedIn && user ? (
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <div className="flex items-center gap-2">
                                <Avatar
                                    isBordered
                                    as="button"
                                    className="transition-transform"
                                    color="secondary"
                                    src={user.image} // Dùng ảnh từ API
                                    name={user.name} // Dùng tên từ API
                                    size="sm"
                                />
                            </div>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
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
                        <Button>
                            <Link to="/login" variant="outlined" color="secondary">
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
