// src/components/CouponForm.js
import React from 'react';
import { Link } from 'react-router-dom';
const CouponForm = () => (
    <div className="flex justify-between items-center mt-4">
        <div className="flex items-center">
            <input type="text" placeholder="Mã giảm giá" className="border p-2 mr-2"/>
            <button className="bg-orange-500 text-white px-4 py-2">ÁP DỤNG</button>
        </div>
        <Link to="/products">
            <button className="bg-orange-200 text-orange-700 px-4 py-2">Tiếp tục mua hàng</button>
        </Link>

    </div>
);

export default CouponForm;