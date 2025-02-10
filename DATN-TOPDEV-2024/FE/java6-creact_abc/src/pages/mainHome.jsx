import React from 'react';

import BannerContent from "../components/home/banner";
import PopularProducts from "../components/home/popularProducts";
import TopProducts  from "../components/home/TopProducts";
import CategoryOnlineShopping from "../components/home/Category-OnlineShopping";
import BannerPhu1 from "../components/home/bannerPhu";
import BrandLogo  from "../components/home/BrandLogo";
import SliderProductBottom from "../components/home/SliderProductBottom";
import BannerPhu2 from "../components/home/bannerBottom";
import TabProduct from "../components/nextUI/home/TabProduct";

const HomePage = () => {
    return (
        <div className="bg-gray-100 will-change-transform">
            <div className="container mx-auto p-4">
                <BannerContent/>
                {/*<TabProduct/>*/}
                <PopularProducts/>
                <BannerPhu1/>
                <CategoryOnlineShopping/>
                <BannerPhu2/>
                <SliderProductBottom/>
                <BrandLogo/>
            </div>
        </div>
    );
};

export default HomePage;
