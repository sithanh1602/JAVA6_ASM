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

const HomePage = () => {
    return (
        <div className="bg-white">
            <div className="container mx-auto p-4">
                <Header/>
                <Navbar/>
                <Routes>
                    <Route path="/" element={<Conten/>}/>
                    <Route path="/products" element={<Products/>}/>
                    <Route path="/cart" element={<Cart/>}/>
                    <Route path="/product/:productId" element={<ProductPage/>}/>
                    <Route path="/products/:productId/productdetail" element={<ProductDetail />} />
                    <Route path="/aboutUs" element={<AboutUs/>}/>
                    <Route path="/contact" element={< Contact/>}/>
                    <Route path="/news" element={< News/>}/>
                    <Route path="/orders" element={< GroupOrder/>}/>
                    <Route path="/profile/*" element={<ProfilePage />} />
                    <Route path="/OrderUser" element={<OrderList />} />
                    <Route path="/payment/vnpay-payment" element={<PaymentSuccess />} />
                </Routes>
            </div>
            <Footer className="mt-auto"/>
        </div>
    )
};

export default HomePage;
