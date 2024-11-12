import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import ProductService from "../../servies/ProductService";

const ProductCard = ({ product, index }) => {
    const [totalQuantity, setTotalQuantity] = useState(0);

    useEffect(() => {
        const fetchProductVariants = async () => {
            try {
                const variants = await ProductService.getProductVariants(product.id); // Fetch variants by product ID
                // Sum the quantities of all variants
                const total = variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
                setTotalQuantity(total);
            } catch (error) {
                console.error(`Error fetching variants for product ${product.id}:`, error);
            }
        };

        fetchProductVariants();
    }, [product.id]);

    return (
        <div className="bg-white p-4 rounded shadow">
            <Link to={`/product/${product.id}`}>
                <div className="flex justify-center items-center">
                    <img
                        src={product.imageUrl || `https://placehold.co/200x200?text=Product+Image+${index + 1}`}
                        alt={product.name || `Product Image ${index + 1}`}
                        className="h-48 object-cover mb-4"
                    />
                </div>
            </Link>
            <h3 className="text-sm font-bold mb-2">{product.name}</h3>
            <div className="text-sm text-gray-600 mb-2">{product.description}</div>
            <div className="text-sm text-orange-500 font-bold mb-2">Còn lại: {totalQuantity}</div> {/* Display the total quantity */}
            <div className="flex items-center justify-center mt-4">
                <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-200 ease-in-out">
                    Xem ngay
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
