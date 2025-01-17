import React from 'react';

const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center mt-4">
            {pageNumbers.map((page) => (
                <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-gray-300' : 'bg-white'}`}
                >
                    {page}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
