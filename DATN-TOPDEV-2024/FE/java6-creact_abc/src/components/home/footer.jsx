import React from 'react';
import 'aos/dist/aos.css';
import logo from "../../assets/images/logoWeb.png";

const Footer = () => {

    return (
        <footer className="bg-black text-white py-10">
            <div className="container mx-auto px-4">

                <div className="flex flex-col lg:flex-row justify-between items-center border-b border-gray-700 pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-orange-500">Đăng Ký Tin Tức</h2>
                        <p className="text-gray-400">Đăng ký ngay để cập nhật được tin tức mới nhất</p>
                    </div>
                    <div className="mt-4 lg:mt-0 flex space-x-2">
                        <input
                            type="email"
                            placeholder="Email*"
                            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-md outline-none"
                        />
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md">
                            ĐĂNG KÝ
                        </button>
                    </div>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 px-7">

                    <div>
                        <div className="flex items-center space-x-4">
                            <img
                                src={logo}
                                alt="Mona Smart Technology Logo"
                                className="h-10"
                            />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold">TECH SMART</span>
                                <span className="text-orange-300 text-xs">TECHNOLOGY</span>
                            </div>
                        </div>
                        <p className="text-gray-400">
                            Hãy khám phá bộ sưu tập sản phẩm công nghệ của chúng tôi ngay hôm nay và trải nghiệm mua
                            sắm trực tuyến tuyệt vời tại trang chủ của chúng tôi.
                        </p>
                        <div className="mt-4">
                            <p className="flex items-center text-gray-400">
                                <span className="mr-2 text-orange-500">&#10149;</span> info@fivestar.team
                            </p>
                            <p className="flex items-center text-gray-400 mt-2">
                                <span className="mr-2 text-orange-500">&#9742;</span> (+84) 0313-728-397
                            </p>
                        </div>
                        {/*<div className="flex space-x-2 mt-4">*/}
                        {/*    <img*/}
                        {/*        src="https://upload.wikimedia.org/wikipedia/commons/5/58/Google_Play_Store_badge_EN.svg"*/}
                        {/*        alt="Google Play"*/}
                        {/*        className="h-8"*/}
                        {/*    />*/}
                        {/*    <img*/}
                        {/*        src="https://upload.wikimedia.org/wikipedia/commons/7/78/App_Store_%28iOS%29.svg"*/}
                        {/*        alt="App Store"*/}
                        {/*        className="h-8"*/}
                        {/*    />*/}
                        {/*</div>*/}
                    </div>


                    <div>
                        <h3 className="text-lg font-semibold mb-4">Danh mục</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Phần cứng chính</li>
                            <li>Thiết bị hiển thị và đầu vào</li>
                            <li>Thiết bị phụ trợ </li>
                            <li>Phụ kiện khác</li>
                        </ul>
                    </div>


                    <div>
                        <h3 className="text-lg font-semibold mb-4">Dịch vụ</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Điều khoản & Điều kiện</li>
                            <li>Vận chuyển</li>
                            <li>Chính sách bảo mật</li>
                            <li>Giúp đỡ</li>
                        </ul>
                    </div>


                    <div>
                        <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <a href="/aboutUs" className="hover:text-orange-500 transition-colors">
                                Giới thiệu
                                </a>
                            </li>
                            <li>
                                <a href="/products" className="hover:text-orange-500 transition-colors">
                                    Sản phẩm
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="hover:text-orange-500 transition-colors">
                                    Liên hệ
                                </a>
                            </li>
                            <li>
                                <a href="/news" className="hover:text-orange-500 transition-colors">Tin tức
                                </a>
                            </li>
                        </ul>

                    </div>
                </div>


                <div className="mt-8 text-center text-gray-500 text-sm">
                    © Thiết kế và lập trình bởi <span className="text-orange-500">Five-Star Team</span>
                </div>
            </div>
        </footer>

    );

}
export default Footer;