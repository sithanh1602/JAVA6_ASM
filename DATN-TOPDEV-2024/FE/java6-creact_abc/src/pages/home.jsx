import React, {useEffect} from 'react';

import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/home/navbar';
import Header from '../components/home/header';
import Conten from "./mainHome";
import Products from "./products";
import Cart from "./Cart";
import Favorite from "./Favorite";
import Footer from '../components/home/footer';
import ProductPage from "../components/products/productDetails/ProductPageDetail";
import AboutUs from "./mainAbout";
import Contact from "./mainContact";
import News from "./mainNews";
import PCBuildsPage from './PCBuildsPage';
import BlogDetail from "../components/news/BlogDetail";
import SinglePost from "../components/news/SinglePost";
import GroupOrder from "../components/Oder/GroupOrder";
import ProfilePage from "../components/Profile/ProfilePage";
import OrderList from "../components/Oder/OrderList";
import PaymentSuccess from "../components/vnpaypayment/PaymentSuccess";
import ProductDetail from "../components/products/productDetails/ProductDetail";
import HeaderDownNavbar from "../components/home/headerDownNavbar";
import AuthForm from "../components/account/AuthForm";
import OrderDetail from "../components/Oder/OrderDetail";
import FloatingChatbox from "../components/AI/ChatBot/FloatingChatbox";
import PCBuilderComponent from "../components/buildPC/PCBuilderComponent";
import PCBuildDetail from "../components/buildPC/DetailPC/PCBuildDetail";
import SockJS from "sockjs-client";
import { Client } from '@stomp/stompjs';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';


const HomePage = () => {
    useEffect(() => {
        let isConnected = false;
        let stompClient = null;
        let currentUserId = null;

        // Lấy token từ cookie và giải mã để lấy userId
        const getUserIdFromToken = () => {
            const token = Cookies.get('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    return decoded?.userId || null;
                } catch (error) {
                    console.error('Lỗi khi giải mã token:', error);
                }
            }
            return null;
        };

        const connectWebSocket = () => {
            const socket = new SockJS('http://localhost:8080/ws');
            stompClient = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
            });

            stompClient.onConnect = () => {
                if (!isConnected) {
                    console.log('Đã kết nối tới WebSocket');
                    stompClient.subscribe('/topic/status', (message) => {
                        try {
                            const parsedMessage = JSON.parse(message.body);
                            const { orderNum, status, userId } = parsedMessage;

                            // Chỉ thông báo nếu userId hợp lệ và orderNum không undefined
                            if (userId && userId === currentUserId && orderNum) {
                                const statusMessage = getStatusMessage(status);
                                toast.info(`🛒 Đơn hàng ${orderNum} của bạn đang ở trạng thái ${statusMessage}`);
                            }
                        } catch (error) {
                            console.error('Lỗi khi xử lý tin nhắn WebSocket:', error);
                        }
                    });
                    isConnected = true;
                }
            };

            stompClient.activate();
        };

        currentUserId = getUserIdFromToken();
        console.log('User ID hiện tại:', currentUserId);
        if (currentUserId) {
            connectWebSocket();
        }

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
            isConnected = false;
        };
    }, []);



    // Chuyển đổi trạng thái đơn hàng
    const getStatusMessage = (status) => {
        switch (status) {
            case 1: return "Đã đặt hàng";
            case 2: return "Chưa thanh toán";
            case 3: return "Đã thanh toán";
            case 4: return "Đã xác nhận";
            case 5: return "Đang giao hàng";
            case 6: return "Đã giao hàng";
            case 7: return "Đã nhận hàng";
            case 8: return "Đã hoàn thành";
            case 9: return "Đã huỷ";
            default: return "Trạng thái không xác định";
        }
    };

    return (
        <div className="bg-gray-100">
            <div className="container-fluid bg-gray-100">
                <Header/>
                <Navbar/>
                <HeaderDownNavbar/>
                <Routes>
                    <Route path="/" element={<Conten/>}/>
                    <Route path="/loginn" element={<AuthForm />} />
                    <Route path="/products" element={<Products/>}/>
                    <Route path="/cart" element={<Cart/>}/>
                    <Route path="/wishlist" element={<Favorite/>}/>
                    <Route path="/product/:productId" element={<ProductPage/>}/>
                    <Route path="/products/:productId/productdetail" element={<ProductDetail />} />
                    <Route path="/aboutUs" element={<AboutUs/>}/>
                    <Route path="/contact" element={< Contact/>}/>
                    <Route path="/posts" element={< News/>}/>
                    <Route path="/post/:id" element={<SinglePost />} />
                    <Route path="/orders" element={< GroupOrder/>}/>
                    <Route path="/profile/*" element={<ProfilePage />} />
                    <Route path="/OrderUser" element={<OrderList />} />
                    <Route path="/payment/vnpay-payment" element={<PaymentSuccess />} />
                    <Route path="/order-detail/:orderId" element={<OrderDetail />} />
                    <Route path="/PC" element={<PCBuildsPage />} />
                    <Route path="/BuilderPC" element={<PCBuilderComponent />} />
                    <Route path="/details/:buildId" element={<PCBuildDetail />} />
                </Routes>
            </div>
            <FloatingChatbox />
            <Footer className="mt-auto" />
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    )
};

export default HomePage;
