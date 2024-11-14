import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HorizontalMenu from './HorizontalMenu';
import VerticalMenu from './VerticalMenu';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import Users from "../../pages/admin/Users";
import ProductTable from "./TableForm/Products/ProductTable";
import Dashboard from "./TableForm/DashB/mainDash";
import ProductInput  from "./TableForm/Products/ProductInput";
import CategoryTable from "./TableForm/Categories/CategoryTable";
import CategoryInput from "./TableForm/Categories/CategoryInput";

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
                <HorizontalMenu toggleMenu={toggleMenu} />
                <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                >
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dash" element={<Dashboard />} />
                        <Route path="/user" element={<Users />} />
                        {/*ProductAdmin*/}
                        <Route path="/prd" element={<ProductTable />} />
                        <Route path="/prdInput" element={<ProductInput />} />

                        {/*categoryAdmin*/}
                        <Route path="/cateTable" element={<CategoryTable />} />
                        <Route path="/cateInput" element={<CategoryInput />} />
                    </Routes>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLayout;
