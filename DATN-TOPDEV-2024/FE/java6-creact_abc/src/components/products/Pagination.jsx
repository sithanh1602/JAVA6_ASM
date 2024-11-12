import React from 'react';

const Pagination = () => (
    <div className="flex justify-center mt-4">
        {[1, 2, 3, 4, 5].map((page) => (
            <button key={page} className="px-3 py-1 border rounded">{page}</button>
        ))}
    </div>
);

export default Pagination;
