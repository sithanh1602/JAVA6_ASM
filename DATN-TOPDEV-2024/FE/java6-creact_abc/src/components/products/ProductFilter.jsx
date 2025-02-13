import React, { useState } from "react";
import { Checkbox } from "@nextui-org/react";

const ProductFilter = ({ onBrandFilterChange }) => {
    // Dữ liệu cứng
    const brands = [
        { id: 1, name: "GPU" },
        { id: 2, name: "CPU" },
        { id: 3, name: "Mainboard" },
        { id: 4, name: "RAM" },
        { id: 5, name: "SSD" },
    ];

    const categories = [
        { id: 1, name: "Intel" },
        { id: 2, name: "Laptop" },
        { id: 3, name: "Phụ kiện" },
        { id: 4, name: "Máy tính bảng" },
    ];

    const [selectedBrand, setSelectedBrand] = useState(null);

    const handleBrandChange = (brandId) => {
        const newSelectedBrand = selectedBrand === brandId ? null : brandId;
        setSelectedBrand(newSelectedBrand);
        onBrandFilterChange(newSelectedBrand);
    };

    return (
        <div className="col-lg-3 pr-5" data-aos="fade-down">
            <div className="left_sidebar_area p-4 border bg-white shadow-md">
                {/* Bộ lọc Thương Hiệu */}
                <aside className="left_widgets p_filter_widgets mb-6">
                    <div className="l_w_title">
                        <h3 className="text-lg font-semibold">Thương Hiệu</h3>
                    </div>
                    <div className="widgets_inner">
                        {brands.length > 0 ? (
                            brands.map((brand) => (
                                <div key={brand.id} className="py-2">
                                    <Checkbox
                                        isSelected={selectedBrand === brand.id}
                                        onChange={() => handleBrandChange(brand.id)}
                                    >
                                        {brand.name}
                                    </Checkbox>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Không có thương hiệu nào</p>
                        )}
                    </div>
                </aside>

                {/* Bộ lọc Danh Mục */}
                <aside className="left_widgets p_filter_widgets mb-6">
                    <div className="l_w_title">
                        <h3 className="text-lg font-semibold">Danh Mục Sản Phẩm</h3>
                    </div>
                    <div className="widgets_inner">
                        <ul className="list">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <li key={category.id} className="py-2 hover:scale-105 transform transition duration-300">
                                        <a href="#" className="text-gray-700 hover:text-blue-500">
                                            {category.name}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">Không có danh mục nào</li>
                            )}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ProductFilter;