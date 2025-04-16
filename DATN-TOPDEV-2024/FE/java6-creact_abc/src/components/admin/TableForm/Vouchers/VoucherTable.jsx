import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { FaEdit } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import Swal from "sweetalert2";

const VoucherTable = ({ vouchers, onEditVoucher, onDeactivateVoucher }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Filter vouchers based on search term and status
    const filteredVouchers = vouchers.filter((voucher) => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const code = voucher.code ? voucher.code.toLowerCase() : '';
        const discount = voucher.discount ? voucher.discount.toString() : '';
        const status = voucher.status ? voucher.status.toLowerCase() : '';

        return (
            (code.includes(lowercasedSearchTerm) ||
                discount.includes(lowercasedSearchTerm)) &&
            (statusFilter ? status.toLowerCase() === statusFilter.toLowerCase() : true)
        );
    });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Columns definition
    const columns = [
        {
            name: 'Mã voucher',
            selector: row => row.code,
            sortable: true,
        },
        {
            name: 'Giảm giá (VNĐ)',
            selector: row => row.discount,
            sortable: true,
            cell: row => new Intl.NumberFormat('vi-VN').format(row.discount)
        },
        {
            name: 'Số lượng',
            selector: row => row.quantity,
            sortable: true,
        },
        {
            name: 'Ngày bắt đầu',
            selector: row => row.startDate,
            sortable: true,
            cell: row => formatDate(row.startDate)
        },
        {
            name: 'Ngày kết thúc',
            selector: row => row.endDate,
            sortable: true,
            cell: row => formatDate(row.endDate)
        },
        {
            name: 'Trạng thái',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <span
                    className={`px-2 py-1 rounded text-white ${
                        row.status === 'hoatdong' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                >
                    {row.status === 'hoatdong' ? 'Còn hiệu lực' : 'Hết hiệu lực'}
                </span>
            ),
        },
        {
            name: 'Hành động',
            cell: row => (
                <div className="flex justify-center">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                        onClick={() => onEditVoucher(row)}
                    >
                        <FaEdit />
                    </button>
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                        onClick={() => onDeactivateVoucher(row.id, row)}
                    >
                        <FiRefreshCw />
                    </button>
                </div>
            ),
        }
    ];

    // Find voucher by code
    const searchByCode = async () => {
        if (!searchTerm) {
            Swal.fire({
                icon: 'warning',
                title: 'Thông báo',
                text: 'Vui lòng nhập mã voucher để tìm kiếm!',
            });
            return;
        }
        
        // Filter is already applied in filteredVouchers
        if (filteredVouchers.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Thông báo',
                text: `Không tìm thấy voucher với mã "${searchTerm}"`,
            });
        }
    };

    return (
        <div className="p-4 bg-white">
            {/* Filters */}
            <div className="mb-4 flex space-x-2">
                <input
                    type="text"
                    className="border border-gray-300 px-4 py-2 rounded"
                    placeholder="Nhập mã voucher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={searchByCode}
                >
                    Tìm kiếm
                </button>
                <select
                    className="border border-gray-300 px-4 py-2 rounded"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="hoatdong">Còn hiệu lực</option>
                    <option value="hethoatdong">Hết hiệu lực</option>
                </select>
            </div>

            {/* DataTable */}
            <DataTable
                title="Danh sách Voucher"
                columns={columns}
                data={filteredVouchers}
                pagination
                highlightOnHover
                responsive
            />
        </div>
    );
};

export default VoucherTable;