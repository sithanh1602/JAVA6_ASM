import React from 'react';

import BannerCarousel from "../components/home/BannerCarousel";
import LogoMarquee   from "../components/home/LogoMarquee";
import FeatureSection from "../components/home/FeatureSection";
import CountdownSale from "../components/home/CountdownSale";
import ProductList from "../components/home/ProductList";
import HotProducts from "../components/home/HotProducts";
import NewProduct from "../components/home/NewProduct";

const HomePage = () => {
    return (
        <div className="bg-gray-100 will-change-transform">
            <div className="container mx-auto p-4 w-[80%]">
                <BannerCarousel />
                <LogoMarquee />
                <FeatureSection />
                <CountdownSale />
                <HotProducts />
                <NewProduct />
                <ProductList />
            </div>
        </div>
    );
};

export default HomePage;
