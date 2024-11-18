import React, { useEffect, useState } from 'react';
import Tabs from './Tabs';
import ProductsSlider from './ProductsSlider';
import axios from 'axios';

const CategoryTabs = () => {
    const [categories, setCategories] = useState([]); // List of categories
    const [selectedCategory, setSelectedCategory] = useState(null); // Selected category
    const [products, setProducts] = useState([]); // List of products
    const [error, setError] = useState(null); // Error state

    // Fetch categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories');
                setCategories(response.data);
                if (response.data.length > 0) {
                    setSelectedCategory(response.data[0].name); // Select the first category
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to fetch categories');
            }
        };

        fetchCategories();
    }, []);

    // Fetch products based on selected category
    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedCategory) return;

            try {
                const response = await axios.get(`/api/categories/${selectedCategory}/products`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to fetch products');
            }
        };

        fetchProducts();
    }, [selectedCategory]);

    return (
        <div className="p-6">
            <div className="items-center justify-center">
                <div className="w-full max-w-7xl mx-auto">
                    {error && <div className="error">{error}</div>}
                    <Tabs categories={categories} onSelectCategory={setSelectedCategory} />
                    <ProductsSlider products={products} />
                </div>
            </div>
        </div>
    );
};

export default CategoryTabs;