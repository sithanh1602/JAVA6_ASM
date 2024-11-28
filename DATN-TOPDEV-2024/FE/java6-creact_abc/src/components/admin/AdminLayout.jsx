import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import VerticalMenu from './VerticalMenu';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import Users from "../../pages/admin/Users";
import Products from "../../pages/admin/Products";
import Dashboard from "./TableForm/DashB/mainDash";
import Categorys from "../../pages/admin/Categorys";
import OrderStatus from "./TableForm/OrderStatus";
import BrandTableWithBoundary from "./TableForm/Brands/BrandTable";
import AdminOrderManagement  from "./TableForm/OrderStatusAdmin/AdminOrderManagement";
import Top3User from "../dashBoard/Top3User";
const AdminLayout = () => {
    const [isOpen, setIsOpen] = useState(true); // Mở menu dọc mặc định
    const navigate = useNavigate();

    useEffect(() => {
        const userRole = JSON.parse(localStorage.getItem('roles'));

        if (!userRole || userRole[0] !== 'ADMIN') {
            Swal.fire({
                title: 'Không có quyền truy cập',
                text: 'Bạn không có quyền truy cập trang này.',
                icon: 'warning',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/');
            });
        }
    }, [navigate]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="w-full flex h-full">
            <VerticalMenu isOpen={isOpen} toggleMenu={toggleMenu} />
            <div className="flex-grow p-4 bg-gray-100">
                {/*<HorizontalMenu toggleMenu={toggleMenu} />*/}
                <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                >
                    <Routes>
                        <Route path="/" element={<AdminOrderManagement />} />
                        <Route path="/dash" element={<Top3User />} />
                        <Route path="/user" element={<Users />} />
                        <Route path="/category" element={<Categorys />} />
                        <Route path="/brand" element={<BrandTableWithBoundary />} />
                        <Route path="/product" element={<Products />} />
                    </Routes>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLayout;
