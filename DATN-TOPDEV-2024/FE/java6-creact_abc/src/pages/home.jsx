import React, {useState} from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';
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
import GroupOrder from "../components/Oder/GroupOrder";
import ProfilePage from "../components/Profile/ProfilePage";
import OrderList from "../components/Oder/OrderList";
import PaymentSuccess from "../components/vnpaypayment/PaymentSuccess";
import ProductDetail from "../components/products/productDetails/ProductDetail";
import HeaderDownNavbar from "../components/home/headerDownNavbar";
import AuthForm from "../components/account/AuthForm";
import OrderDetail from "../components/Oder/OrderDetail";


const HomePage = () => {
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
                    <Route path="/news" element={< News/>}/>
                    <Route path="/orders" element={< GroupOrder/>}/>
                    <Route path="/profile/*" element={<ProfilePage />} />
                    <Route path="/OrderUser" element={<OrderList />} />
                    <Route path="/payment/vnpay-payment" element={<PaymentSuccess />} />
                    <Route path="/order-detail/:orderId" element={<OrderDetail />} />
                </Routes>
            </div>
            <Footer className="mt-auto"/>
        </div>
    )
};

export default HomePage;
