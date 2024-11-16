import React,  { useState } from 'react';
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
import MessageIcon from "../components/home/MessageIcon";

const HomePage = () => {
    return (
            <div className="bg-white">
                <div className="container mx-auto p-4">
                    <Header />
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Conten />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/product/:productId" element={<ProductPage />} />
                    </Routes>
                </div>
                <Footer/>
                {/* Container for the buttons */}
                <div className="fixed bottom-4 left-4 z-50 flex space-x-4">
                    {/* Cart Button */}
                    <div>
                        <CartButton />
                    </div>
                </div>

            </div>
    );
};

export default HomePage;
