import React, { useEffect, useState } from 'react';
import ProductService from "../../../services/ProductService";
import { useParams } from "react-router-dom";

const ProductActions = ({ activeTab, setActiveTab }) => {
    const { productId } = useParams(); // Lấy productId từ URL
    const [product, setProduct] = useState(null);

    useEffect(() => {
        // Fetch product details and brand when productId changes
        const fetchProductDetails = async () => {
            try {
                const fetchedProduct = await ProductService.getProductById(productId); // Lấy thông tin sản phẩm
                setProduct(fetchedProduct);

            } catch (err) {
                console.error("Error fetching product details:", err);
            }
        };

        fetchProductDetails();
    }, [productId]); // Fetch lại dữ liệu khi productId thay đổi

    const renderContent = () => {
        if (!product) {
            return <p>Loading...</p>;
        }

        switch (activeTab) {
            case 'description':
                return <p>{product.description}</p>;
            case 'additionalInfo':
                return <p>Additional information content goes here.</p>;
            case 'reviews':
                return <p>Customer reviews content goes here.</p>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center mt-10">
            <div className="flex space-x-4 mb-4">
                <button
                    className={`px-6 py-2 ${activeTab === 'description' ? 'bg-orange-500 text-white' : 'border'}`}
                    onClick={() => setActiveTab('description')}
                >
                    MÔ TẢ
                </button>
                <button
                    className={`px-6 py-2 ${activeTab === 'additionalInfo' ? 'bg-orange-500 text-white' : 'border'}`}
                    onClick={() => setActiveTab('additionalInfo')}
                >
                    THÔNG TIN BỔ SUNG
                </button>
                <button
                    className={`px-6 py-2 ${activeTab === 'reviews' ? 'bg-orange-500 text-white' : 'border'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    ĐÁNH GIÁ (1)
                </button>
            </div>
            <div className="border p-4 w-full max-w-6xl">
                {renderContent()}
            </div>
        </div>
    );
};

export default ProductActions;
