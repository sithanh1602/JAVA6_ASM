import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu } from "react-icons/fi";
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
    Button,
    User
} from "@nextui-org/react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import UserService from "../../services/UserService";
import CategoryService from "../../services/CategoryService";
import BrandService from "../../services/BrandService";
import Cookies from "js-cookie";

const HeaderDownNavbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState({});
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [loadingBrands, setLoadingBrands] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    const handleCategoryClick = (categoryId) => {
        navigate(`/products?category=${categoryId}`);
        // Tải lại trang sau khi thay đổi URL
        window.location.reload();
    };

    const handleBrandClick = (brandId) => {
        navigate(`/products?brand=${brandId}`);
        // Tải lại trang sau khi thay đổi URL
        window.location.reload();
    };

    useEffect(() => {
        if (location.pathname !== "/") {
            setIsOpen(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await CategoryService.getAllCategories();
                console.log("Categories loaded:", data);
                setCategories(data);
            } catch (err) {
                console.error("Error loading categories:", err);
                setError("Không thể tải danh mục sản phẩm");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (userId) {
            UserService.getUserById(userId)
                .then((data) => {
                    if (data) {
                        setUser(data);
                        setIsLoggedIn(true);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error loading user:", err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const handleCategoryHover = async (categoryId) => {
        setHoveredCategory(categoryId);

        if (!brands[categoryId] && !loadingBrands[categoryId]) {
            setLoadingBrands(prev => ({ ...prev, [categoryId]: true }));
            try {
                const data = await BrandService.getBrandsByCategory(categoryId);
                console.log(`Brands loaded for category ${categoryId}:`, data);
                setBrands(prev => ({ ...prev, [categoryId]: data }));
            } catch (error) {
                console.error(`Error loading brands for category ${categoryId}:`, error);
            } finally {
                setLoadingBrands(prev => ({ ...prev, [categoryId]: false }));
            }
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        localStorage.removeItem('UserId');
        Cookies.remove('token');
        Swal.fire({
            icon: 'success',
            title: 'Đăng xuất thành công!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            navigate('/');
            window.location.reload();
        });
    };

    return (
        <Navbar className="bg-white text-black">
            <div className="relative w-64">
                <button
                    className="w-full capitalize text-white flex items-center px-4 py-4 border border-gray-300 shadow-sm bg-blue-800"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <FiMenu className="mr-2"/> Danh mục sản phẩm
                </button>

                {/* Menu chính */}
                <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: isOpen ? 1 : 0, scaleY: isOpen ? 1 : 0 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute left-0 w-full bg-white border border-gray-200 shadow-lg z-40 origin-top"
                >
                        <ul className="divide-y divide-gray-200">
                            {categories.map((category) => (
                                <li
                                    key={category.id}
                                    className="relative"
                                    onMouseEnter={() => handleCategoryHover(category.id)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <div className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                                         onClick={() => handleCategoryClick(category.id)}>
                                        <span className="flex-grow">{category.name}</span>
                                        <i className="fas fa-chevron-right"></i>
                                    </div>

                                    {hoveredCategory === category.id && (
                                        <motion.div
                                            initial={{opacity: 0, x: -10}}
                                            animate={{opacity: 1, x: 0}}
                                            exit={{opacity: 0, x: -10}}
                                            transition={{duration: 0.2}}
                                            className="absolute left-full top-0 w-56 bg-white border border-gray-200 shadow-lg z-50"
                                            style={{minHeight: "100%"}}
                                        >
                                            <ul className="py-1">
                                                <span className="pl-2 text-blue-900 font-bold">Thương hiệu</span>
                                                {loadingBrands[category.id] ? (
                                                    <li className="px-4 py-2">Đang tải...</li>
                                                ) : Array.isArray(brands[category.id]) && brands[category.id].length > 0 ? (
                                                    brands[category.id].map((brand) => {
                                                        console.log("Brand object:", brand); // Kiểm tra dữ liệu brand
                                                        return (
                                                            <li
                                                                key={brand.id}
                                                                className="hover:bg-gray-100 cursor-pointer"
                                                                onClick={() => handleBrandClick(brand.brandsId)}
                                                            >
                                                                <div className="block px-4 py-2">{brand.name}</div>
                                                            </li>
                                                        );
                                                    })
                                                ) : (
                                                    <li className="px-4 py-2">Không có thương hiệu</li>
                                                )}
                                            </ul>
                                        </motion.div>
                                    )}
                                </li>
                            ))}
                        </ul>
                </motion.div>
            </div>

            <NavbarContent className="hidden sm:flex justify-center w-full gap-4 pl-20">
                <NavbarItem><Link to="/">Trang chủ</Link></NavbarItem>
                <NavbarItem><Link to="/aboutUs">Giới thiệu</Link></NavbarItem>
                <NavbarItem><Link to="/products">Sản phẩm</Link></NavbarItem>
                <NavbarItem><Link to="/PC">PC</Link></NavbarItem>
                <NavbarItem><Link to="/posts">Tin tức</Link></NavbarItem>
                <NavbarItem><Link to="/contact">Liên hệ</Link></NavbarItem>
            </NavbarContent>

            <NavbarContent justify="end">
                {loading ? (
                    <Button isLoading color="primary" variant="ghost">
                        Đang tải...
                    </Button>
                ) : isLoggedIn && user ? (
                    <Dropdown placement="bottom-start">
                        <DropdownTrigger>
                            <User
                                as="button"
                                avatarProps={{
                                    isBordered: true,
                                    src: user.image
                                }}
                                className="transition-transform"
                                description={user.phone}
                                name={`Chào! ${user.fullName}`}
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="User Actions" variant="flat">
                            <DropdownItem key="settings"><Link to="/profile/*">Thông tin tài khoản</Link></DropdownItem>
                            <DropdownItem key="help_and_feedback">Hỗ trợ và đánh giá</DropdownItem>
                            <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                                Đăng xuất
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                ) : (
                    <Button color="primary">
                        <Link to="/loginn" className="text-white">
                            Đăng nhập
                        </Link>
                    </Button>
                )}
            </NavbarContent>
        </Navbar>
    );
};

export default HeaderDownNavbar;