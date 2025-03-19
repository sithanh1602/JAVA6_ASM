import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = ({ pageName }) => {
    const location = useLocation();
    
    // Xác định tên trang dựa trên URL nếu không có prop pageName
    let displayPageName = pageName;
    
    if (!displayPageName) {
        const path = location.pathname;
        if (path.includes('/products')) {
            displayPageName = 'Sản phẩm';
        } else if (path.includes('/pc-builds')) {
            displayPageName = 'Máy tính có sẵn';
        }
    }
    
    return (
        <div className="text-sm text-gray-600">
            <Link to="/" className="text-orange-500">Trang Chủ</Link> / {displayPageName}
        </div>
    );
};

export default Breadcrumb;