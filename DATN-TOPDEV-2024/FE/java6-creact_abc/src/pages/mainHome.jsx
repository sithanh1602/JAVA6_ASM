import React from 'react';

import BannerContent from "../components/home/banner";
import PopularProducts from "../components/home/popularProducts";
import TopProducts  from "../components/home/TopProducts";
import CategoryOnlineShopping from "../components/home/Category-OnlineShopping";
import BannerPhu1 from "../components/home/bannerPhu";
import BrandLogo  from "../components/home/BrandLogo";
import SliderProductBottom from "../components/home/SliderProductBottom";
import BannerPhu2 from "../components/home/bannerBottom";

const HomePage = () => {
    return (
        <div className="bg-white">
            <div className="container mx-auto p-4">
                <BannerContent/>
                <TopProducts/>
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
