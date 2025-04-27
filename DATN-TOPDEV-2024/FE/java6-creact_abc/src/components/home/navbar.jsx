import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/images/cpu2.png";
import { FiSearch } from "react-icons/fi";
import { Input, Spinner } from "@nextui-org/react";
import { toast } from "react-toastify";
import {
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Button,
  User,
} from "@nextui-org/react";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';
import UserService from "../../services/UserService";

const Navbar = () => {
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (query.trim().length > 0) {
      try {
        const response = await axios.get(
            "http://localhost:8080/api/product-variants"
        );
        const filteredResults = response.data.filter((variant) =>
            variant.nameVariants?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        toast.error("Không thể tìm kiếm sản phẩm");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get("jwtToken");
    if (token) {
      try {
        // Decode the token to get user information
        const decodedToken = jwtDecode(token);
        const { userId, phone, fullName, roles } = decodedToken;

        // Set user state with decoded information
        setUser({
          userId,
          phone,
          fullName,
          roles,
          // Add image or other fields if available in token or fetched from API
          image: null, // Placeholder; fetch from UserService if needed
        });
        setIsLoggedIn(true);

        // Optionally fetch additional user data from UserService
        UserService.getUserById(userId)
            .then((data) => {
              if (data) {
                setUser((prev) => ({
                  ...prev,
                  ...data, // Merge with API data (e.g., image, other fields)
                }));
              }
              setLoading(false);
            })
            .catch((err) => {
              console.error("Error loading additional user data:", err);
              setLoading(false);
            });
      } catch (err) {
        console.error("Error decoding token:", err);
        setIsLoggedIn(false);
        setUser(null);
        setLoading(false);
        Cookies.remove("jwtToken"); // Remove invalid token
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/logout');
      console.log('Logout response:', response.data);

      // Xóa cookie jwtToken trên frontend
      Cookies.remove('jwtToken');
      Cookies.remove('refreshToken');

      // Chuyển hướng về trang đăng nhập
      navigate('/loginn');
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err.message);
    }
  };

  return (
      <nav
          className="shadow top-0 z-50 bg-white hidden md:block" // Hide on mobile, show on md and up
          data-aos="fade-down"
      >
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
                            className="px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
                        >
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
            </div>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;