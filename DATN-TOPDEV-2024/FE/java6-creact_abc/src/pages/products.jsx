import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/products/Breadcrumb';
import ProductFilter from '../components/products/ProductFilter';
import ProductList from '../components/products/ProductList';
import Pagination from '../components/products/Pagination';
import ProductService from '../services/ProductService';

const App = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const [view, setView] = useState('grid');
    const [sortOption, setSortOption] = useState('default');
    const [selectedBrand, setSelectedBrand] = useState(null); // Chỉ chọn 1 thương hiệu
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await ProductService.getAllProducts();
                setProducts(fetchedProducts);
                setTotalProducts(fetchedProducts.length);
            } catch (error) {
                console.error("Lỗi khi lấy sản phẩm:", error);
            }
        };
        fetchProducts();
    }, []);

    // Tính toán phạm vi hiển thị
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const displayRange = `Hiển thị ${indexOfFirstProduct + 1}–${Math.min(indexOfLastProduct, totalProducts)} của ${totalProducts} kết quả`;

    // Xử lý khi chọn một thương hiệu
    const handleBrandFilterChange = (brand) => {
        setSelectedBrand(brand);
        setCurrentPage(1); // Reset về trang đầu tiên khi lọc
    };

    // Xử lý thay đổi chế độ xem
    const handleViewChange = (view) => {
        setView(view);
    };

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    // Xử lý phân trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <Breadcrumb />
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{displayRange}</span>
                    <button
                        className={`p-2 border rounded ${view === 'grid' ? 'bg-gray-300' : ''}`}
                        onClick={() => handleViewChange('grid')}
                    >
                        <i className="fas fa-th"></i>
                    </button>
                    <button
                        className={`p-2 border rounded ${view === 'list' ? 'bg-gray-300' : ''}`}
                        onClick={() => handleViewChange('list')}
                    >
                        <i className="fas fa-list"></i>
                    </button>
                    <select
                        className="p-2 border rounded"
                        value={sortOption}
                        onChange={handleSortChange}
                    >
                        <option value="default">Thứ tự mặc định</option>
                        <option value="priceAsc">Giá tăng dần</option>
                        <option value="priceDesc">Giá giảm dần</option>
                    </select>
                </div>
            </div>
            <div className="flex">
                {/* Truyền selectedBrand vào ProductFilter */}
                {/*<ProductFilter selectedBrand={selectedBrand} onBrandFilterChange={handleBrandFilterChange} />*/}
                <ProductList
                    currentPage={currentPage}
                    productsPerPage={productsPerPage}
                    view={view}
                    sortOption={sortOption}
                    selectedBrand={selectedBrand} // Truyền thương hiệu đã chọn vào ProductList
                    products={products} // Truyền danh sách sản phẩm vào ProductList
                />
            </div>
            <Pagination
                productsPerPage={productsPerPage}
                totalProducts={totalProducts}
                paginate={paginate}
                currentPage={currentPage}
            />
        </div>
    );
};

export default App;
