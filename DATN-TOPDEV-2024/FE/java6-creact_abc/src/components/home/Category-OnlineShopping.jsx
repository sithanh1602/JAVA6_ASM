import React, {useState} from "react";
import imagess from '../../assets/images/imageProducts/NVIDIARTX3080.webp'
import AOS from 'aos';
import 'aos/dist/aos.css';

const CategoryOnlineShopping = () => {
    return (
        <>
            <div className="items-center justify-center" data-aos="fade-up">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="container mx-auto mt-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-xl font-semibold">
                                Mua Sắm <span className="text-orange-500">Trực Tuyến</span>
                            </h2>
                            <div className="flex space-x-4 border-b pb-2">
                                <button className="text-gray-600 hover:text-orange-500 transition">
                                    Hàng đầu
                                </button>
                                <button className="text-gray-600 hover:text-orange-500 transition">
                                    Bán chạy
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row mt-6">
                            <div className="w-full lg:w-1/4 pr-0 lg:pr-8 mb-6 lg:mb-0">
                                <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                                        <i className="fas fa-bars px-2"></i> Danh Mục
                                    </h3>
                                    <ul className="space-y-3">
                                        <li className="group">
                                            <a
                                                href="#"
                                                className="flex items-center text-gray-700 group-hover:text-orange-500 transition font-medium"
                                            >
                  <span className="mr-2">
                    <i className="fas fa-music"></i>
                  </span>
                                                Bluetooth Speaker
                                            </a>
                                        </li>
                                        <li className="group">
                                            <a
                                                href="#"
                                                className="flex items-center text-gray-700 group-hover:text-orange-500 transition font-medium"
                                            >
                  <span className="mr-2">
                    <i className="fas fa-camera"></i>
                  </span>
                                                Digital Camera
                                            </a>
                                        </li>
                                        <li className="group">
                                            <a
                                                href="#"
                                                className="flex items-center text-gray-700 group-hover:text-orange-500 transition font-medium"
                                            >
                  <span className="mr-2">
                    <i className="fas fa-hdd"></i>
                  </span>
                                                External Hard Drive
                                            </a>
                                        </li>
                                        <li className="group">
                                            <a
                                                href="#"
                                                className="flex items-center text-gray-700 group-hover:text-orange-500 transition font-medium"
                                            >
                  <span className="mr-2">
                    <i className="fas fa-utensil-spoon"></i>
                  </span>
                                                Frying Pan
                                            </a>
                                        </li>
                                        <li className="group">
                                            <a
                                                href="#"
                                                className="flex items-center text-gray-700 group-hover:text-orange-500 transition font-medium"
                                            >
                  <span className="mr-2">
                    <i className="fas fa-print"></i>
                  </span>
                                                Laser Printer
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="w-full lg:w-3/4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
                                        >
                                            <div className="relative">
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    SALE!
                  </span>
                                                <img
                                                    src="https://via.placeholder.com/150"
                                                    alt="Product Image"
                                                    className="w-full h-40 object-cover rounded"
                                                />
                                            </div>
                                            <h3 className="mt-2 text-sm font-semibold">
                                                Skullcandy Dime Earbuds
                                            </h3>
                                            <div className="flex items-center mt-2 text-yellow-500">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 fill-current"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        d="M10 15l-5.878 3.09 1.122-6.545L0 6.545l6.561-.954L10 0l3.439 5.591L20 6.545l-5.244 5.09L15.878 18z"/>
                                                </svg>
                                                <span className="ml-1 text-gray-600">(1)</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-red-500 font-bold">390,000₫</span>
                                                <span className="text-gray-500 line-through ml-2">
                    500,000₫
                  </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>

    );
}


export default CategoryOnlineShopping;