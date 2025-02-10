import React, { useState } from "react";

const ProductVariantsInput = () => {
    const [formData, setFormData] = useState({
        product_id: 1,
        color: "Black",
        size: "Large",
        quantity: 50,
        image: "https://via.placeholder.com/150",
    });

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg space-y-4 mx-auto">
            <h2 className="text-2xl font-bold">Product Information</h2>
            <div>
                <label className="block text-lg font-medium">Product ID</label>
                <input
                    type="number"
                    name="product_id"
                    value={formData.product_id}
                    className="w-[500px] p-3 border rounded-lg text-lg"
                    placeholder="Enter product ID"
                />
            </div>
            <div>
                <label className="block text-lg font-medium">Color</label>
                <input
                    type="text"
                    name="color"
                    value={formData.color}
                    className="w-[500px] p-3 border rounded-lg text-lg"
                    placeholder="Enter color"
                />
            </div>
            <div>
                <label className="block text-lg font-medium">Size</label>
                <input
                    type="text"
                    name="size"
                    value={formData.size}
                    className="w-[500px] p-3 border rounded-lg text-lg"
                    placeholder="Enter size"
                />
            </div>
            <div>
                <label className="block text-lg font-medium">Quantity</label>
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    className="w-[500px] p-3 border rounded-lg text-lg"
                    placeholder="Enter quantity"
                />
            </div>
            <div>
                <label className="block text-lg font-medium">Image</label>
                <input
                    type="text"
                    name="image"
                    value={formData.image}
                    className="w-[500px] p-3 border rounded-lg text-lg"
                    placeholder="Enter image URL"
                />
            </div>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg">
                Save
            </button>
        </div>
    );
};

export default ProductVariantsInput;
