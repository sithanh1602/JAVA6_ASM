import React, { useState } from 'react';

const AttributesInput = ({ onAddAttribute }) => {
    const [attributeName, setAttributeName] = useState('Color');
    const [attributeValue, setAttributeValue] = useState('Red');

    const handleAddAttribute = () => {
        if (attributeName && attributeValue) {
            onAddAttribute({ name: attributeName, value: attributeValue });
            setAttributeName('');
            setAttributeValue('');
        } else {
            alert('Please fill out both the attribute name and value.');
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow-md">
            <h3 className="text-xl font-semibold mb-4">Add Attribute</h3>
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Attribute Name"
                    value={attributeName}
                    onChange={(e) => setAttributeName(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Attribute Value"
                    value={attributeValue}
                    onChange={(e) => setAttributeValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <button
                onClick={handleAddAttribute}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
                Add Attribute
            </button>
        </div>
    );
};

export default AttributesInput;
