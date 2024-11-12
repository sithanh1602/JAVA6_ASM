import React from 'react';
import { FaBars, FaBell, FaEnvelope } from 'react-icons/fa'; // Menu, Bell, and Envelope icons
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Toast notifications
import Swal from 'sweetalert2'; // SweetAlert2 for confirmation dialog
import { motion } from 'framer-motion'; // Framer Motion for animations
import Cookies from 'js-cookie'; // Cookies management

const HorizontalMenu = ({ toggleMenu }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        Swal.fire({
            title: 'Xác nhận đăng xuất',
            text: "Bạn có chắc chắn muốn đăng xuất không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                localStorage.removeItem('roles');
                sessionStorage.removeItem('token');
                Cookies.remove('token');

                toast.success('Đăng xuất thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                });

                navigate('/');
            }
        });
    };

    return (
        <motion.div
            className="bg-white text-gray-900 p-4 shadow-lg flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
        >
            <FaBars
                className="cursor-pointer md:hidden"
                onClick={toggleMenu}
                size={24}
            />
            <ul className="hidden md:flex space-x-6">
                <motion.li className="hover:text-gray-500 cursor-pointer transition"><Link to="/admin/dash">Dashboard</Link></motion.li>
                <motion.li className="hover:text-gray-500 cursor-pointer transition">
                    <Link to="/admin/prd">Product</Link>
                </motion.li>
                <motion.li className="hover:text-gray-500 cursor-pointer transition">Orders</motion.li>
                <motion.li className="hover:text-gray-500 cursor-pointer transition">
                    <Link to="/admin/user">User</Link>
                </motion.li>
                <motion.li className="hover:text-gray-500 cursor-pointer transition">Settings</motion.li>
            </ul>
            <div className="flex items-center space-x-4">
                <FaBell className="text-pink-500 cursor-pointer" size={20} />
                <FaEnvelope className="text-pink-500 cursor-pointer" size={20} />
                <div className="flex items-center">
                    <img
                        src="https://via.placeholder.com/30"
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="ml-2">John Doe</span>
                </div>
                <motion.button
                    onClick={handleLogout}
                    className="text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Đăng xuất
                </motion.button>
            </div>
        </motion.div>
    );
};

export default HorizontalMenu;
