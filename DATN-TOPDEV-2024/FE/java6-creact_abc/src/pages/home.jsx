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
import ProfilePage from "../components/account/profile";
import ProvinceSelect from "../components/account/ProvinceSelect";
import Address from "../components/account/AdderssList";
import EditAddress from "../components/account/EditAddress";

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
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/ProvinceSelect" element={<ProvinceSelect />} />
                    <Route path="/Address" element={<Address />} />
                    <Route path="/Editadderss" element={<EditAddress />} />
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
