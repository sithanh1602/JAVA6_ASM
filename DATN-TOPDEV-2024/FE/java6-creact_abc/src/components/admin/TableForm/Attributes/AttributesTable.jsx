import React from 'react';

const AttributesTable = () => {
    const hardcodedAttributes = [
        { id: 1, name: 'Color', value: 'Red' },
        { id: 2, name: 'Size', value: 'Medium' },
        { id: 3, name: 'Material', value: 'Cotton' }
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold">Attributes List</h3>
                <button className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-5 rounded-lg shadow-lg transition-all duration-300">
                    Add Attribute
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                    <tr className="bg-gray-200 text-gray-700">
                        <th className="border-b px-4 py-3">Name</th>
                        <th className="border-b px-4 py-3">Value</th>
                        <th className="border-b px-4 py-3">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {hardcodedAttributes.length > 0 ? (
                        hardcodedAttributes.map((attr) => (
                            <tr key={attr.id} className="border-b last:border-none odd:bg-white even:bg-gray-50">
                                <td className="px-4 py-3">{attr.name}</td>
                                <td className="px-4 py-3">{attr.value}</td>
                                <td className="px-4 py-3 flex space-x-3">
                                    {/* Edit Button */}
                                    <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                        Edit
                                    </button>
                                    {/* Delete Button */}
                                    <button className="text-red-600 hover:text-red-800 font-medium transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="px-4 py-3 text-center text-gray-500">
                                No attributes available
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttributesTable;
