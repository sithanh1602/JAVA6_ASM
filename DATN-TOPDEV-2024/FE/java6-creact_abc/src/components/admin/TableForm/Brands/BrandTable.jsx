import React, { useEffect, useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import BrandInput from './BrandInput';
import BrandService from '../../../../services/BrandService';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BrandTable = () => {
    const [brands, setBrands] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setIsLoading(true);
            const data = await BrandService.getAllBrands();
            setBrands(data);
            console.log(data);
        } catch (error) {
            Swal.fire('Lỗi', 'Không thể tải danh sách thương hiệu!', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBrand = () => {
        setSelectedBrand(null);
        setIsModalOpen(true);
    };

    const handleEditBrand = (brand) => {
        setSelectedBrand(brand);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleDelete = async (brandsId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Hành động này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await BrandService.deleteBrand(brandsId);
                console.log(brandsId)
                fetchBrands();
                Swal.fire('Thành công!', 'Thương hiệu đã được xóa.', 'success');
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể xóa thương hiệu.Vì đã tồn tại sản phẩm trong đó!', 'error');
            }
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchBrands();
    };

    const filteredBrands = useMemo(
        () =>
            brands.filter((brand) =>
                brand.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [brands, searchTerm]
    );

    const columns = [
        {
            name: 'Tên thương hiệu',
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: 'Thông tin liên hệ',
            selector: (row) => row.contactInfo,
            sortable: true,
        },
        {
            name: 'Hình ảnh',
            cell: (row) => (
                <img
                    src={row.image || 'https://via.placeholder.com/64'} // Placeholder nếu không có ảnh
                    alt={row.name}
                    className="w-16 h-16 object-cover rounded"
                />
            ),
            sortable: false,
        },
        {
            name: 'Hành động',
            cell: (row) => (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => handleEditBrand(row)}
                        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => handleDelete(row.brandsId)}
                        className="bg-red-500 text-white px-4 py-2 rounded flex items-center"
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];
    return (
        <div className="p-4 bg-white">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                {selectedBrand ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                &times;
                            </button>
                        </div>
                        <BrandInput brand={selectedBrand} onSave={handleSave}/>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="mb-4">
                <button
                    onClick={handleAddBrand}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                    + Thêm thương hiệu
                </button>
                <div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm thương hiệu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className=" border px-4 py-2 rounded-md mt-4"
                    />
                </div>

            </div>

            {/* DataTable */}
            <DataTable
                columns={columns}
                data={filteredBrands}
                pagination
                highlightOnHover
                progressPending={isLoading}
                noDataComponent={<div>Không có thương hiệu nào</div>}
            />
        </div>
    );
};

export default BrandTable;
