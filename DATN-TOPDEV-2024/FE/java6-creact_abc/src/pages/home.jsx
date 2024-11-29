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
import CartButton from "../components/home/CartButton";
import AboutUs from "./mainAbout";
import Contact from "./mainContact";
import News from "./mainNews";
import GroupOrder from "../components/Oder/GroupOrder";
import MessageIcon from "../components/home/MessageIcon";
import ProfilePage from "../components/Profile/ProfilePage";
import ProvinceSelect from "../components/account/ProvinceSelect";
import Address from "../components/account/AdderssList";
import EditAddress from "../components/account/EditAddress";
import OrderList from "../components/Oder/OrderList";
import PaymentSuccess from "../components/vnpaypayment/PaymentSuccess";

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
                    <Route path="/aboutUs" element={<AboutUs/>}/>
                    <Route path="/contact" element={< Contact/>}/>
                    <Route path="/news" element={< News/>}/>
                    <Route path="/product/:productId" element={<ProductPage/>}/>
                    <Route path="/orders" element={< GroupOrder/>}/>
                    <Route path="/profile/*" element={<ProfilePage />} /> {/* Lưu ý: Dùng `/*` để định nghĩa các route con */}
                    {/*<Route path="/ProvinceSelect" element={<ProvinceSelect />} />*/}
                    {/*<Route path="/Editadderss" element={<EditAddress />} />*/}
                    <Route path="/OrderUser" element={<OrderList />} />
                    <Route path="/payment/vnpay-payment" element={<PaymentSuccess />} />
                </Routes>
            </div>
            <Footer className="mt-auto"/> {/* Ensure footer sticks to the bottom */}
            {/* Container for the buttons */}
            <div className="fixed bottom-4 left-4 z-50 flex space-x-4">
                {/* Cart Button */}
                <div>
                    <CartButton/>
                </div>
            </div>
        </div>
    )
};

export default HomePage;
