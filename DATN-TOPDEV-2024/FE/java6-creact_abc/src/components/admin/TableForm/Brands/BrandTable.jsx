import React from 'react';

const BrandTable = () => {
    const brands = [
        {
            brands_id: 1,
            name: 'Brand A',
            contact_info: 'contact@brandA.com',
            image: 'https://via.placeholder.com/100',
        },
        {
            brands_id: 2,
            name: 'Brand B',
            contact_info: 'contact@brandB.com',
            image: 'https://via.placeholder.com/100',
        },
        // Add more dummy data as needed
    ];

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-end mb-4">
                <button className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg shadow-md">
                    Add Brands
                </button>
            </div>
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
                <thead>
                <tr className="text-left bg-gray-100 text-sm font-semibold text-gray-700">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Contact Info</th>
                    <th className="px-4 py-2">Image</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {brands.map((brand) => (
                    <tr key={brand.brands_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{brand.name}</td>
                        <td className="px-4 py-2">{brand.contact_info}</td>
                        <td className="px-4 py-2">
                            <img src={brand.image} alt={brand.name} className="h-10 w-10 object-cover"/>
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

export default BrandTable;
