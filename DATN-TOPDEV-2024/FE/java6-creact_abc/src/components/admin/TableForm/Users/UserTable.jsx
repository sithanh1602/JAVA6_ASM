import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { FaEdit } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";

const UserTable = ({ users, onEditUser, onDeleteUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Filter users based on search term and status
    const filteredUsers = users.filter((user) => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const totalSpent = user.totalSpent ? user.totalSpent.toString() : ''; // Handle null or undefined totalSpent
        const phone = user.phone ? user.phone.toLowerCase() : ''; // Handle null or undefined phone
        const status = user.status ? user.status.toLowerCase() : ''; // Handle null or undefined status

        return (
            (user.fullName.toLowerCase().includes(lowercasedSearchTerm) ||
                totalSpent.includes(lowercasedSearchTerm) ||
                phone.includes(lowercasedSearchTerm) ||
                status.includes(lowercasedSearchTerm)) &&
            (statusFilter ? user.status.toLowerCase() === statusFilter.toLowerCase() : true)
        );
    });

    // Columns definition
    const columns = [
        {
            name: 'Ảnh đại diện',
            selector: (row) => row.image,
            cell: (row) => (
                <div className="w-10 h-10">
                    <img
                        src={row.image || 'https://via.placeholder.com/150'}
                        alt={`${row.fullName || 'User'} image`}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150';
                        }}
                    />
                </div>
            ),
        },
        {
            name: 'Họ và tên',
            selector: (row) => row.fullName,
            sortable: true,
        },
        {
            name: 'Email',
            selector: (row) => row.email,
            sortable: true,
        },
        {
            name: 'Số điện thoại',
            selector: (row) => row.phone,
            sortable: true,
        },
        {
            name: 'Tổng chi tiêu',
            selector: (row) => `$${row.totalSpent || 0}`, // Default to 0 if null or undefined
            sortable: true,
        },
        {
            name: 'Ngày đăng ký',
            selector: (row) => new Date(row.registrationDate).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Trạng Thái',
            selector: (row) => row.status,
            cell: (row) => (
                <span
                    className={`px-2 py-1 rounded text-white ${
                        row.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                >
                    {row.status === 'Active' ? 'Còn Hoạt Động' : 'Hết Hoạt Động'}
                </span>
            ),
            sortable: true,
        },
        {
            name: 'Hành động',
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                        onClick={() => onEditUser(row)}
                    >
                        <FaEdit />
                    </button>
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                        onClick={() => onDeleteUser(row.userId, row)}
                    >
                        <FiRefreshCw />
                    </button>
                </div>
            ),
        }


    ];

    const exportToExcel = async () => {
        try {
            // Tạo worksheet từ dữ liệu bảng
            const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'users');

            // Chuyển workbook thành buffer
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

            // Chuyển dạng binary string sang ArrayBuffer
            const buffer = new ArrayBuffer(excelBuffer.length);
            const view = new Uint8Array(buffer);
            for (let i = 0; i < excelBuffer.length; i++) {
                view[i] = excelBuffer.charCodeAt(i) & 0xFF;
            }

            // Tạo Blob và tải xuống
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);

            // Tạo link tải xuống
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users.xlsx';
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'File đã được tải xuống thành công!',
            });
        } catch (error) {
            console.error('Lỗi khi xuất file Excel:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể xuất file Excel!',
            });
        }
    };

    return (
        <div className="p-4 bg-white">
            {/* Filters */}
            <div className="mb-4 flex space-x-2">
                {/* Nút Xuất Excel */}
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={exportToExcel}
                >
                    Xuất Excel
                </button>
                <input
                    type="text"
                    className="border border-gray-300 px-4 py-2 rounded"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="border border-gray-300 px-4 py-2 rounded"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Trạng thái</option>
                    <option value="Active">Còn Hoạt Động</option>
                    <option value="Inactive">Hết Hoạt Động</option>
                </select>
            </div>

            {/* DataTable */}
            <DataTable
                title="Danh sách người dùng"
                columns={columns}
                data={filteredUsers} // Let the library handle pagination
                pagination
                highlightOnHover
                responsive
            />
        </div>
    );
};

export default UserTable;
