import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

// Mẫu dữ liệu giả
const sampleData = [
    { id: 1, name: "Product A", price: 100, status: "Available" },
    { id: 2, name: "Product B", price: 200, status: "Unavailable" },
    { id: 3, name: "Product C", price: 150, status: "Available" },
];

// Component chính
const OrderStatus = () => {
    const [products, setProducts] = useState([]);

    // Giả lập việc tải dữ liệu
    useEffect(() => {
        // Thay bằng API call thực tế
        setProducts(sampleData);
    }, []);

    // Định nghĩa các cột
    const columns = [
        {
            name: "ID",
            selector: (row) => row.id,
            sortable: true,
        },
        {
            name: "Tên sản phẩm",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Giá",
            selector: (row) => `$${row.price}`,
            sortable: true,
        },
        {
            name: "Trạng thái",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <span
                    className={`px-2 py-1 rounded ${
                        row.status === "Available"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                    }`}
                >
          {row.status}
        </span>
            ),
        },
        {
            name: "Hành động",
            cell: (row) => (
                <div className="flex space-x-2">
                    <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => alert(`Sửa sản phẩm ID: ${row.id}`)}
                    >
                        Sửa
                    </button>
                    <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDelete(row.id)}
                    >
                        Xóa
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    // Hàm xóa sản phẩm
    const handleDelete = (id) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ID: ${id}?`)) {
            setProducts((prev) => prev.filter((product) => product.id !== id));
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Danh sách sản phẩm</h1>
            <DataTable
                title="Danh sách sản phẩm"
                columns={columns}
                data={products}
                pagination
                highlightOnHover
                selectableRows
                selectableRowHighlight
                theme="default"
            />
        </div>
    );
};

export default OrderStatus;
