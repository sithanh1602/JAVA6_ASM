import React from 'react';

const ProductVariantsTable = () => {
    // Hardcoded data to simulate existing product variants
    const variants = [
        {
            id: 1,
            product_id: 1,
            color: 'Black',
            size: 'Large',
            quantity: 50,
            image: 'https://via.placeholder.com/150',
        },
        {
            id: 2,
            product_id: 2,
            color: 'Red',
            size: 'Medium',
            quantity: 30,
            image: 'https://via.placeholder.com/150',
        },
        {
            id: 3,
            product_id: 3,
            color: 'Blue',
            size: 'Small',
            quantity: 20,
            image: 'https://via.placeholder.com/150',
        },
    ];


    return (
        <div className="overflow-x-auto">
            <div className="flex justify-end mb-4">
                <button className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg shadow-md">
                    Add Product Variants
                </button>
            </div>
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
                <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-2">Color</th>
                    <th className="px-4 py-2">Size</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Image</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {variants.map((variant) => (
                    <tr key={variant.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{variant.color}</td>
                        <td className="px-4 py-2">{variant.size}</td>
                        <td className="px-4 py-2">{variant.quantity}</td>
                        <td className="px-4 py-2">
                            <img src={variant.image} alt="variant" className="w-16 h-16 object-cover"/>
                        </td>
                        <td className="px-4 py-2 flex space-x-4">
                            <button
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Edit
                            </button>
                            <button
                                className="text-red-600 hover:text-red-800"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductVariantsTable;
