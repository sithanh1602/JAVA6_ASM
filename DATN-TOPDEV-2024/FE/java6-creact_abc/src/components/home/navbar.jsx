import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import logo from '../../assets/images/logoWeb.png';

const Navbar = () => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    return (<nav className="bg-white shadow">
            <div className="container mx-auto flex justify-around items-center py-4">
                <div className="flex items-center space-x-4">
                    <img
                        src={logo}
                        alt="Mona Smart Technology Logo"
                        className="h-10"
                    />
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold">MONA SMART</span>
                        <span className="text-orange-300 text-sm">TECHNOLOGY</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="bg-orange-500 text-white px-4 py-2 rounded flex items-center focus:outline-none"
                        >
                            <i className="fas fa-bars mr-2"></i>
                            <span>Danh mục</span>
                            <i className="fas fa-chevron-down ml-2"></i>
                        </button>
                        <ul className={`absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg transition-all duration-300 ease-in-out transform ${isDropdownOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
                            style={{zIndex: 50}}>
                            <li className="hover:bg-gray-100 relative group">
                                <Link to="#" className="block px-4 py-2 text-gray-700">Category 1</Link>
                                <ul className="absolute left-full top-0 mt-0 w-56 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block transition-all duration-300 ease-in-out transform group-hover:scale-100 group-hover:opacity-100 scale-95 opacity-0"
                                    style={{zIndex: 50}}>
                                    <li className="hover:bg-gray-100">
                                        <Link to="#" className="block px-4 py-2 text-gray-700">Subcategory 1.1</Link>
                                    </li>
                                    <li className="hover:bg-gray-100">
                                        <Link to="#" className="block px-4 py-2 text-gray-700">Subcategory 1.2</Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="hover:bg-gray-100">
                                <Link to="#" className="block px-4 py-2 text-gray-700">Category 2</Link>
                            </li>
                            <li className="hover:bg-gray-100">
                                <Link to="#" className="block px-4 py-2 text-gray-700">Category 3</Link>
                            </li>
                        </ul>
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm...."
                        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-orange-500"
                    />
                    <div className="flex space-x-4">
                        <ul className="flex space-x-4">
                            <li>
                                <Link to="/" className="text-gray-700 hover:text-orange-500 transition duration-300">Trang
                                    chủ</Link>
                            </li>
                            <li>
                                <Link to="/about"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Giới
                                    thiệu</Link>
                            </li>
                            <li>
                                <Link to="/products"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Sản
                                    phẩm</Link>
                            </li>
                            <li>
                                <Link to="/news"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Tin
                                    tức</Link>
                            </li>
                            <li>
                                <Link to="/contact"
                                      className="text-gray-700 hover:text-orange-500 transition duration-300">Liên
                                    hệ</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="flex space-x-4">
                        <i className="fas fa-heart text-gray-700 hover:text-orange-500 transition duration-300"></i>
                        <Link to="/cart" className="text-gray-700 hover:text-orange-500 transition duration-300"><i className="fas fa-shopping-cart text-gray-700 hover:text-orange-500 transition duration-300"></i></Link>
                    </div>
                </div>
            </div>
    </nav>);
};

export default Navbar;
