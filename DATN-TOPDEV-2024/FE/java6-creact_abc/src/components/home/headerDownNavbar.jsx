import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import CategoryService from "../../services/CategoryService";
import BrandService from "../../services/BrandService";
import { getAllCartItemsForUser } from "../../services/CartService";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiChevronDown,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiAlertCircle,
} from "react-icons/fi";
import { FaBagShopping } from "react-icons/fa6";
import { BiSolidHeartCircle } from "react-icons/bi";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const HeaderDownNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [loadingBrands, setLoadingBrands] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const mobileMenuRef = useRef(null);

  const getUserIdFromToken = () => {
    const token = Cookies.get("jwtToken");
    let decodedUserId = null;

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        decodedUserId = decodedToken.userId;
        if (!decodedUserId) {
          console.error("getUserIdFromToken: No userId in token");
        }
      } catch (error) {
        console.error("getUserIdFromToken: Error decoding token", error);
      }
    } else {
      console.log("getUserIdFromToken: No jwtToken found in cookies");
    }

    return decodedUserId;
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
    setIsMobileMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setExpandedCategory(null);
    window.location.reload();
  };

  const handleBrandClick = (brandId) => {
    navigate(`/products?brand=${brandId}`);
    setIsMobileMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setExpandedCategory(null);
    window.location.reload();
  };

  const toggleCategory = async (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      if (!brands[categoryId] && !loadingBrands[categoryId]) {
        setLoadingBrands((prev) => ({ ...prev, [categoryId]: true }));
        try {
          const data = await BrandService.getBrandsByCategory(categoryId);
          console.log(`Brands loaded for category ${categoryId}:`, data);
          setBrands((prev) => ({ ...prev, [categoryId]: data }));
        } catch (error) {
          console.error(
              `Error loading brands for category ${categoryId}:`,
              error
          );
        } finally {
          setLoadingBrands((prev) => ({ ...prev, [categoryId]: false }));
        }
      }
    }
  };

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsOpen(false);
      setIsMobileMenuOpen(false);
      setIsCategoryMenuOpen(false);
      setExpandedCategory(null);
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

  const fetchCart = useCallback(async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem giỏ hàng");
      setIsLoggedIn(false);
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get("jwtToken");
      const items = await getAllCartItemsForUser(userId, token);
      if (items && items.length > 0) {
        setCartItems(items);
        setCartCount(items.length);
        setIsLoggedIn(true);
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    } catch (err) {
      console.error("fetchCart: Error fetching cart items", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setCartItems([]);
      setCartCount(0);
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        Cookies.remove("jwtToken");
        Swal.fire({
          icon: "warning",
          title: "Phiên đăng nhập hết hạn",
          text: "Vui lòng đăng nhập lại để xem giỏ hàng.",
          confirmButtonText: "Đăng nhập",
        }).then(() => {
          navigate("/loginn");
        });
      } else {
        setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
      }
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

  const handleCategoryHover = async (categoryId) => {
    setHoveredCategory(categoryId);

    if (!brands[categoryId] && !loadingBrands[categoryId]) {
      setLoadingBrands((prev) => ({ ...prev, [categoryId]: true }));
      try {
        const data = await BrandService.getBrandsByCategory(categoryId);
        console.log(`Brands loaded for category ${categoryId}:`, data);
        setBrands((prev) => ({ ...prev, [categoryId]: data }));
      } catch (error) {
        console.error(
            `Error loading brands for category ${categoryId}:`,
            error
        );
      } finally {
        setLoadingBrands((prev) => ({ ...prev, [categoryId]: false }));
      }
    }
  };

  const handleQuantityChange = async (
      productVariantId,
      newQuantity,
      buildId = null
  ) => {
    if (newQuantity < 1) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Thông báo",
        text: "Vui lòng đăng nhập để cập nhật giỏ hàng.",
        confirmButtonText: "Đăng nhập",
      }).then(() => {
        Cookies.remove("jwtToken");
        navigate("/loginn");
      });
      return;
    }

    try {
      const token = Cookies.get("jwtToken");
      await axios.put(
          `http://localhost:8080/api/carts/user/${userId}/product/${productVariantId}`,
          {
            quantity: newQuantity,
            buildId: buildId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
      );

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
      toast.success("Đã cập nhật số lượng sản phẩm.");
      fetchCart();
    } catch (error) {
      console.error("handleQuantityChange: Error updating cart quantity", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response?.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "Phiên đăng nhập hết hạn",
          text: "Vui lòng đăng nhập lại để cập nhật giỏ hàng.",
          confirmButtonText: "Đăng nhập",
        }).then(() => {
          Cookies.remove("jwtToken");
          navigate("/loginn");
        });
      } else {
        toast.error("Không thể cập nhật số lượng sản phẩm.");
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
        .format(value)
        .replace(/\s?₫/g, " VND");
  };

  const handleDelete = async (productVariantId, buildId = null) => {
    const userId = getUserIdFromToken();
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Thông báo",
        text: "Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng.",
        confirmButtonText: "Đăng nhập",
      }).then(() => {
        Cookies.remove("jwtToken");
        navigate("/loginn");
      });
      return;
    }

    try {
      const token = Cookies.get("jwtToken");
      await axios.delete(`http://localhost:8080/api/carts/remove`, {
        params: {
          userId: userId,
          productVariantId: productVariantId,
          buildId: buildId,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

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
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
      fetchCart();
    } catch (error) {
      console.error("handleDelete: Error removing cart item", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response?.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "Phiên đăng nhập hết hạn",
          text: "Vui lòng đăng nhập lại để xóa sản phẩm.",
          confirmButtonText: "Đăng nhập",
        }).then(() => {
          Cookies.remove("jwtToken");
          navigate("/loginn");
        });
      } else {
        toast.error("Không thể xóa sản phẩm khỏi giỏ hàng.");
      }
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
          mobileMenuRef.current &&
          !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
        setIsCategoryMenuOpen(false);
        setExpandedCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Navbar className="bg-white shadow-sm border-b border-gray-200 sticky z-40">
      <div className="flex items-center justify-between w-full">
        {/* Left Section: Hamburger Menu and Category Menu */}
        <div className="flex items-center gap-2">
          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="p-2 text-gray-600 hover:text-blue-600">
              <FiMenu className="text-2xl" />
            </button>
          </div>

          {/* Category Menu Section (Visible on All Screens) */}
          <div className="relative w-40 lg:w-64 hidden md:block">
  <button
    className="w-full text-white flex items-center justify-between px-3 py-1.5 md:px-4 md:py-2 rounded-md bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 transition-all duration-300 shadow-md text-sm md:text-base"
    onClick={() => setIsOpen(!isOpen)}>
    <div className="flex items-center">
      <FiMenu className="mr-1.5 text-base md:mr-2 md:text-lg" />
      <span className="font-medium">Danh mục</span>
    </div>
    <FiChevronDown
      className={`transition-transform duration-300 ${
        isOpen ? "rotate-180" : ""
      }`}
    />
  </button>

  {/* Category Dropdown */}
  <motion.div
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{ opacity: isOpen ? 1 : 0, scaleY: isOpen ? 1 : 0 }}
    exit={{ opacity: 0, scaleY: 0 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="absolute left-0 w-full bg-white rounded-md border border-gray-200 shadow-lg z-40 origin-top mt-1">
    <ul className="divide-y divide-gray-100">
      {categories.map((category) => (
        <li
          key={category.id}
          className="relative group"
          onMouseEnter={() => handleCategoryHover(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}>
          <div
            className="flex items-center justify-between p-1.5 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
            onClick={() => handleCategoryClick(category.id)}>
            <span className="flex-grow font-normal text-gray-700">
              {category.name}
            </span>
            <FiChevronRight className="text-gray-400 group-hover:text-blue-600" />
          </div>

          {hoveredCategory === category.id && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-full top-0 w-64 bg-white rounded-md border border-gray-200 shadow-lg z-50"
              style={{ minHeight: "100%" }}>
              <div className="p-2 bg-blue-50 border-b border-gray-200">
                <span className="text-blue-800 font-semibold text-sm uppercase tracking-wide">
                  Thương hiệu
                </span>
              </div>
              <ul className="py-1 max-h-80 overflow-y-auto">
                {loadingBrands[category.id] ? (
                  <li className="px-3 py-2 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-gray-500">Đang tải...</span>
                  </li>
                ) : Array.isArray(brands[category.id]) &&
                  brands[category.id].length > 0 ? (
                  brands[category.id].map((brand) => (
                    <li
                      key={brand.id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() =>
                        handleBrandClick(brand.brandsId)
                      }>
                      <div className="block px-3 py-1.5 text-gray-700 hover:text-blue-700">
                        {brand.name}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500 italic text-center">
                    Không có thương hiệu
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </li>
      ))}
    </ul>
  </motion.div>
</div>
        </div>

          {/* Main Navigation (Hidden on Mobile) */}
          <NavbarContent className="hidden lg:flex justify-center w-full gap-8 pl-8">
            <NavbarItem>
              <Link
                  to="/"
                  className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center">
                Trang chủ
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                  to="/aboutUs"
                  className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Giới thiệu
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                  to="/products"
                  className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Sản phẩm
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                  to="/PC"
                  className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                PC
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                  to="/posts"
                  className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Tin tức
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                  to="/contact"
                  className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Liên hệ
              </Link>
            </NavbarItem>
          </NavbarContent>

          {/* User Actions Section (Wishlist and Cart Always Visible) */}
          <div className="flex items-center gap-4 pr-4">
            <Link
                to="/wishlist"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 relative p-2">
              <BiSolidHeartCircle className="text-3xl" />
            </Link>
            <div className="relative group">
              <Link
                  to="/cart"
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors duration-200 relative p-2">
                <FaBagShopping className="text-3xl" />
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 translate-x-2 -translate-y-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold shadow-md">
                  {cartCount}
                </span>
                )}
              </Link>

              {/* Cart Dropdown */}
              <div className="absolute right-0 mt-2 w-96 hidden group-hover:block z-50">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FiShoppingBag className="mr-2 text-blue-600" />
                      Giỏ hàng của bạn{" "}
                      <span className="ml-2 text-blue-600">({cartCount})</span>
                    </h3>
                  </div>

                  {loading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-gray-500">Đang tải...</span>
                      </div>
                  ) : error ? (
                      <div className="p-6 text-center">
                        <FiAlertCircle className="mx-auto mb-2 text-2xl text-red-500" />
                        <p className="text-red-500">{error}</p>
                      </div>
                  ) : (
                      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {cartItems.length > 0 ? (
                            cartItems.map((item, index) =>
                                item.buildPC ? (
                                    <div
                                        key={`build-${item.buildPC.buildId}-${index}`}
                                        className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                      <img
                                          src={
                                              item.buildPC.image ||
                                              "https://placehold.co/50x50"
                                          }
                                          className="w-16 h-16 object-cover rounded-md shadow-sm border border-gray-200"
                                          alt={item.buildPC.buildName}
                                      />
                                      <div className="flex-1">
                                        <p className="text-base font-medium text-gray-800">
                                          {item.buildPC.buildName}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                          Mục đích: {item.buildPC.usagePurpose}
                                        </p>
                                        <div className="flex items-center justify-between mt-3">
                                          <div className="flex items-center bg-gray-100 rounded-md">
                                            <button
                                                className="px-3 py-1 text-gray-700 hover:text-blue-700 rounded-l-md"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        null,
                                                        item.quantity - 1,
                                                        item.buildPC.buildId
                                                    )
                                                }>
                                              <FiMinus size={14} />
                                            </button>
                                            <span className="px-3 py-1 font-medium text-gray-800">
                                    {item.quantity}
                                  </span>
                                            <button
                                                className="px-3 py-1 text-gray-700 hover:text-blue-700 rounded-r-md"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        null,
                                                        item.quantity + 1,
                                                        item.buildPC.buildId
                                                    )
                                                }>
                                              <FiPlus size={14} />
                                            </button>
                                          </div>
                                          <span className="text-base font-medium text-blue-700">
                                  {formatCurrency(
                                      item.buildPC.totalPrice * item.quantity
                                  )}
                                </span>
                                          <button
                                              onClick={() =>
                                                  handleDelete(null, item.buildPC.buildId)
                                              }
                                              className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150">
                                            <FiTrash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                ) : (
                                    <div
                                        key={item.product_variant_id}
                                        className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                      <img
                                          src={
                                              item.productImageUrl ||
                                              "https://placehold.co/50x50"
                                          }
                                          className="w-16 h-16 object-cover rounded-md shadow-sm border border-gray-200"
                                          alt={item.productName}
                                      />
                                      <div className="flex-1">
                                        <p className="text-base font-medium text-gray-800">
                                          {item.productName}
                                        </p>
                                        <div className="flex items-center justify-between mt-3">
                                          <div className="flex items-center bg-gray-100 rounded-md">
                                            <button
                                                className="px-3 py-1 text-gray-700 hover:text-blue-700 rounded-l-md"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.product_variant_id,
                                                        item.quantity - 1
                                                    )
                                                }>
                                              <FiMinus size={14} />
                                            </button>
                                            <span className="px-3 py-1 font-medium text-gray-800">
                                    {item.quantity}
                                  </span>
                                            <button
                                                className="px-3 py-1 text-gray-700 hover:text-blue-700 rounded-r-md"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.product_variant_id,
                                                        item.quantity + 1
                                                    )
                                                }>
                                              <FiPlus size={14} />
                                            </button>
                                          </div>
                                          <span className="text-base font-medium text-blue-700">
                                  {formatCurrency(
                                      item.productPrice * item.quantity
                                  )}
                                </span>
                                          <button
                                              onClick={() =>
                                                  handleDelete(item.product_variant_id)
                                              }
                                              className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150">
                                            <FiTrash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="py-8 text-center">
                              <FaBagShopping className="mx-auto mb-3 text-3xl text-gray-300" />
                              <p className="text-gray-500">Giỏ hàng trống</p>
                            </div>
                        )}
                      </div>
                  )}

                  {cartItems.length > 0 && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between font-medium text-lg mb-4">
                          <span className="text-gray-700">Tổng cộng:</span>
                          <span className="text-blue-700 font-semibold">
                        {formatCurrency(
                            cartItems.reduce(
                                (sum, item) =>
                                    item.buildPC
                                        ? sum + item.buildPC.totalPrice * item.quantity
                                        : sum + item.productPrice * item.quantity,
                                0
                            )
                        )}
                      </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                              to="/cart"
                              className="block text-center py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200">
                            Xem giỏ hàng
                          </Link>
                          <Link
                              to="/checkout"
                              className="block text-center py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium transition-colors duration-200">
                            Thanh toán
                          </Link>
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Visible on Mobile) */}
        {isMobileMenuOpen && (
            <motion.div
                ref={mobileMenuRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">
              <div className="p-4">
                {/* Main Navigation */}
                <div className="space-y-2">
                  <Link
                      to="/"
                      className="block p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCategoryMenuOpen(false);
                        setExpandedCategory(null);
                      }}>
                    Trang chủ
                  </Link>
                  <Link
                      to="/aboutUs"
                      className="block p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCategoryMenuOpen(false);
                        setExpandedCategory(null);
                      }}>
                    Giới thiệu
                  </Link>
                  <Link
                      to="/products"
                      className="block p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCategoryMenuOpen(false);
                        setExpandedCategory(null);
                      }}>
                    Sản phẩm
                  </Link>
                  <Link
                      to="/PC"
                      className="block p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCategoryMenuOpen(false);
                        setExpandedCategory(null);
                      }}>
                    PC
                  </Link>
                  <Link
                      to="/posts"
                      className="block p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCategoryMenuOpen(false);
                        setExpandedCategory(null);
                      }}>
                    Tin tức
                  </Link>
                  <Link
                      to="/contact"
                      className="block p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCategoryMenuOpen(false);
                        setExpandedCategory(null);
                      }}>
                    Liên hệ
                  </Link>
                  <div
                      className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                      onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}>
                    <span className="text-gray-700">Danh mục sản phẩm</span>
                    <FiChevronDown
                        className={`transition-transform duration-300 ${
                            isCategoryMenuOpen ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                </div>

                {/* Categories (Shown when Danh mục sản phẩm is clicked) */}
                {isCategoryMenuOpen && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Danh mục sản phẩm
                      </h3>
                      <ul className="space-y-2">
                        {categories.map((category) => (
                            <li key={category.id}>
                              <div
                                  className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => toggleCategory(category.id)}>
                        <span className="font-medium text-gray-700">
                          {category.name}
                        </span>
                                <FiChevronDown
                                    className={`transition-transform duration-300 ${
                                        expandedCategory === category.id ? "rotate-180" : ""
                                    }`}
                                />
                              </div>
                              {expandedCategory === category.id && (
                                  <ul className="pl-4 mt-1 space-y-1">
                                    {loadingBrands[category.id] ? (
                                        <li className="flex items-center px-4 py-2 text-gray-500">
                                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                          Đang tải...
                                        </li>
                                    ) : Array.isArray(brands[category.id]) &&
                                    brands[category.id].length > 0 ? (
                                        brands[category.id].map((brand) => (
                                            <li
                                                key={brand.id}
                                                className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer px-4 py-2"
                                                onClick={() =>
                                                    handleBrandClick(brand.brandsId)
                                                }>
                                              {brand.name}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-500 italic px-4 py-2">
                                          Không có thương hiệu
                                        </li>
                                    )}
                                  </ul>
                              )}
                            </li>
                        ))}
                      </ul>
                    </div>
                )}
              </div>
            </motion.div>
        )}
      </Navbar>
  );
};

export default HeaderDownNavbar;