import React from 'react';

import BannerContent from "../components/home/banner";
import CategoryTabs from "../components/home/CategoryTabs";
import PopularProducts  from "../components/home/popularProducts";
import BannerPhu from "../components/home/bannerPhu";
import BrandLogo  from "../components/home/BrandLogo";

const HomePage = () => {
    return (
        <div className="bg-white">
            <div className="container mx-auto p-4">
                <BannerContent/>
                <CategoryTabs/>
                <PopularProducts/>
                <BannerPhu/>
                <BrandLogo/>
            </div>
        </div>
    );
};

export default HomePage;
