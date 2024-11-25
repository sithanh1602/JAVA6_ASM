import React, { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import BrandInput from './BrandInput';
import BrandService from '../../../../services/BrandService';
import Swal from 'sweetalert2';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Lỗi được bắt bởi ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div className="p-4 text-red-600">Đã xảy ra lỗi. Vui lòng thử làm mới trang.</div>;
        }
        return this.props.children;
    }
}

const BrandTable = forwardRef(({ onEditBrand }, ref) => {
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [brandsPerPage] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const totalPages = Math.ceil(brands.length / brandsPerPage);

    useEffect(() => {
        fetchBrands();
    }, []);

    useImperativeHandle(ref, () => ({
        fetchBrands
    }));

    const fetchBrands = async () => {
        setIsLoading(true);
        try {
            const allBrands = await BrandService.getAllBrands();
            setBrands(allBrands);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải danh sách thương hiệu!',
            });
            console.error('Lỗi khi tải danh sách thương hiệu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBrand = useCallback(() => {
        setSelectedBrand(null);
        setIsModalOpen(true);
    }, []);

    const handleEditBrand = useCallback((brand) => {
        setSelectedBrand(brand);
        setIsModalOpen(true);
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Hành động này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await BrandService.deleteBrand(id);
                Swal.fire('Đã xóa!', 'Thương hiệu đã được xóa.', 'success');
                fetchBrands();
            } catch (error) {
                const message =
                    error.response?.status === 400
                        ? 'Thương hiệu này vẫn còn sản phẩm liên quan. Không thể xóa.'
                        : 'Thương hiệu này vẫn còn sản phẩm liên quan. Không thể xóa.';
                Swal.fire('Lỗi!', message, 'error');
                console.error('Lỗi khi xóa thương hiệu:', error);
            }
        }
    };

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        fetchBrands();
    }, []);

    const indexOfLastBrand = currentPage * brandsPerPage;
    const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;
    const currentBrands = brands.slice(indexOfFirstBrand, indexOfLastBrand);

    const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

    if (isLoading) {
        return (
            <div className="p-4 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                ariaHideApp={false}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                aria-labelledby="modal-title"
            >
                <div className="w-full max-h-[80vh] overflow-y-auto bg-white p-6 rounded-lg">
                    <h2 id="modal-title" className="text-xl font-semibold text-center mb-4">
                        {selectedBrand ? 'Cập nhật thương hiệu' : 'Thêm mới thương hiệu'}
                    </h2>

                    <button
                        onClick={handleModalClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        aria-label="Đóng"
                    >
                        <span className="text-xl">×</span>
                    </button>

                    <BrandInput
                        brand={selectedBrand}
                        onSave={handleModalClose}
                    />
                </div>
            </Modal>

            <div className="flex justify-between items-center mb-4">
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    onClick={handleAddBrand}
                >
                    + Thêm thương hiệu
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-200 px-4 py-2 text-left">Tên thương hiệu</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Thông tin liên hệ</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Hình ảnh</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentBrands.map((brand) => (
                        <tr key={brand.brandsId} className="border-t hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2 text-gray-700">{brand.name}</td>
                            <td className="border border-gray-200 px-4 py-2 text-gray-700">{brand.contactInfo}</td>
                            <td className="border border-gray-200 px-4 py-2">
                                {brand.image ? (
                                    <img
                                        src={brand.image}
                                        alt={`Hình ảnh của ${brand.name}`}
                                        className="h-12 w-12 object-cover rounded"
                                    />
                                ) : (
                                    <span className="text-gray-500">Không có hình ảnh</span>
                                )}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-center">
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                                    onClick={() => handleEditBrand(brand)}
                                >
                                    Sửa
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    onClick={() => handleDelete(brand.brandsId)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <span className="text-gray-600">
                    Hiển thị từ {indexOfFirstBrand + 1} đến {Math.min(indexOfLastBrand, brands.length)} trong tổng số {brands.length} thương hiệu
                </span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                    >
                        Trước
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`px-2 py-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={indexOfLastBrand >= brands.length}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                    >
                        Tiếp
                    </button>
                </div>
            </div>
        </div>
    );
});

BrandTable.propTypes = {
    onEditBrand: PropTypes.func
};

export default function BrandTableWithBoundary(props) {
    return (
        <ErrorBoundary>
            <BrandTable {...props} />
        </ErrorBoundary>
    );
}
