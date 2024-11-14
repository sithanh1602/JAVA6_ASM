import React, { useState, useEffect } from 'react';
import CategoryService from '../../../../services/CategoryService';

const CategoryInput = ({ category, onSave = () => {} }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Khi component nhận được category từ prop, nó sẽ set lại formData
    useEffect(() => {
        if (category) {
            setFormData(category);  // Tải dữ liệu của category khi chỉnh sửa
        }
    }, [category]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (category) {
                await CategoryService.updateCategory(category.id, formData);  // Cập nhật category
            } else {
                await CategoryService.createCategory(formData);  // Tạo mới category
            }
            onSave(); // Gọi lại hàm onSave sau khi lưu thành công
        } catch (error) {
            console.error('Lỗi khi thêm hoặc sửa danh mục:', error);
        }
    };

    const handleClear = () => {
        setFormData({
            name: '',
            description: '',
        }); // Xóa form
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-full mx-auto bg-whiterounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    {category ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục'}
                </h2>
                <div className="flex flex-wrap gap-4">
                    {/* Tên danh mục */}
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Tên Danh Mục</label>
                        <input
                            id="name"
                            placeholder="Nhập Tên Danh Mục"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Mô tả */}
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Mô Tả</label>
                        <input
                            id="description"
                            placeholder="Nhập Mô Tả"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Nút */}
                <div className="flex space-x-2 mt-6 justify-start">
                    <button
                        onClick={handleSubmit}
                        className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {category ? 'Lưu Thay Đổi' : 'Thêm Danh Mục'}
                    </button>

                    <button
                        onClick={handleClear} // Xóa form
                        className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Làm mới
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryInput;
