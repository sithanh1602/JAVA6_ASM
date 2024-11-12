import React from 'react';

const ProductFilter = () => (
    <div className="w-1/4 p-4 bg-white rounded shadow">
        <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Tìm Kiếm</h2>
            <input type="text" className="w-full p-2 border rounded" placeholder="Tìm kiếm..." />
        </div>
        <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Lọc Theo Giá</h2>
            <input type="range" min="0" max="20000000" className="w-full" />
            <div className="flex justify-between text-sm text-gray-600">
                <span>0</span>
                <span>20,000,000</span>
            </div>
        </div>
        <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Màu Sắc</h2>
            <ul className="space-y-2">
                <li><input type="checkbox"/> <span>Intel</span></li>
                <li><input type="checkbox"/> <span>AMD</span></li>
                <li><input type="checkbox"/> <span>NVIDIA</span></li>
                <li><input type="checkbox"/> <span>Asus</span></li>
                <li><input type="checkbox"/> <span>MSI</span></li>
                <li><input type="checkbox"/> <span>Gigabyte</span></li>
                <li><input type="checkbox"/> <span>Samsung</span></li>
                <li><input type="checkbox"/> <span>Kingston</span></li>
                <li><input type="checkbox"/> <span>Seagate</span></li>
                <li><input type="checkbox"/> <span>Western Digital</span></li>

            </ul>
        </div>
        <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Danh Mục Sản Phẩm</h2>
            <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-orange-500">Gia dụng</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-500">Linh kiện máy tính</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-500">Máy ảnh</a></li>
                {/* Các danh mục khác */}
            </ul>
        </div>
    </div>
);

export default ProductFilter;
