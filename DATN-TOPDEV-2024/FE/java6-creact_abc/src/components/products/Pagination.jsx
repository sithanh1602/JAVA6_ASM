import React from 'react';
import { Pagination } from '@nextui-org/react';

const PaginationComponent = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    return (
        <div className="flex justify-center mt-6">
            <Pagination
                loop
                showControls
                initialPage={currentPage} // Trang ban đầu
                total={totalPages} // Tổng số trang
                onChange={paginate} // Hàm điều khiển phân trang
                color="primary" // Màu của các nút phân trang
                size="md" // Kích thước của các nút phân trang
            />
        </div>
    );
};

export default PaginationComponent;
