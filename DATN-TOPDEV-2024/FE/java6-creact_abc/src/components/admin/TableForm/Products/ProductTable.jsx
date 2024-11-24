import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import ProductInput from './ProductInput'; // Ensure this path points to your ProductInput component
import ProductService from '../../../../services/ProductService';
import Swal from 'sweetalert2';
import {FaEdit, FaTrash} from 'react-icons/fa';

const ProductTable = forwardRef((_, ref) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    // Open modal for editing an existing product
    const handleEditProduct = (product) => {
        setSelectedProduct(product); // Set the selected product for editing
        setIsModalOpen(true); // Open modal
    };

    // Delete a product by changing its status to Unavailable
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

    // Close modal after save and refresh product list
    const handleModalClose = () => {
        setIsModalOpen(false); // Close modal
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
    }, [statusFilter, searchName, minPrice, maxPrice, products]);

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
            name: 'Đơn Giá',
            selector: (row) => row.price,
            sortable: true,
            format: (row) => `${row.price.toLocaleString()} VND`,
        },
        {
            name: 'Trạng Thái',
            selector: (row) => row.status,
            cell: (row) => (
                <span
                    className={`px-2 py-1 rounded text-white ${
                        row.status === 'Available' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                >
                    {row.status === 'Available' ? 'Còn hàng' : 'Hết hàng'}
                </span>
            ),
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
                        <FaEdit />
                    </button>
                    <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(row.id, row)}
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

            <div className="flex justify-between items-center mb-4">
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    onClick={handleAddProduct}
                >
                    + Thêm loại sản phẩm
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
                    <option value="Available">Còn hàng</option>
                    <option value="Unavailable">Hết hàng</option>
                </select>
                <input
                    type="number"
                    className="border border-gray-300 px-4 py-2 rounded"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onKeyUp={filterProducts}
                />
                <input
                    type="number"
                    className="border border-gray-300 px-4 py-2 rounded"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onKeyUp={filterProducts}
                />
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
