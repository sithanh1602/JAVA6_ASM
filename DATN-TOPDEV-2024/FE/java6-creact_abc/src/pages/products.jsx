import React from 'react';
import Breadcrumb from '../components/products/Breadcrumb';
import ProductFilter from '../components/products/ProductFilter';
import ProductList from '../components/products/ProductList';
import Pagination from '../components/products/Pagination';

const App = () => (
    <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
            <Breadcrumb />
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hiển thị 1–12 của 20 kết quả</span>
                <button className="p-2 border rounded"><i className="fas fa-th"></i></button>
                <button className="p-2 border rounded"><i className="fas fa-list"></i></button>
                <select className="p-2 border rounded">
                    <option>Thứ tự mặc định</option>
                </select>
            </div>
        </div>
        <div className="flex">
            <ProductFilter />
            <ProductList />
        </div>
        <Pagination />
    </div>
);

export default App;
