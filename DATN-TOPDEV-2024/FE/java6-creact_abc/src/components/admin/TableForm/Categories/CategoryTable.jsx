import React, { useState, useEffect } from 'react';
import CategoryInput from "./CategoryInput";
import CategoryService from "../../../../services/CategoryService";
import Swal from 'sweetalert2';

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await CategoryService.getAllCategories();
                setCategories(data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh mục');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const openModal = (category = null) => {
        setSelectedCategory(category); // Set category data for editing
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null); // Reset selected category when closing
    };

    const handleDelete = async (categoryId) => {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Bạn sẽ không thể khôi phục danh mục này!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await CategoryService.deleteCategory(categoryId); // Delete category from the backend
                setCategories(categories.filter((category) => category.id !== categoryId)); // Update local state

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Danh mục đã được xóa.',
                    confirmButtonText: 'Đóng'
                });
            } catch (err) {
                // Show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể xóa danh mục. Vui lòng thử lại.',
                    confirmButtonText: 'Đóng'
                });
            }
        }
    };

    const handleCategoryChange = async () => {
        try {
            // Re-fetch categories after an update (add/edit)
            const data = await CategoryService.getAllCategories();
            setCategories(data);

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: selectedCategory ? 'Danh mục đã được cập nhật.' : 'Danh mục đã được thêm mới.',
                confirmButtonText: 'Đóng'
            });
        } catch (err) {
            setError('Không thể tải danh mục');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="p-2">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-out">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fadeIn">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">
                                {selectedCategory ? 'Chỉnh Sửa Loại Sản Phẩm' : 'Thêm Loại Sản Phẩm'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">&times;</button>
                        </div>
                        <CategoryInput category={selectedCategory} onSave={handleCategoryChange} />
                    </div>
                </div>
            )}

            {/* Button mở modal */}
            <div className="flex justify-start ml-0">
                <button onClick={() => openModal()} className="bg-fuchsia-800 text-white px-4 py-2 rounded">
                    + Thêm loại sản phẩm
                </button>
            </div>

            <div className="flex space-x-2 mb-4 mt-4">
                <button className="bg-yellow-500 text-white px-4 py-2 rounded">Tải từ file</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded">In dữ liệu</button>
                <button className="bg-purple-500 text-white px-4 py-2 rounded">Sao chép</button>
                <button className="bg-green-700 text-white px-4 py-2 rounded">Xuất Excel</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded">Xuất PDF</button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded">Xóa tất cả</button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <label>Hiện</label>
                    <select className="border rounded px-2 py-1">
                        <option>10</option>
                        <option>20</option>
                        <option>30</option>
                    </select>
                    <label>danh mục</label>
                </div>
                <div>
                    <input type="text" placeholder="Tìm kiếm..." className="border rounded px-2 py-1" />
                </div>
            </div>

            <table className="min-w-full bg-white border">
                <thead>
                <tr>
                    <th className="border px-4 py-2">Tên loại sản phẩm</th>
                    <th className="border px-4 py-2">Ghi chú</th>
                    <th className="border px-4 py-2">Ảnh</th>
                    <th className="border px-4 py-2">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((category) => (
                    <tr key={category.id}>
                        <td className="border px-4 py-2">{category.name}</td>
                        <td className="border px-4 py-2">{category.description}</td>
                        <td className="border px-4 py-2">
                            <img src={category.image} alt={category.name} className="w-16 h-16 object-cover" />
                        </td>
                        <td className="border px-4 py-2">
                            <button
                                onClick={() => openModal(category)} // Edit category
                                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Chỉnh sửa
                            </button>
                            <button
                                onClick={() => handleDelete(category.id)} // Delete category
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
                <div>Hiển thị 1 đến {categories.length} của {categories.length} danh mục</div>
                <div className="flex space-x-2">
                    <button className="bg-gray-300 text-black px-2 py-1 rounded">Lùi</button>
                    <button className="bg-blue-500 text-white px-2 py-1 rounded">1</button>
                    <button className="bg-gray-300 text-black px-2 py-1 rounded">Tiếp</button>
                </div>
            </div>
        </div>
    );
};

export default CategoryTable;
