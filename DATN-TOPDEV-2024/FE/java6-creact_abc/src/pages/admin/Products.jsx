import React, { useRef } from 'react';
import ProductTable from '../../components/admin/TableForm/Products/ProductTable';

const AdminProductsPage = () => {
    const productTableRef = useRef();


    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h1>
            <ProductTable ref={productTableRef}/>
        </div>
    );
};

export default AdminProductsPage;
