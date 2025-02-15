import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import logo from '../../assets/images/cpu2.png';
import { FiSearch } from "react-icons/fi";
import { Input, Spinner } from "@nextui-org/react";
import { FaTrash } from 'react-icons/fa';

const Navbar = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value).replace(/\s?₫/g, ' VND');
    };

    const fetchCart = async () => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            try {
                // Log request để debug
                console.log('Fetching cart for userId:', userId);

                const response = await axios.get(`http://localhost:8080/api/carts/user/${userId}`);
                // Log response để debug
                console.log('Cart API response:', response.data);

                setCartItems(response.data);
                const totalQuantity = response.data.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalQuantity);
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        }
    };

    useEffect(() => {
        const cookieToken = document.cookie.includes('token');
        const sessionToken = sessionStorage.getItem('token');
        const localToken = localStorage.getItem('token');
        const isLoggedInNow = cookieToken || sessionToken || localToken;
        setIsLoggedIn(isLoggedInNow);

        if (isLoggedInNow) {
            fetchCart();
        }
    }, [isLoggedIn]);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        setIsSearching(true);

        if (query.trim().length > 0) {
            setTimeout(async () => {
                try {
                    const response = await axios.get("http://localhost:8080/api/product-variants");
                    const filteredResults = response.data.filter(variant =>
                        variant.nameVariants.toLowerCase().includes(query.toLowerCase())
                    );
                    setSearchResults(filteredResults);
                } catch (error) {
                    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
                } finally {
                    setIsSearching(false);
                }
            }, 1000);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const handleQuantityChange = async (productVariantId, newQuantity) => {
        try {
            const userId = localStorage.getItem('userId');
            // Gọi API cập nhật số lượng
            await axios.put(`http://localhost:8080/api/carts/user/${userId}/product/${productVariantId}`, {
                quantity: newQuantity
            });

            // Refresh giỏ hàng
            fetchCart();

            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã cập nhật số lượng sản phẩm.',
                confirmButtonText: 'Đóng',
            });
        } catch (error) {
            console.error('Error updating quantity:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể cập nhật số lượng sản phẩm.',
                confirmButtonText: 'Đóng',
            });
        }
    };

    const handleDelete = async (productVariantId) => {
        try {
            const userId = localStorage.getItem('userId');
            await axios.delete(`http://localhost:8080/api/carts/remove`, {
                params: {
                    userId: userId,
                    productVariantId: productVariantId
                }
            });

            // Refresh giỏ hàng
            fetchCart();

            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã xóa sản phẩm khỏi giỏ hàng.',
                confirmButtonText: 'Đóng',
            });
        } catch (error) {
            console.error('Error removing item:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể xóa sản phẩm khỏi giỏ hàng.',
                confirmButtonText: 'Đóng',
            });
        }
    };

    return (
        <nav className="shadow sticky top-0 z-50 bg-white" data-aos="fade-down">
            <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-0">
                {/* Logo section */}
                <div className="flex items-center space-x-4 p-3">
                    <img src={logo} alt="Logo" className="h-10 w-10 animate-spin" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-semibold">TECHSMART.VN</span>
                        <span className="text-gray-500 text-sm">TECH ELECTRONICS</span>
                    </div>
                </div>

                {/* Search section */}
                <div className="relative hidden md:flex justify-center flex-1">
                    <div className="relative w-full max-w-lg">
                        <div className="flex items-center border-2 border-gray-300 rounded-md overflow-hidden">
                            <select className="px-3 py-2 text-sm bg-white text-gray-700 border-r border-gray-300 outline-none">
                                <option value="all">Tất cả</option>
                                <option value="products">Sản phẩm</option>
                                <option value="categories">Danh mục</option>
                            </select>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full px-4 py-2"
                            />
                            <button className="px-4 py-4">
                                {isSearching ? <Spinner size="sm" /> : <FiSearch className="text-lg"/>}
                            </button>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="absolute left-0 w-full bg-white border border-gray-300 shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto">
                                {searchResults.map((variant) => (
                                    <Link
                                        key={variant.idVariants}
                                        to={`/products/${variant.id}/productdetail`}
                                        className="px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
                                    >
                                        <img
                                            src={variant.image || `https://placehold.co/50x50`}
                                            className="w-10 h-10 object-cover rounded"
                                            alt={variant.nameVariants}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{variant.nameVariants}</span>
                                            <span className="text-xs text-gray-500">{variant.brandName}</span>
                                            <span className="text-xs text-gray-500">{variant.categoryName}</span>
                                        </div>
                                        <span className="text-blue-500 ml-auto">{formatCurrency(variant.price)}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart section */}
                <div className="flex items-center space-x-4 p-3">
                    <Link to="" className="text-gray-700 hover:text-orange-500">
                        <i className="far fa-heart text-2xl"></i>
                    </Link>
                    <div className="relative group">
                        <Link to="/cart" className="text-gray-700 hover:text-orange-500 relative">
                            <i className="fas fa-shopping-cart text-2xl"></i>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg border-3 hidden group-hover:block">
                            <div className="p-4">
                                <h3 className="font-medium mb-2">Giỏ hàng của bạn ({cartCount} sản phẩm)</h3>
                                <div className="max-h-96 overflow-y-auto">
                                    {isLoggedIn ? (
                                        cartItems.length > 0 ? (
                                            cartItems.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 py-2 border-b">
                                                    <img
                                                        src={item.variant.image || 'https://placehold.co/50x50'}
                                                        alt={item.variant.nameVariants}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{item.variant.nameVariants}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex items-center">
                                                                <button
                                                                    className="px-2 py-1 bg-gray-200 rounded-l"
                                                                    onClick={() => handleQuantityChange(item.variant.id, item.quantity - 1)}
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="px-3 py-1 bg-white border-t border-b">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    className="px-2 py-1 bg-gray-200 rounded-r"
                                                                    onClick={() => handleQuantityChange(item.variant.id, item.quantity + 1)}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <span className="text-sm font-medium text-blue-600">
                                                                {formatCurrency(item.variant.price * item.quantity)}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDelete(item.variant.id)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 py-2">Giỏ hàng trống</p>
                                        )
                                    ) : (
                                        <p className="text-center text-gray-500 py-2">
                                            Vui lòng đăng nhập để xem giỏ hàng
                                        </p>
                                    )}
                                </div>
                                {cartItems.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex justify-between font-medium">
                                            <span>Tổng cộng:</span>
                                            <span className="text-blue-600">{formatCurrency(
                                                cartItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0)
                                            )}</span>
                                        </div>
                                        <Link
                                            to="/cart"
                                            className="block text-center py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md mt-3"
                                        >
                                            Xem giỏ hàng
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;