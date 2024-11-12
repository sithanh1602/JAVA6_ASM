import React, { useState } from 'react';

const ProductVariantsInput = () => {
    const [formData, setFormData] = useState({
        product_id: 1,
        color: 'Black',
        size: 'Large',
        quantity: 50,
        image: 'https://via.placeholder.com/150',
    });

    return (
        <div className="p-4 bg-white shadow-md rounded-md space-y-4">
            <h2 className="text-xl font-semibold">Product Information</h2>
            <div>
                <label className="block text-sm font-medium">Product ID</label>
                <input
                    type="number"
                    name="product_id"
                    value={formData.product_id}
                    className="w-full p-2 border rounded"
                    placeholder="Enter product ID"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Color</label>
                <input
                    type="text"
                    name="color"
                    value={formData.color}
                    className="w-full p-2 border rounded"
                    placeholder="Enter color"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Size</label>
                <input
                    type="text"
                    name="size"
                    value={formData.size}
                    className="w-full p-2 border rounded"
                    placeholder="Enter size"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Quantity</label>
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    className="w-full p-2 border rounded"
                    placeholder="Enter quantity"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Image</label>
                <input
                    type="text"
                    name="image"
                    value={formData.image}
                    className="w-full p-2 border rounded"
                    placeholder="Enter image URL"
                />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
            </button>
        </div>
    );
};

export default ProductVariantsInput;
