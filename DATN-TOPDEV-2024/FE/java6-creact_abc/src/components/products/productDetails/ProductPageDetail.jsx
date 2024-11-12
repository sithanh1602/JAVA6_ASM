import React, { useState } from 'react';
import ProductDetail from "./ProductDetail";
import ProductActions from './ProductActions';

const ProductPage = () => {
    const [activeTab, setActiveTab] = useState('description');

    return (
        <div>
            <div className="flex justify-center p-10">
                <div className="flex w-full max-w-6xl">
                    <ProductDetail />
                </div>
            </div>
            <ProductActions activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
};

export default ProductPage;
