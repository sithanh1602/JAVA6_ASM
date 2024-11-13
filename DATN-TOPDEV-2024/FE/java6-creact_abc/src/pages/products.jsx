import React, { useState } from 'react';
import Breadcrumb from '../components/products/Breadcrumb';
import ProductFilter from '../components/products/ProductFilter';
import ProductList from '../components/products/ProductList';
import Pagination from '../components/products/Pagination';

const App = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(8);
    const [view, setView] = useState('grid');
    const [sortOption, setSortOption] = useState('default');
    const totalProducts = 20; // Replace with the actual total number of products

    // Calculate the display range
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const displayRange = `Hiển thị ${indexOfFirstProduct + 1}–${Math.min(indexOfLastProduct, totalProducts)} của ${totalProducts} kết quả`;

    // Handle view change
    const handleViewChange = (view) => {
        setView(view);
    };

    // Handle sort change
    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    // Change page
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
                <ProductFilter />
                <ProductList currentPage={currentPage} productsPerPage={productsPerPage} view={view} sortOption={sortOption} />
            </div>
            <Pagination productsPerPage={productsPerPage} totalProducts={totalProducts} paginate={paginate} currentPage={currentPage} />
        </div>
    );
};

export default App;
