import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Modal from 'react-modal';
import ProductInput from './ProductInput'; // Ensure this path points to your ProductInput component
import ProductService from '../../../../services/ProductService';
import Swal from 'sweetalert2';

const ProductTable = forwardRef(({ onEditProduct }, ref) => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const totalPages = Math.ceil(products.length / productsPerPage);


    useEffect(() => {
        fetchProducts();
    }, []);

    useImperativeHandle(ref, () => ({
        fetchProducts
    }));

    const fetchProducts = async () => {
        try {
            const allProducts = await ProductService.getAllProducts();
            setProducts(allProducts);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch products!'
            });
            console.error('Error fetching products:', error);
        }
    };

    const handleAddProduct = () => {
        setSelectedProduct(null); // Clear selection for new product
        setIsModalOpen(true); // Open modal
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product); // Set the selected product for editing
        setIsModalOpen(true); // Open modal
    };

    const handleDelete = async (id, currentProductDetails) => {
        try {
            const updatedProductDetails = { ...currentProductDetails, status: 'Unavailable' };
            await ProductService.updateProduct(id, updatedProductDetails);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Product status updated to Unavailable!',
            });
            fetchProducts(); // Refresh the product list
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update product status!',
            });
            console.error('Error updating product status:', error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false); // Close modal
        fetchProducts(); // Refresh product list after save
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            {/* Modal Component */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                ariaHideApp={false}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                style={{
                    content: {
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        padding: '0',
                        border: 'none',
                        background: 'transparent',
                        overflow: 'visible'
                    }
                }}
            >
                <div className="w-full max-h-[80vh] overflow-y-auto bg-white p-6 rounded-lg">
                    {/* Tiêu đề */}
                    <h2 className="text-xl font-semibold text-center mb-4">
                        {selectedProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>

                    {/* Nút đóng */}
                    <button
                        onClick={handleModalClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        aria-label="Close modal"
                    >
                        <span className="text-xl">×</span>
                    </button>
    
                    {/* Form ProductInput */}
                    <ProductInput
                        product={selectedProduct}
                        onSave={handleModalClose}
                    />
                </div>
            </Modal>


            <div className="flex justify-between items-center mb-4">
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    onClick={handleAddProduct} // Open modal to add new product
                >
                    + Thêm loại sản phẩm
                </button>
                {/* Other Action Buttons */}
                {/*<div className="flex gap-2">*/}
                {/*    <button className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500">Tải từ file</button>*/}
                {/*    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">In dữ liệu</button>*/}
                {/*    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Xuất Excel</button>*/}
                {/*    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Xuất PDF</button>*/}
                {/*    <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Xóa tất cả</button>*/}
                {/*</div>*/}
            </div>

            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-4 py-2 text-left">Tên sản phẩm</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Ghi chú</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Tồn kho</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Đơn Giá</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Trạng Thái</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Ảnh</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {currentProducts.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2 text-gray-700">{product.name}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-700">{product.description}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-700">{product.stock}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-700">{product.price}</td>
                        <td className="border border-gray-200 px-4 py-2">
                                <span
                                    className={`px-2 py-1 rounded text-white ${
                                        product.status === 'Available' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                >
                                    {product.status === 'Available' ? 'Còn hàng' : 'Hết hàng'}
                                </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-12 w-12 object-cover rounded"
                                />
                            ) : (
                                <span className="text-gray-500">No image</span>
                            )}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                                onClick={() => handleEditProduct(product)}
                            >
                                Chỉnh sửa
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={() => handleDelete(product.id, product)}
                            >
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center">
    <span className="text-gray-600">
        Hiển thị {indexOfFirstProduct + 1} đến {Math.min(indexOfLastProduct, products.length)} của {products.length} danh mục
    </span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                    >
                        Lùi
                    </button>
                    {totalPages <= 3 ? (
                        // Hiển thị tất cả các nút nếu totalPages nhỏ hơn hoặc bằng 3
                        Array.from({length: totalPages}, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => paginate(index + 1)}
                                className={`px-2 py-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                            >
                                {index + 1}
                            </button>
                        ))
                    ) : (
                        // Hiển thị tối đa 3 nút và dấu "..."
                        <>
                            <button
                                onClick={() => paginate(1)}
                                className={`px-2 py-1 ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                            >
                                1
                            </button>
                            {currentPage > 2 && <span className="px-2">...</span>}
                            {currentPage > 1 && currentPage < totalPages && (
                                <button
                                    onClick={() => paginate(currentPage)}
                                    className="px-2 py-1 bg-blue-500 text-white rounded"
                                >
                                    {currentPage}
                                </button>
                            )}
                            {currentPage < totalPages - 1 && <span className="px-2">...</span>}
                            <button
                                onClick={() => paginate(totalPages)}
                                className={`px-2 py-1 ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={indexOfLastProduct >= products.length}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                    >
                        Tiếp
                    </button>
                </div>
            </div>


        </div>
    );
});

export default ProductTable;
