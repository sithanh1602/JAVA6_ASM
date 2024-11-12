import React, { useState } from 'react';

const PopularTabs = ({ categories, onSelectCategory }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (index, category) => {
        setActiveTab(index);
        onSelectCategory(category);
    };

    return (
        <div className="flex justify-between items-center border-b pb-2">
            {/* Bên trái: Danh mục chính */}
            <div className="text-lg font-semibold text-orange-500">
                Sản Phẩm <span className="text-gray-800">Phổ biến</span>
            </div>

            {/* Bên phải: Danh mục sản phẩm */}
            <div className="flex space-x-8">
                {categories.map((category, index) => (
                    <button
                        key={category}
                        onClick={() => handleTabClick(index, category)}
                        className={`relative text-lg font-medium ${
                            activeTab === index
                                ? 'text-orange-500'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        {category}
                        {activeTab === index && (
                            <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange-500"></span>
                        )}
                    </button>
                ))}
            </div>
        </div>


    );
};

export default PopularTabs;