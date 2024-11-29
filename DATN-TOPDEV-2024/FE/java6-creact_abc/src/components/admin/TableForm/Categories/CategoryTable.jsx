import React, { useState, useEffect } from 'react';
import CategoryInput from "./CategoryInput";
import CategoryService from "../../../../services/CategoryService";
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import {FaEdit, FaTrash} from 'react-icons/fa';

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search term

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
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    const handleDelete = async (categoryId) => {
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
                await CategoryService.deleteCategory(categoryId);
                setCategories(categories.filter((category) => category.id !== categoryId));

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Danh mục đã được xóa.',
                    confirmButtonText: 'Đóng'
                });
            } catch (err) {
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
            const data = await CategoryService.getAllCategories();
            setCategories(data);

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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) // Filter categories by name
    );

    const columns = [
        {
            name: 'Tên loại sản phẩm',
            selector: row => row.name,
            sortable: true,

        },
        {
            name: 'Ghi chú',
            selector: row => row.description,
            sortable: true,
        },
        {
            name: 'Ảnh',
            cell: row => <img src={row.image} alt={row.name} className="w-16 h-16 object-cover" />,
            sortable: false,
        },
        {
            name: 'Hành động',
            cell: row => (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => openModal(row)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
            // ignoreRowClick: true,
            // allowOverflow: true,
            // button: true,
        }
    ];

    const tableData = filteredCategories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
    }));

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="p-4 bg-white">
            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-out">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">
                                {selectedCategory ? 'Chỉnh Sửa Loại Sản Phẩm' : 'Thêm Loại Sản Phẩm'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">&times;</button>
                        </div>
                        <CategoryInput category={selectedCategory} onSave={handleCategoryChange}/>
                    </div>
                </div>
            )}

            {/* Button mở modal */}
            <div className=" mb-4">
                <button onClick={() => openModal()}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    + Thêm loại sản phẩm
                </button>
            </div>
            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-4/4 border px-2 py-2 rounded-md mt-2"
                />
            </div>
            <DataTable
                columns={columns}
                data={tableData}
                pagination
                highlightOnHover
                responsive
                subHeader
                noDataComponent={<div>Không có thương hiệu nào</div>}
            />
        </div>
    );
};

export default CategoryTable;
