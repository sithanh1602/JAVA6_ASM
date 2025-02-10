import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import VerticalMenu from './VerticalMenu';
import { motion } from 'framer-motion';
import Users from "../../pages/admin/Users";
import Products from "../../pages/admin/Products";
import Posts from "../../pages/admin/Posts";
import Categorys from "../../pages/admin/Categorys";
import TemplateList from "../excel/TemplateList";
import BrandTableWithBoundary from "./TableForm/Brands/BrandTable";
import Top3User from "../dashBoard/Top3User";
import Contact from "../../pages/admin/Contact";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MonthlyProductionChart from "./TableForm/DashB/RevenueChart";
import AdminOrderManagement from "./TableForm/OrderStatusAdmin/AdminOrderManagement";

import Event from "../../pages/admin/EventForm";

const AdminLayout = () => {
    const [isOpen, setIsOpen] = useState(true); // Mở menu dọc mặc định
    const navigate = useNavigate();
    const [client, setClient] = useState(null);

    useEffect(() => {
        const userRole = JSON.parse(localStorage.getItem('roles'));

        if (!userRole || userRole[0] !== 'ADMIN') {
            toast.error('Bạn không có quyền truy cập trang này.');
            navigate('/');
        } else {
            const socket = new SockJS('http://localhost:8080/ws');
            const stompClient = new Client({
                webSocketFactory: () => socket,
                debug: (str) => {
                    console.log(str);
                },
                onConnect: () => {
                    stompClient.subscribe('/topic/orders', (message) => {
                        toast.info(`Đơn hàng mới: ${message.body}`);
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                },
            });

            stompClient.activate();
            setClient(stompClient);
        }
    }, [navigate]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="w-full flex h-full">
            <VerticalMenu isOpen={isOpen} toggleMenu={toggleMenu} />
            <div className="flex-grow p-4 bg-gray-100">
                <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                >
                    <Routes>
                        <Route path="/" element={<Top3User />} />
                        <Route path="/dash" element={<Top3User />} />
                        <Route path="/user" element={<Users />} />
                        <Route path="/category" element={<Categorys />} />
                        <Route path="/brand" element={<BrandTableWithBoundary />} />
                        <Route path="/product" element={<Products />} />
                        <Route path="/post" element={<Posts />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/tk" element={<MonthlyProductionChart />} />
                        <Route path="/tplXlsx" element={<TemplateList />} />
                        <Route path="/order" element={<AdminOrderManagement />} />

                        <Route path="/event" element={<Event />} />

                    </Routes>
                </motion.div>
            </div>
            <ToastContainer />
        </div>
    );
};


export default AdminLayout;
