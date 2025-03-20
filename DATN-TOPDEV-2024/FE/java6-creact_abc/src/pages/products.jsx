import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/products/Breadcrumb';
import ProductFilter from '../components/products/ProductFilter';
import ProductList from '../components/products/ProductList';
import PaginationComponent from '../components/products/Pagination'; 
import ProductVariantService from '../services/ProductVariantService';

const App = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(20);
    const [view, setView] = useState('grid');
    const [sortOption, setSortOption] = useState('default');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [productVariants, setProductVariants] = useState([]);
    const [totalVariants, setTotalVariants] = useState(0);

    useEffect(() => {
        const fetchProductVariants = async () => {
            try {
                const fetchedVariants = await ProductVariantService.getAllProductVariants();
                setProductVariants(fetchedVariants);
                setTotalVariants(fetchedVariants.length);
            } catch (error) {
                console.error("Lỗi khi lấy biến thể sản phẩm:", error);
            }
        };
        fetchProductVariants();
    }, []);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const displayRange = `Hiển thị ${indexOfFirstProduct + 1}–${Math.min(indexOfLastProduct, totalVariants)} của ${totalVariants} kết quả`;

    const handleBrandFilterChange = (brand) => {
        setSelectedBrand(brand);
        setCurrentPage(1);
    };

    const handleViewChange = (view) => {
        setView(view);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const filteredVariants = selectedBrand
        ? productVariants.filter((variant) => {
            return variant.product && variant.product.brand === selectedBrand;
          })
        : productVariants;

    const sortedVariants = [...filteredVariants].sort((a, b) => {
        switch (sortOption) {
            case 'priceAsc':
                return a.price - b.price;
            case 'priceDesc':
                return b.price - a.price;
            default:
                return 0;
        }
    });

    const currentVariants = sortedVariants.slice(indexOfFirstProduct, indexOfLastProduct);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
            <Breadcrumb/>
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
                <ProductList
                    currentPage={currentPage}
                    productsPerPage={productsPerPage}
                    view={view}
                    sortOption={sortOption}
                    selectedBrand={selectedBrand}
                    products={currentVariants}
                />
            </div>
            <PaginationComponent
                productsPerPage={productsPerPage}
                totalProducts={totalVariants}
                paginate={paginate}
                currentPage={currentPage}
            />
        </div>
    );
};

export default App;
