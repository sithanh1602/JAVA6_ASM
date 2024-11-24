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

    const handleEditCategory = (category) => {
        setSelectedCategory(category);  // Set selected category for editing
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Quản lý loại sản phẩm</h1>
            <div className="space-y-6">
                <div>
                    {error && <p className="text-red-600 font-semibold">{error}</p>}
                    <CategoryTable categories={categories} onEditCategory={handleEditCategory}/>
                </div>
            </div>
        </div>
    );
};

export default AdminCategoriesPage;
