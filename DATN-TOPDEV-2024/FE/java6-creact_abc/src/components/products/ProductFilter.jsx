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
        <div className="col-lg-3 pr-5" data-aos="fade-down">
            <div className="left_sidebar_area p-4 border bg-white shadow-md">
                {/* Brand Filter */}
                <aside className="left_widgets p_filter_widgets mb-6">
                    <div className="l_w_title">
                        <h3 className="text-lg font-semibold">Thương Hiệu</h3>
                    </div>
                    <div className="widgets_inner">
                        <ul className="list ">
                            {brands.length > 0 ? (
                                brands.map((brand) => (
                                    <li key={brand.id} className="py-2 hover:scale-105 transform transition duration-300">
                                        <a href="#" className="text-gray-700 hover:text-blue-500 ">
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
                                    <li key={category.id} className="py-2 hover:scale-105 transform transition duration-300">
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
