import React from 'react';
import {Link} from "react-router-dom";

const ProductTable = () => {
    const products = [
        {
            id: 1,
            name: 'Product A',
            description: 'Description of Product A',
            stock: 50,
            image_url: 'https://example.com/imageA.jpg',
            created_at: '2024-01-01 12:00:00',
        },
        {
            id: 2,
            name: 'Product B',
            description: 'Description of Product B',
            stock: 30,
            image_url: 'https://example.com/imageB.jpg',
            created_at: '2024-02-15 09:30:00',
        },
        // Add more product data as needed
    ];

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-end mb-4">
                <button className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg shadow-md">
                    <Link to="/admin/prdInput">Product</Link>
                </button>
            </div>
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
                <thead>
                <tr className="text-left bg-gray-100 text-sm font-semibold text-gray-700">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Stock</th>
                    <th className="px-4 py-2">Image URL</th>
                    <th className="px-4 py-2">Created At</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{product.name}</td>
                        <td className="px-4 py-2">{product.description}</td>
                        <td className="px-4 py-2">{product.stock}</td>
                        <td className="px-4 py-2">
                            <a href={product.image_url} target="_blank" rel="noopener noreferrer"
                               className="text-blue-500">
                                View Image
                            </a>
                        </td>
                        <td className="px-4 py-2">{product.created_at}</td>
                        <td className="px-4 py-2 flex space-x-4">
                            {/* Nút Sửa */}
                            <button className="text-blue-600 hover:text-blue-800">Edit</button>
                            {/* Nút Xóa */}
                            <button className="text-red-600 hover:text-red-800">Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
