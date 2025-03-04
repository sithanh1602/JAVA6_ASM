import React, { useEffect } from "react";
import AOS from "aos"; // Import AOS library
import "aos/dist/aos.css"; // Import AOS styles
import { Link } from "react-router-dom";
import { FaTruck, FaBook, FaCoins, FaDesktop } from "react-icons/fa"; // Import FaDesktop for Build PC

const Header = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Khởi tạo AOS với thời gian hiệu ứng là 1000ms
  }, []);

  return (
    <header
      className="sticky-header border-b border-gray-200 bg-white shadow-md"
      data-aos="fade-down"
    >
      <div className="items-center justify-center">
        <div className="w-full max-w-7xl mx-auto">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-4 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-map-marker-alt text-red-500"></i>
                <span className="text-gray-700 hover:text-red-500 cursor-pointer transition duration-300">
                  306h/2 KDC Hang Bang, KV5, An Khanh, Ninh Kieu, Can Tho
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-envelope text-blue-500"></i>
                <span className="text-gray-700 hover:text-blue-500 cursor-pointer transition duration-300">
                  info@fivestar.team
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link to="/OrderUser" className="flex items-center">
                <FaTruck size={20} color="green" />
                <span className="text-gray-700 hover:text-green-500 cursor-pointer transition duration-300 pl-2">
                  Theo dõi đơn hàng
                </span>
              </Link>
              <Link to="/policies" className="flex items-center">
                <FaBook size={18} className="text-gray-700 hover:text-blue-600 transition duration-300" />
                <span className="text-gray-700 hover:text-blue-600 cursor-pointer transition duration-300 pl-2">
                  Chính sách
                </span>
              </Link>
              <Link to="/payment" className="flex items-center">
                <FaCoins size={18} className="text-gray-700 hover:text-blue-600 transition duration-300" />
                <span className="text-gray-700 hover:text-blue-600 cursor-pointer transition duration-300 pl-2">
                  Thanh toán
                </span>
              </Link>
              <Link to="/BuilderPC" className="flex items-center p-2 hover:bg-gray-100 transition duration-300 rounded-md">
                <FaDesktop size={18} className="text-blue-600 hover:text-blue-800 transition duration-300" />
                <span className="text-blue-600 font-semibold hover:text-blue-800 cursor-pointer transition duration-300 pl-2">
                  Build PC
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;