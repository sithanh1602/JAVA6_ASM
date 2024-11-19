import React, { useState, useEffect } from 'react';
import CategoryService from '../../services/CategoryService';
import CategoryTable from '../../components/admin/TableForm/Categories/CategoryTable';

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);  // Track selected category for editing

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await CategoryService.getAllCategories();
            setCategories(data.filter(category => !category.deleted));  // Filter out soft-deleted categories
        } catch (error) {
            setError('Failed to fetch categories');
            console.error(error);
        }
    };

    const handleAddCategory = () => {
        setSelectedCategory(null);  // Clear selected category for adding new category
    };

    const handleEditCategory = (category) => {
        setSelectedCategory(category);  // Set selected category for editing
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-lg space-y-6">
            <div className="space-y-6">
                {/* Category Input Form (below the table) */}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Category Management</h2>
                    <button
                        onClick={handleAddCategory}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Add Category
                    </button>
                </div>
                {/* Category Table (top part of the page) */}
                <div>
                    {error && <p className="text-red-600 font-semibold">{error}</p>}
                    <CategoryTable categories={categories} onEditCategory={handleEditCategory} />
                </div>
            </div>
        </div>
    );
};

export default AdminCategoriesPage;
