import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import VerticalMenu from './VerticalMenu';
import { motion } from 'framer-motion';
import Users from "../../pages/admin/Users";
import Products from "../../pages/admin/Products";
import Posts from "../../pages/admin/Posts/Posts";
import Categorys from "../../pages/admin/Categorys";
import BrandTableWithBoundary from "./TableForm/Brands/BrandTable";
import Top3User from "../dashBoard/Dashboard";
import Contact from "../../pages/admin/Contact";
import Reviews from "../../pages/admin/Reviews";
import Tag from "../../pages/admin/Posts/PostTag";
import PostCategory from "../../pages/admin/Posts/PostCategory";
import PCBuildsAdmin from "../../pages/admin/PCBuildsAdmin";
import Vouchers from "../../pages/admin/Vouchers";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MonthlyProductionChart from "./TableForm/DashB/RevenueChart";
import AdminOrderManagement from "./TableForm/OrderStatusAdmin/AdminOrderManagement";
import { ThemeProvider } from '../../views/ThemeContext';
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";

const AdminLayout = () => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [lastMessageTime, setLastMessageTime] = useState(0); // Thời gian của thông báo cuối cùng

    useEffect(() => {
        const token = Cookies.get("jwtToken");
        let decodedUserId = null;

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                decodedUserId = decodedToken.userId;
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }

        const decodedToken = jwtDecode(token);
        const roles = decodedToken.roles || [];


        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                stompClient.subscribe('/topic/orders', (message) => {
                    const currentTime = new Date().getTime();
                    // Chỉ hiện thông báo nếu đã qua 3 giây từ lần cuối
                    if (currentTime - lastMessageTime >= 3000) {
                        toast.info(`Đơn hàng mới: ${message.body}`);
                        setLastMessageTime(currentTime);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            stompClient.deactivate();
        };
    }, [navigate, lastMessageTime]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <ThemeProvider>
            <div className="w-full flex h-full dark:bg-gray-900">
                <VerticalMenu isOpen={isOpen} toggleMenu={toggleMenu} />
                <div className="flex-grow p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
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
                            <Route path="/post/tag" element={<Tag />} />
                            <Route path="/post/category" element={<PostCategory />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/reviews" element={<Reviews />} />
                            <Route path="/tk" element={<MonthlyProductionChart />} />
                            <Route path="/order" element={<AdminOrderManagement />} />
                            <Route path="/pc-builds" element={<PCBuildsAdmin />} />
                            <Route path="/voucher" element={<Vouchers />} />
                        </Routes>
                    </motion.div>
                </div>
                <ToastContainer
                    theme="colored"
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </div>
        </ThemeProvider>
    );
};

export default AdminLayout;