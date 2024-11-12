import React from 'react';

const CategoryTable = () => {
    const categories = [
        {
            id: 1,
            name: 'Electronics',
            description: 'Devices and gadgets',
            image: 'https://example.com/electronics.jpg',
        },
        {
            id: 2,
            name: 'Books',
            description: 'All kinds of books',
            image: 'https://example.com/books.jpg',
        },
        {
            id: 3,
            name: 'Clothing',
            description: 'Apparel for men, women, and children',
            image: 'https://example.com/clothing.jpg',
        },
    ];

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-end mb-4">
                <button className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg shadow-md">
                    Add Categories
                </button>
            </div>
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
                <thead>
                <tr className="text-left bg-gray-100 text-sm font-semibold text-gray-700">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Image</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{category.name}</td>
                        <td className="px-4 py-2">{category.description}</td>
                        <td className="px-4 py-2">
                            <img src={category.image} alt={category.name} className="h-10 w-10 object-cover"/>
                        </td>
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

export default CategoryTable;
