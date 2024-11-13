import React, { useEffect, useState } from 'react';
import BrandService from "../../services/BrandService";
import CategoryService from "../../services/CategoryService";

const ProductFilter = () => {
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([0, 1000]); // Default price range from 0 to 1000

    useEffect(() => {
        // Fetch brands from the API
        const fetchBrands = async () => {
            try {
                const fetchedBrands = await BrandService.getAllBrands();
                setBrands(fetchedBrands);
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };

        // Fetch categories from the API
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await CategoryService.getAllCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchBrands();
        fetchCategories();
    }, []);

    return (
        <div className="col-lg-3 pr-5">
            <div className="left_sidebar_area">
                {/* Product Search and Price Range */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                    />
                    {/* Price Range Filter */}
                    <div className="flex justify-between items-center text-sm mb-4">
                        <span>From: {priceRange[0]}</span>
                        <span>To: {priceRange[1]}</span>
                    </div>
                    <div className="mb-4">
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-full h-2 bg-gray-200 rounded-md"
                        />
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full h-2 bg-gray-200 rounded-md mt-2"
                        />
                    </div>
                </div>

                {/* Brand Filter */}
                <aside className="left_widgets p_filter_widgets mb-6">
                    <div className="l_w_title">
                        <h3 className="text-lg font-semibold">Thương Hiệu</h3>
                    </div>
                    <div className="widgets_inner">
                        <ul className="list">
                            {brands.length > 0 ? (
                                brands.map((brand) => (
                                    <li key={brand.id} className="py-2">
                                        <a href="#" className="text-gray-700 hover:text-blue-500">
                                            {brand.name}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">No brands available</li>
                            )}
                        </ul>
                    </div>
                </aside>

                {/* Category Filter */}
                <aside className="left_widgets p_filter_widgets mb-6">
                    <div className="l_w_title">
                        <h3 className="text-lg font-semibold">Danh Mục Sản Phẩm</h3>
                    </div>
                    <div className="widgets_inner">
                        <ul className="list">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <li key={category.id} className="py-2">
                                        <a href="#" className="text-gray-700 hover:text-blue-500">
                                            {category.name}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">No categories available</li>
                            )}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ProductFilter;
