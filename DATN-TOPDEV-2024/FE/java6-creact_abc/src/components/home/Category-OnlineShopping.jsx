import React from "react";
import 'aos/dist/aos.css';
import image1 from '../../assets/images/imageProducts/fan1.webp'
import image2 from '../../assets/images/imageProducts/card2.webp'
import image3 from '../../assets/images/imageProducts/image3.webp'
import image4 from '../../assets/images/imageProducts/image4.jpg'
import image5 from '../../assets/images/imageProducts/image5.webp'
import image6 from '../../assets/images/imageProducts/image6.webp'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCartPlus, faExclamationCircle, faHeart} from "@fortawesome/free-solid-svg-icons";


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
                            <div className="flex space-x-4 pb-2">
                                <button className="text-gray-600 hover:text-orange-500 hover:border-b transition">
                                    Hàng đầu
                                </button>
                                <button className="text-gray-600 hover:text-orange-500 hover:border-b transition">
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
                    <i className="fa fa-microchip"></i>
                  </span>
                                                CPU
                                            </a>
                                        </li>
                                        <li className="group">
                                            <a
                                                href="#"
                                                className="flex items-center text-gray-700 group-hover:text-orange-500 transition font-medium"
                                            >
                  <span className="mr-2">
                    <i className="fas fa-memory"></i>
                  </span>
                                                RAM
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
                                                Ổ cứng
                                            </a>
                                        </li>
                                        <li className="group">
                                            <a
                                                href="#"
                                                className="flex items-center text-gray-700 group-hover:text-orange-500 transition font-medium"
                                            >
                  <span className="mr-2">
                    <i className="fas fa-keyboard"></i>
                  </span>
                                                Bàn phím và chuột
                                            </a>
                                        </li>
                                        <li className="group">
                                            <a
                                                href="#"
                                                className="flex items-center text-gray-700 group-hover:text-orange-500 transition font-medium"
                                            >
                  <span className="mr-2">
                    <i className="fas fa-sd-card"></i>
                  </span>
                                                Card đồ họa
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="w-full lg:w-3/4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                    {/*item1*/}
                                    <div className=" rounded-lg overflow-hidden relative">
                                        <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                                            <div className="relative">
                                            <span
                                                className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">SALE!</span>
                                                <img src={image1} alt="Product Image"
                                                     className="w-full h-45 object-cover rounded"/>
                                            </div>
                                            <h3 className="mt-2 text-sm font-semibold">
                                                Card màn hình VGA ASRock Radeon RX 6600 8GB GDDR6 Challenger D
                                            </h3>
                                            <div className="flex items-center mt-2 text-yellow-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"
                                                     viewBox="0 0 20 20">
                                                    <path
                                                        d="M10 15l-5.878 3.09 1.122-6.545L0 6.545l6.561-.954L10 0l3.439 5.591L20 6.545l-5.244 5.09L15.878 18z"/>
                                                </svg>
                                                <span className="ml-1 text-gray-600">(1)</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-red-500 font-bold">390,000₫</span>
                                                <span className="text-gray-500 line-through ml-2">500,000₫</span>
                                            </div>
                                        </div>
                                        <div
                                            className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-0 hover:opacity-60 transition-opacity duration-300 flex justify-center items-center space-x-4">
                                            <FontAwesomeIcon
                                                icon={faCartPlus}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-red-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faExclamationCircle}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-yellow-900"

                                            />
                                        </div>
                                    </div>
                                    {/* item2   */}
                                    <div className=" rounded-lg overflow-hidden relative">
                                        <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                                            <div className="relative">
                                            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">SALE!</span>
                                                <img src={image2} alt="Product Image"
                                                     className="w-full h-45 object-cover rounded"/>
                                            </div>
                                            <h3 className="mt-2 text-sm font-semibold">
                                                Fan Case Redmoon F3 - Đen | Kit 5 Fan Led RGB, kèm sẵn HUB và Remote
                                            </h3>
                                            <div className="flex items-center mt-2 text-yellow-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"
                                                     viewBox="0 0 20 20">
                                                    <path
                                                        d="M10 15l-5.878 3.09 1.122-6.545L0 6.545l6.561-.954L10 0l3.439 5.591L20 6.545l-5.244 5.09L15.878 18z"/>
                                                </svg>
                                                <span className="ml-1 text-gray-600">(1)</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-red-500 font-bold">390,000₫</span>
                                                <span className="text-gray-500 line-through ml-2">500,000₫</span>
                                            </div>
                                        </div>
                                        <div
                                            className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-0 hover:opacity-60 transition-opacity duration-300 flex justify-center items-center space-x-4">
                                            <FontAwesomeIcon
                                                icon={faCartPlus}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-red-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faExclamationCircle}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-yellow-900"

                                            />
                                        </div>
                                    </div>
                                    {/* item3   */}
                                    <div className=" rounded-lg overflow-hidden relative">
                                        <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                                            <div className="relative">
                                            <span
                                                className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">SALE!</span>
                                                <img src={image3} alt="Product Image"
                                                     className="w-full h-45 object-cover rounded"/>
                                            </div>
                                            <h3 className="mt-2 text-sm font-semibold">
                                                CPU AMD Ryzen 5 4600G | AM4, Upto 4.20 GHz, 6C/12T, 8MB
                                            </h3>
                                            <div className="flex items-center mt-2 text-yellow-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"
                                                     viewBox="0 0 20 20">
                                                    <path
                                                        d="M10 15l-5.878 3.09 1.122-6.545L0 6.545l6.561-.954L10 0l3.439 5.591L20 6.545l-5.244 5.09L15.878 18z"/>
                                                </svg>
                                                <span className="ml-1 text-gray-600">(1)</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-red-500 font-bold">390,000₫</span>
                                                <span className="text-gray-500 line-through ml-2">500,000₫</span>
                                            </div>
                                        </div>
                                        <div
                                            className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-0 hover:opacity-60 transition-opacity duration-300 flex justify-center items-center space-x-4">
                                            <FontAwesomeIcon
                                                icon={faCartPlus}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-red-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faExclamationCircle}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-yellow-900"

                                            />
                                        </div>
                                    </div>
                                    {/* item4 */}
                                    <div className=" rounded-lg overflow-hidden relative">
                                        <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                                            <div className="relative">
                                            <span
                                                className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">SALE!</span>
                                                <img src={image4} alt="Product Image"
                                                     className="w-full h-45 object-cover rounded"/>
                                            </div>
                                            <h3 className="mt-2 text-sm font-semibold">
                                                CPU Intel Core I3 13100F | LGA1700, Turbo 4.50 GHz, 4C/8T, 12MB, Không
                                                Tản
                                                Nhiệt
                                            </h3>
                                            <div className="flex items-center mt-2 text-yellow-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"
                                                     viewBox="0 0 20 20">
                                                    <path
                                                        d="M10 15l-5.878 3.09 1.122-6.545L0 6.545l6.561-.954L10 0l3.439 5.591L20 6.545l-5.244 5.09L15.878 18z"/>
                                                </svg>
                                                <span className="ml-1 text-gray-600">(1)</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-red-500 font-bold">390,000₫</span>
                                                <span className="text-gray-500 line-through ml-2">500,000₫</span>
                                            </div>
                                        </div>
                                        <div
                                            className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-0 hover:opacity-60 transition-opacity duration-300 flex justify-center items-center space-x-4">
                                            <FontAwesomeIcon
                                                icon={faCartPlus}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-red-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faExclamationCircle}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-yellow-900"

                                            />
                                        </div>
                                    </div>
                                    {/* item5   */}
                                    <div className=" rounded-lg overflow-hidden relative">
                                        <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                                            <div className="relative">
                                            <span
                                                className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">SALE!</span>
                                                <img src={image5} alt="Product Image"
                                                     className="w-full h-45 object-cover rounded"/>
                                            </div>
                                            <h3 className="mt-2 text-sm font-semibold">
                                                Ram PC Asus 32GB DDR5 4800MHz | 16GB x2, Không Tản Nhiệt
                                            </h3>
                                            <div className="flex items-center mt-2 text-yellow-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"
                                                     viewBox="0 0 20 20">
                                                    <path
                                                        d="M10 15l-5.878 3.09 1.122-6.545L0 6.545l6.561-.954L10 0l3.439 5.591L20 6.545l-5.244 5.09L15.878 18z"/>
                                                </svg>
                                                <span className="ml-1 text-gray-600">(1)</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-red-500 font-bold">390,000₫</span>
                                                <span className="text-gray-500 line-through ml-2">500,000₫</span>
                                            </div>
                                        </div>
                                        <div
                                            className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-0 hover:opacity-60 transition-opacity duration-300 flex justify-center items-center space-x-4">
                                            <FontAwesomeIcon
                                                icon={faCartPlus}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-red-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faExclamationCircle}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-yellow-900"

                                            />
                                        </div>
                                    </div>
                                    {/* item6   */}
                                    <div className=" rounded-lg overflow-hidden relative">
                                        <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                                            <div className="relative">
                                            <span
                                                className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">SALE!</span>
                                                <img src={image6} alt="Product Image"
                                                     className="w-full h-45 object-cover rounded"/>
                                            </div>
                                            <h3 className="mt-2 text-sm font-semibold">
                                                Ram DDR4 Gigabyte 16G/3200 Aorus RGB (2x 8GB) (GP-ARS16G32)
                                            </h3>
                                            <div className="flex items-center mt-2 text-yellow-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"
                                                     viewBox="0 0 20 20">
                                                    <path
                                                        d="M10 15l-5.878 3.09 1.122-6.545L0 6.545l6.561-.954L10 0l3.439 5.591L20 6.545l-5.244 5.09L15.878 18z"/>
                                                </svg>
                                                <span className="ml-1 text-gray-600">(1)</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-red-500 font-bold">390,000₫</span>
                                                <span className="text-gray-500 line-through ml-2">500,000₫</span>
                                            </div>
                                        </div>
                                        <div
                                            className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-0 hover:opacity-60 transition-opacity duration-300 flex justify-center items-center space-x-4">
                                            <FontAwesomeIcon
                                                icon={faCartPlus}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faHeart}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-red-900"

                                            />
                                            <FontAwesomeIcon
                                                icon={faExclamationCircle}
                                                className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-yellow-900"

                                            />
                                        </div>
                                    </div>
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