import React from 'react';
import images from "../../assets/images/imageProducts/Mainboard.webp";
import AOS from 'aos';
import 'aos/dist/aos.css';

const PopularProducts = () => {
    return (
        <div className="m-10" data-aos="fade-zoom">
            <div className="flex items-baseline space-x-2 border-b-2 border-gray-100">
                <span className="text-gray-600 text-xl font-bold">Sản Phẩm</span>
                <span className="text-orange-500 text-xl font-bold">Phổ Biến</span>
            </div>
            <div className="flex  justify-center py-5 space-x-4 space-y-4 sm:space-y-0 sm:space-x-8">
                {/* 1 Product */}
                <div className="w-full sm:max-w-xs lg:max-w-sm bg-white shadow-lg rounded-lg overflow-hidden">
                    <img
                        src={images}
                        alt="Product"
                        className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tên sản phẩm</h3>
                        <p className="text-gray-800 mb-2">Mô tả sản phẩm</p>
                        <p className="text-orange-600 font-semibold mb-4">Giá đ</p>
                        <button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition duration-300">
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>

                {/* 2 Product */}
                <div className="w-full sm:max-w-xs lg:max-w-sm bg-white shadow-lg rounded-lg overflow-hidden">
                    <img
                        src={images}
                        alt="Product"
                        className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tên sản phẩm</h3>
                        <p className="text-gray-800 mb-2">Mô tả sản phẩm</p>
                        <p className="text-orange-600 font-semibold mb-4">Giá đ</p>
                        <button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition duration-300">
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>

                {/* 3 Product */}
                <div className="w-full sm:max-w-xs lg:max-w-sm bg-white shadow-lg rounded-lg overflow-hidden">
                    <img
                        src={images}
                        alt="Product"
                        className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tên sản phẩm</h3>
                        <p className="text-gray-800 mb-2">Mô tả sản phẩm</p>
                        <p className="text-orange-600 font-semibold mb-4">Giá đ</p>
                        <button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition duration-300">
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>

                {/* 4 Product */}
                <div className="w-full sm:max-w-xs lg:max-w-sm bg-white shadow-lg rounded-lg overflow-hidden">
                    <img
                        src={images}
                        alt="Product"
                        className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tên sản phẩm</h3>
                        <p className="text-gray-800 mb-2">Mô tả sản phẩm</p>
                        <p className="text-orange-600 font-semibold mb-4">Giá đ</p>
                        <button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition duration-300">
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PopularProducts;
