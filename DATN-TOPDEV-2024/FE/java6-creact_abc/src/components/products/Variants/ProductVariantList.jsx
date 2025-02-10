import React, { useEffect, useState } from "react";
import getAllProductVariants from "../../../services/ProductVariantService";
import ProductVariantCard from "./VariantsProductCard";

const ProductVariantList = () => {
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        const fetchVariants = async () => {
            const data = await getAllProductVariants();
            setVariants(data);
        };

        fetchVariants();
    }, []);

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-bold mb-4">Danh sách sản phẩm</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {variants.length > 0 ? (
                    variants.map((variant) => <ProductVariantCard key={variant.idVariants} variant={variant} />)
                ) : (
                    <p>Không có sản phẩm nào.</p>
                )}
            </div>
        </div>
    );
};

export default ProductVariantList;
