import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
    // Lấy token từ cookie
    const token = Cookies.get('jwtToken');

    // Nếu không có token, cho phép truy cập (người dùng chưa đăng nhập)
    if (!token) {
        // Nếu tuyến đường yêu cầu quyền cụ thể (như /admin/*), chuyển hướng về /
        if (allowedRoles && allowedRoles.length > 0) {
            return <Navigate to="/" replace />;
        }
        return children;
    }

    try {
        // Giải mã token
        const decodedToken = jwtDecode(token);
        const roles = decodedToken.roles || [];

        // Kiểm tra xem token có hết hạn không
        const currentTime = Date.now() / 1000; // Thời gian hiện tại (giây)
        if (decodedToken.exp < currentTime) {
            Cookies.remove('jwtToken');
            Cookies.remove('refreshToken');
            return <Navigate to="/" replace />; // Chuyển hướng về HomePage thay vì /login
        }

        // Nếu tuyến đường không yêu cầu quyền cụ thể, cho phép truy cập
        if (!allowedRoles || allowedRoles.length === 0) {
            return children;
        }

        // Kiểm tra quyền truy cập dựa trên roles
        const hasRequiredRole = allowedRoles.some(role => roles.includes(role));

        if (!hasRequiredRole) {
            // Nếu không có quyền, chuyển hướng về trang chính (HomePage)
            return <Navigate to="/" replace />;
        }

        // Nếu có quyền, render component con
        return children;
    } catch (error) {
        // Nếu token không hợp lệ, xóa token và cho phép truy cập như người dùng chưa đăng nhập
        console.error('Invalid token:', error);
        Cookies.remove('jwtToken');
        Cookies.remove('refreshToken');
        if (allowedRoles && allowedRoles.length > 0) {
            return <Navigate to="/" replace />;
        }
        return children;
    }
};

export default ProtectedRoute;