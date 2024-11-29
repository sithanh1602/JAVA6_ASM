import React from 'react';

import BannerContent from "../components/home/banner";
import PopularProducts from "../components/home/popularProducts";
import TopProducts  from "../components/home/TopProducts";
import CategoryOnlineShopping from "../components/home/Category-OnlineShopping";
import BannerPhu from "../components/home/bannerPhu";
import BrandLogo  from "../components/home/BrandLogo";
import SliderProductBottom from "../components/home/SliderProductBottom";

const HomePage = () => {
    return (
        <div className="bg-white">
            <div className="container mx-auto p-4">
                <BannerContent/>
                <TopProducts/>
                <PopularProducts/>
                <BannerPhu/>
                <CategoryOnlineShopping/>
                <SliderProductBottom/>
                <BrandLogo/>
            </div>
        </div>
    );
};

export default HomePage;
