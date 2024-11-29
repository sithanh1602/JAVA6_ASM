import React from "react";
import ProductsSlider from "../home/ProductsSlider";
import images from "../../assets/images/imageProducts/Mainboard.webp";
import 'aos/dist/aos.css';

const TopProducts = () => {
    return (
        <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:px-10 px-4 mt-8 space-y-6 lg:space-y-0 lg:space-x-6" data-aos="fade-down-left">
                {/* Left: Card Section */}
                <div className="lg:w-1/4 w-full">
                    <div className="relative bg-white border border-gray-300 rounded-lg shadow-lg p-5 text-center">
                        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                            NEW
                        </span>
                        <h2 className="text-base font-semibold text-gray-800 mt-8">
                            HIỆU SUẤT CAO VÀ TIỆN ÍCH
                        </h2>
                        <p className="text-orange-500 text-2xl font-bold mt-4">Ưu đãi 40%</p>
                        <a
                            href="#"
                            className="inline-block mt-5 px-6 py-2 border border-orange-500 text-orange-500 font-semibold rounded hover:bg-orange-500 hover:text-white transition duration-200"
                        >
                            KHÁM PHÁ →
                        </a>
                        <img
                            src={images}
                            alt="Product Image"
                            className="mt-6 w-full h-52 object-cover rounded-lg mx-auto"
                        />
                    </div>
                </div>

                {/* Right: Products Slider */}
                <div className="lg:w-3/4 w-full">
                    {/* Header Section */}
                    <div className="flex flex-wrap justify-between items-center border-b-2 border-gray-100 pb-3">
                        {/* Title */}
                        <div className="flex items-baseline space-x-2">
                            <span className="text-gray-600 text-lg sm:text-xl font-bold">Sản Phẩm</span>
                            <span className="text-orange-500 text-lg sm:text-xl font-bold">Bán Chạy</span>
                        </div>
                        {/* Tabs */}
                        <div className="flex flex-wrap space-x-4 sm:space-x-6 text-gray-600 text-sm sm:text-lg font-medium mt-3 lg:mt-0">
                            <span className="cursor-pointer pb-2 border-b-2 border-transparent hover:border-orange-500 transition duration-200">
                                Tai nghe
                            </span>
                            <span className="cursor-pointer pb-2 border-b-2 border-transparent hover:border-orange-500 transition duration-200">
                                Điện thoại
                            </span>
                            <span className="cursor-pointer pb-2 border-b-2 border-transparent hover:border-orange-500 transition duration-200">
                                Camera
                            </span>
                            <span className="cursor-pointer pb-2 border-b-2 border-transparent hover:border-orange-500 transition duration-200">
                                Thiết bị
                            </span>
                        </div>
                    </div>
                    {/* Products Slider */}
                    <div className="mt-6">
                        <ProductsSlider />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TopProducts;
