import React, { useEffect } from 'react';
import AOS from 'aos'; // Import AOS library
import 'aos/dist/aos.css'; // Import AOS styles

const Header = () => {
    useEffect(() => {
        AOS.init({ duration: 1000 }); // Khởi tạo AOS với thời gian hiệu ứng là 1000ms
    }, []);

    return (
        <header className="sticky-header border-b border-gray-200" data-aos="fade-down">
            <div className=" items-center justify-center">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-2 space-y-2 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-2">
                                <i className="fas fa-map-marker-alt text-orange-500"></i>
                                <span>306h/2 KDC Hang Bang, KV5, An Khanh, Ninh Kieu, Can Tho</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <i className="fas fa-envelope text-orange-500"></i>
                                <span>assecessnameit@gmail.com</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <span className="hover:text-orange-500 cursor-pointer transition duration-300">Theo dõi đơn hàng</span>
                            <span className="hover:text-orange-500 cursor-pointer transition duration-300">Chính sách</span>
                            <span className="hover:text-orange-500 cursor-pointer transition duration-300">Thanh toán</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
