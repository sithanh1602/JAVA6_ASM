import React from "react";
import Header from "../components/about/header";
import Services from "../components/about/services";
import WarrantyPolicy from "../components/about/WarrantyPolicy";

function AboutPage() {
    return (
        <div className="font-sans text-gray-800">
            <Header />
            <Services />
            <WarrantyPolicy />
        </div>
    );
}

export default AboutPage;
