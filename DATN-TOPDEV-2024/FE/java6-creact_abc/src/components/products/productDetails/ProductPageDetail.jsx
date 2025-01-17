import React, { useState } from 'react';
import ProductDetail from "./ProductDetail";
import ProductActions from './ProductActions';

const ProductPage = () => {
    const [activeTab, setActiveTab] = useState('description');

    return (
        <div className="flex flex-col items-center p-10">
            <div className="flex w-full max-w-6xl space-x-4">
                <div className="flex-1">
                    <ProductDetail />
                </div>
                <div className="flex-1">
                    <ProductActions activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
