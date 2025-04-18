import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../assets/images/cpu2.png";
import { FiSearch } from "react-icons/fi";
import { Input, Spinner } from "@nextui-org/react";
import { FaTrash } from "react-icons/fa";
import Cookies from "js-cookie";
import {
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
import { toast } from "react-toastify";
// Import services
import UserService from "../../services/UserService";
import CartService, {
    getAllCartItemsForUser,
    updateCartItemQuantity,
    removeCartItem,
    searchProductVariants,
    formatCurrency
} from "../../services/CartService";
import axios from "axios";

const Navbar = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        const storedUserId = JSON.parse(localStorage.getItem("UserId"));
        if (!storedUserId) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem giỏ hàng");
            return;
        }

        try {
            setLoading(true);
            const items = await getAllCartItemsForUser(storedUserId);
            if (items && items.length > 0) {
                setCartItems(items);
                setCartCount(items.length);
            } else {
                setCartItems([]);
                setCartCount(0);
            }
        } catch (err) {
            setCartItems([]);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
        const intervalId = setInterval(() => {
            fetchCart();
        }, 5000);

        const handleCartUpdate = () => {
            fetchCart();
        };
        window.addEventListener("cartUpdated", handleCartUpdate);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("cartUpdated", handleCartUpdate);
        };
    }, [fetchCart]);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "cartItems" || e.key === "cartUpdated") {
                fetchCart();
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [fetchCart]);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        setIsSearching(true);

        try {
            // Call the service function
            const results = await searchProductVariants(query);
            setSearchResults(results);
        } catch (error) {
            // Error handling is done in the service
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleQuantityChange = async (productVariantId, newQuantity, buildId = null) => {
        if (newQuantity < 1) return;

        try {
            const storedUserId = JSON.parse(localStorage.getItem("UserId"));
            await updateCartItemQuantity(storedUserId, productVariantId, newQuantity, buildId);

            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.product_variant_id === productVariantId &&
                    (!buildId || item.buildPC?.buildId === buildId)
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );

            window.dispatchEvent(new Event("cartUpdated"));
            localStorage.setItem("cartUpdated", Date.now().toString());
            fetchCart();
        } catch (error) {
            // Error is handled by the service
        }
    };

    const handleDelete = async (productVariantId, buildId = null) => {
        try {
            const storedUserId = JSON.parse(localStorage.getItem("UserId"));
            await removeCartItem(storedUserId, productVariantId, buildId);

            setCartItems((prevItems) =>
                prevItems.filter(
                    (item) =>
                        item.product_variant_id !== productVariantId ||
                        (buildId && item.buildPC?.buildId !== buildId)
                )
            );
            setCartCount((prev) => prev - 1);

            window.dispatchEvent(new Event("cartUpdated"));
            localStorage.setItem("cartUpdated", Date.now().toString());
            fetchCart();
        } catch (error) {
            // Error is handled by the service
        }
    };

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
        <nav className="shadow sticky top-0 z-50 bg-white" data-aos="fade-down">
            <div className="container mx-auto w-[80%] flex justify-between items-center py-4 px-4 md:px-0">
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
                                {isSearching ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <FiSearch className="text-lg" />
                                )}
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="absolute left-0 w-full bg-white border border-gray-300 shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto">
                                {searchResults.map((variant) => (
                                    <Link
                                        key={variant.idVariants}
                                        to={`/products/${variant.productId}/productdetail`}
                                        className="px-4 py-2 hover:bg-gray-100 flex items-center gap-3">
                                        <img
                                            src={variant.image || `https://placehold.co/50x50`}
                                            className="w-10 h-10 object-cover rounded"
                                            alt={variant.nameVariants}
                                        />
                                        <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {variant.nameVariants}
                      </span>
                                            <span className="text-xs text-gray-500">
                        {variant.brandName}
                      </span>
                                            <span className="text-xs text-gray-500">
                        {variant.categoryName}
                      </span>
                                        </div>
                                        <span className="text-blue-500 ml-auto">
                      {formatCurrency(variant.price)}
                    </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart section */}
                <div className="flex items-center space-x-4 p-3">
                    <Link to="/wishlist" className="text-gray-700 hover:text-orange-500">
                        <i className="far fa-heart text-2xl"></i>
                    </Link>
                    <div className="relative group">
                        <Link
                            to="/cart"
                            className="text-gray-700 hover:text-orange-500 relative">
                            <i className="fas fa-shopping-cart text-2xl"></i>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
                            )}
                        </Link>

                        {/* Cart Dropdown */}
                        <div className="absolute right-0 mt-0 pt-2 w-[32rem] hidden group-hover:block z-50">
                            <div className="bg-white shadow-lg border rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium mb-4">
                                        Giỏ hàng của bạn ({cartCount} sản phẩm)
                                    </h3>
                                    {loading ? (
                                        <div className="flex justify-center py-6">
                                            <Spinner size="md" />
                                        </div>
                                    ) : error ? (
                                        <p className="text-center text-red-500 py-4">{error}</p>
                                    ) : (
                                        <div className="max-h-[32rem] overflow-y-auto">
                                            {cartItems.length > 0 ? (
                                                cartItems.map((item, index) =>
                                                        item.buildPC ? (
                                                            <div
                                                                key={`build-${item.buildPC.buildId}-${index}`}
                                                                className="flex items-center gap-4 py-4 border-b">
                                                                <img
                                                                    src={
                                                                        item.buildPC.image ||
                                                                        "https://placehold.co/50x50"
                                                                    }
                                                                    className="w-16 h-16 object-cover rounded"
                                                                    alt={item.buildPC.buildName}
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="text-base font-medium">
                                                                        {item.buildPC.buildName}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        Mục đích: {item.buildPC.usagePurpose}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        Số linh kiện: {item.buildPC.totalProducts}
                                                                    </p>
                                                                    <div className="flex items-center justify-between mt-3">
                                                                        <div className="flex items-center">
                                                                            <button
                                                                                className="px-3 py-1.5 bg-gray-200 rounded-l hover:bg-gray-300"
                                                                                onClick={() =>
                                                                                    handleQuantityChange(
                                                                                        null,
                                                                                        item.quantity - 1,
                                                                                        item.buildPC.buildId
                                                                                    )
                                                                                }>
                                                                                -
                                                                            </button>
                                                                            <span className="px-4 py-1.5 bg-white border-t border-b">
                                      {item.quantity}
                                    </span>
                                                                            <button
                                                                                className="px-3 py-1.5 bg-gray-200 rounded-r hover:bg-gray-300"
                                                                                onClick={() =>
                                                                                    handleQuantityChange(
                                                                                        null,
                                                                                        item.quantity + 1,
                                                                                        item.buildPC.buildId
                                                                                    )
                                                                                }>
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                        <span className="text-base font-medium text-blue-600">
                                    {formatCurrency(
                                        item.buildPC.totalPrice * item.quantity
                                    )}
                                  </span>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDelete(null, item.buildPC.buildId)
                                                                            }
                                                                            className="text-red-500 hover:text-red-700 p-2">
                                                                            <FaTrash size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                key={item.product_variant_id}
                                                                className="flex items-center gap-4 py-4 border-b">
                                                                <img
                                                                    src={
                                                                        item.productImageUrl ||
                                                                        "https://placehold.co/50x50"
                                                                    }
                                                                    className="w-16 h-16 object-cover rounded"
                                                                    alt={item.productName}
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="text-base font-medium">
                                                                        {item.productName}
                                                                    </p>
                                                                    <div className="flex items-center justify-between mt-3">
                                                                        <div className="flex items-center">
                                                                            <button
                                                                                className="px-3 py-1.5 bg-gray-200 rounded-l hover:bg-gray-300"
                                                                                onClick={() =>
                                                                                    handleQuantityChange(
                                                                                        item.product_variant_id,
                                                                                        item.quantity - 1
                                                                                    )
                                                                                }>
                                                                                -
                                                                            </button>
                                                                            <span className="px-4 py-1.5 bg-white border-t border-b">
                                      {item.quantity}
                                    </span>
                                                                            <button
                                                                                className="px-3 py-1.5 bg-gray-200 rounded-r hover:bg-gray-300"
                                                                                onClick={() =>
                                                                                    handleQuantityChange(
                                                                                        item.product_variant_id,
                                                                                        item.quantity + 1
                                                                                    )
                                                                                }>
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                        <span className="text-base font-medium text-blue-600">
                                    {formatCurrency(
                                        item.productPrice * item.quantity
                                    )}
                                  </span>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDelete(item.product_variant_id)
                                                                            }
                                                                            className="text-red-500 hover:text-red-700 p-2">
                                                                            <FaTrash size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                )
                                            ) : (
                                                <p className="text-center text-gray-500 py-4">
                                                    Giỏ hàng trống
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {cartItems.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="flex justify-between font-medium text-lg">
                                                <span>Tổng cộng:</span>
                                                <span className="text-blue-600">
                          {formatCurrency(
                              cartItems.reduce(
                                  (sum, item) =>
                                      item.buildPC
                                          ? sum +
                                          item.buildPC.totalPrice * item.quantity
                                          : sum + item.productPrice * item.quantity,
                                  0
                              )
                          )}
                        </span>
                                            </div>
                                            <Link
                                                to="/cart"
                                                className="block text-center py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-md mt-4 text-base">
                                                Xem giỏ hàng
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
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
                                            src: user.image,
                                        }}
                                        className="transition-transform"
                                        description={user.phone}
                                        name={`Chào! ${user.fullName}`}
                                    />
                                </DropdownTrigger>
                                <DropdownMenu aria-label="User Actions" variant="flat">
                                    <DropdownItem key="settings">
                                        <Link to="/profile/*">Thông tin tài khoản</Link>
                                    </DropdownItem>
                                    <DropdownItem key="help_and_feedback">
                                        Hỗ trợ và đánh giá
                                    </DropdownItem>
                                    <DropdownItem
                                        key="logout"
                                        color="danger"
                                        onClick={handleLogout}>
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
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;