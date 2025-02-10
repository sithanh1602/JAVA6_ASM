import React from "react";

const ProductVariantCard = ({ variant }) => {
    return (
        <div className="border rounded-lg shadow-md p-4 w-64">
            <img src={variant.imageUrl} alt={variant.name} className="w-full h-40 object-cover rounded" />
            <h3 className="text-lg font-semibold mt-2">{variant.name}</h3>
            <p className="text-sm text-gray-600">{variant.description}</p>
            <p className="text-red-500 font-bold">${variant.price.toFixed(2)}</p>
            <p className="text-green-600">{variant.stock > 0 ? "In Stock" : "Out of Stock"}</p>
        </div>
    );
};

export default ProductVariantCard;
