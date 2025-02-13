import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import ProductInput from './ProductInput'; // Ensure this path points to your ProductInput component
import ProductVariantsInput from "./ProductsVariantsInput";
import ProductService from '../../../../services/ProductService';
import Swal from 'sweetalert2';
import {FaEdit, FaTrash} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import axios from "axios";


const ProductTable = forwardRef((_, ref) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenVariants, setIsModalOpenVariants] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    useImperativeHandle(ref, () => ({
        fetchProducts,
    }));

    // Fetch products from the service
    const fetchProducts = async () => {
        try {
            const allProducts = await ProductService.getAllProducts();
            const validProducts = allProducts.filter(product => product.name); // Filter out products with null or undefined names
            setProducts(validProducts);
            setFilteredProducts(validProducts); // Set filtered products initially to all products
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch products!',
            });
            console.error('Error fetching products:', error);
        }
    };

    // Open modal for adding a product
    const handleAddProduct = () => {
        setSelectedProduct(null); // Clear selection for new product
        setIsModalOpen(true); // Open modal
    };

    const handleAddProductVariants = () => {
        setSelectedProduct(null); // Clear selection for new product
        setIsModalOpenVariants(true); // Open modal
    };

    // Open modal for editing an existing product
    const handleEditProduct = (product) => {
        setSelectedProduct(product); // Set the selected product for editing
        setIsModalOpen(true); // Open modal
    };

    // Toggle product status between Available and Unavailable
    const handleDelete = async (id, currentProductDetails) => {
        try {
            const updatedProductDetails = {
                ...currentProductDetails,
                stock: currentProductDetails.stock, // Dữ liệu stock hiện tại
                status: currentProductDetails.stock === 0 ? 'Out of Stock' : currentProductDetails.status === 'Unavailable' ? 'Available' : 'Unavailable',
            };

            await ProductService.updateProduct(id, updatedProductDetails);

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Trạng thái sản phẩm được cập nhật thành ${updatedProductDetails.status}!`,
            });

            fetchProducts(); // Refresh product list
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update product status!',
            });
            console.error('Lỗi cập nhật trạng thái sản phẩm:', error);
        }
    };

    // Close modal after save and refresh product list
    const handleModalClose = () => {
        setIsModalOpen(false); // Close modal
        fetchProducts(); // Refresh product list after save
    };

    const handleModalCloseVariants = () => {
        setIsModalOpenVariants(false); // Close modal
        fetchProducts(); // Refresh product list after save
    };

    // Filter products based on search criteria
    const filterProducts = () => {
        const filtered = products.filter((product) => {
            const nameMatch = product.name && product.name.toLowerCase().includes(searchName.toLowerCase());
            const statusMatch = statusFilter ? product.status === statusFilter : true;
            const priceMatch = (minPrice && maxPrice)
                ? product.price >= minPrice && product.price <= maxPrice
                : true;

            return nameMatch && statusMatch && priceMatch;
        });

        setFilteredProducts(filtered);
    };

    // Trigger filtering whenever the filters change
    useEffect(() => {
        filterProducts();
    }, [statusFilter, searchName, products]);

    // Define columns for React Data Table Component
    const columns = [
        {
            name: 'Tên sản phẩm',
            selector: (row) => row.name || '', // Fallback to empty string if product.name is null
            sortable: true,
        },
        {
            name: 'Ghi chú',
            selector: (row) => row.description || '', // Fallback to empty string if product.description is null
            sortable: true,
        },
        {
            name: 'Tồn kho',
            selector: (row) => row.stock,
            sortable: true,
        },
        {
            name: 'Trạng Thái',
            selector: (row) => row.status,
            cell: (row) => {
                const isOutOfStock = row.stock === 0;
                const statusDisplay = isOutOfStock ? 'Hết hàng' : row.status === 'Available' ? 'Còn hoạt động' : 'Hết hoạt động';
                return (
                    <span
                        className={`px-2 py-1 rounded text-white ${
                            isOutOfStock ? 'bg-red-500' : row.status === 'Available' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                    >
                    {statusDisplay}
                </span>
                );
            },
        },

        {
            name: 'Ảnh',
            selector: (row) => row.imageUrl,
            cell: (row) => (
                row.imageUrl ? (
                    <img
                        src={row.imageUrl}
                        alt={row.name}
                        className="h-12 w-12 object-cover rounded"
                    />
                ) : (
                    <span className="text-gray-500">No image</span>
                )
            ),
        },
        {
            name: 'Hành động',
            cell: (row) => (
                <div className="flex space-x-2">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => handleEditProduct(row)}
                    >
                        <FaEdit/>
                    </button>
                    <button
                        className={`px-2 py-1 rounded ${
                            row.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        onClick={() => row.stock !== 0 && handleDelete(row.id, row)}
                        disabled={row.stock === 0}
                    >
                        <FiRefreshCw/>
                    </button>
                    <button
                        className={`px-2 py-1 rounded bg-orange-600`}
                        onClick={handleAddProductVariants}
                    > Tạo biến thể
                    </button>
                </div>
            ),
        },
    ];

    const exportToExcel = async () => {
        try {
            // Tạo worksheet từ dữ liệu bảng
            const worksheet = XLSX.utils.json_to_sheet(filteredProducts);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

            // Chuyển workbook thành buffer
            const excelBuffer = XLSX.write(workbook, {bookType: 'xlsx', type: 'array' });

            // Chuyển buffer thành Blob
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

            // Tạo FormData để gửi file
            const formData = new FormData();
            formData.append('file', new File([blob], 'products.xlsx'));

            // Gửi file lên backend qua API
            await axios.post('http://localhost:8080/api/templates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Để tải vui lòng vào mục Drive Excel!',
            });
        } catch (error) {
            console.error('Lỗi khi lưu file:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể lưu file vào cơ sở dữ liệu!',
            });
        }
    };

    return (
        <div className="p-4 bg-white">
            {/* Modal Component */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                ariaHideApp={false}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl transition-opacity duration-300 ease-out"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <div className="h-full w-full bg-white p-6 rounded-lg flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            {selectedProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                        </h2>
                        <button
                            onClick={handleModalClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>
                    <ProductInput product={selectedProduct} onSave={handleModalClose} />
                </div>
            </Modal>

            {/* Modal Component */}
            <Modal
                isOpen={isModalOpenVariants}
                onRequestClose={handleModalClose}
                ariaHideApp={false}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl transition-opacity duration-300 ease-out"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <div className="h-full w-full bg-white p-6 rounded-lg flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                           Thêm Biến thể
                        </h2>
                        <button
                            onClick={handleModalCloseVariants}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>
                    <ProductVariantsInput product={selectedProduct} onSave={handleModalCloseVariants} />
                </div>
            </Modal>

            <div className="flex justify-between items-center mb-4">
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    onClick={handleAddProduct}
                >
                    + Thêm loại sản phẩm
                </button>

                {/* Nút Xuất Excel */}
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={exportToExcel}
                >
                    Xuất Excel
                </button>
            </div>

            <div className="mb-4 flex space-x-2">
                <input
                    type="text"
                    className="border border-gray-300 px-4 py-2 rounded"
                    placeholder="Tìm kiếm theo tên..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyUp={filterProducts}
                />
                <select
                    className="border border-gray-300 px-4 py-2 rounded"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Trạng thái</option>
                    <option value="Available">Còn Hoạt Động</option>
                    <option value="Unavailable">Hết Hoạt Động</option>
                    <option value="Out of Stock">Hết hàng</option>
                </select>
            </div>

            <DataTable
                title="Danh sách sản phẩm"
                columns={columns}
                data={filteredProducts} // Render filtered data
                pagination
                highlightOnHover
                responsive
            />
        </div>
    );
});

export default ProductTable;
