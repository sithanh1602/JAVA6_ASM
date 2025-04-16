import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import VoucherService from '../../services/VoucherService';
import VoucherTable from '../../components/admin/TableForm/Vouchers/VoucherTable';
import VoucherInput from '../../components/admin/TableForm/Vouchers/VoucherInput';
import Swal from "sweetalert2";

const Vouchers = () => {
    const [vouchers, setVouchers] = useState([]);
    const [error, setError] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const data = await VoucherService.getAllVouchers();
            setVouchers(data);
        } catch (error) {
            setError('Không thể tải danh sách voucher');
            console.error(error);
        }
    };

    const handleAddVoucher = () => {
        setSelectedVoucher(null);
        setIsModalOpen(true);
    };

    const handleEditVoucher = (voucher) => {
        setSelectedVoucher(voucher);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchVouchers(); // Refresh the voucher list after closing the modal
    };

    const handleDeactivateVoucher = async (voucherId, voucher) => {
        // Determine new status
        const newStatus = voucher.status === 'hoatdong' ? 'hethoatdong' : 'hoatdong';
        const statusMessage = newStatus === 'hoatdong' ? 'Còn hiệu lực' : 'Hết hiệu lực';

        try {
            // Show confirmation dialog
            const result = await Swal.fire({
                title: 'Xác nhận thay đổi trạng thái',
                text: `Bạn muốn chuyển voucher "${voucher.code}" sang trạng thái "${statusMessage}"?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Hủy bỏ'
            });

            if (result.isConfirmed) {
                // Update voucher status
                const updatedVoucherDetails = { ...voucher, status: newStatus };
                await VoucherService.updateVoucher(voucherId, updatedVoucherDetails);

                // Success notification
                Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công',
                    text: `Voucher đã chuyển sang trạng thái "${statusMessage}".`,
                });

                // Refresh voucher list
                await fetchVouchers();
            }
        } catch (error) {
            // Error notification
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể cập nhật trạng thái voucher.',
            });
            console.error('Lỗi khi cập nhật trạng thái voucher:', error);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            {/* Modal for Voucher Input */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                ariaHideApp={false}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                style={{
                    content: {
                        maxWidth: '600px',
                        width: '100%',
                        height: 'auto',
                        maxHeight: '90vh',
                        padding: '0',
                        border: 'none',
                        background: 'transparent',
                        overflow: 'visible'
                    }
                }}
            >
                <div className="bg-white p-6 rounded-lg flex flex-col max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            {selectedVoucher ? 'Cập nhật voucher' : 'Thêm voucher mới'}
                        </h2>
                        <button
                            onClick={handleModalClose}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Close modal"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                        <VoucherInput
                            voucher={selectedVoucher}
                            onSave={handleModalClose}
                        />
                    </div>
                </div>
            </Modal>

            {/* Page Title */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold">Quản lý voucher</h1>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Voucher Table and Add Voucher Button */}
            <div className="bg-white rounded-lg">
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ml-4 mb-4"
                    onClick={handleAddVoucher}
                >
                    + Thêm voucher mới
                </button>
                <VoucherTable
                    vouchers={vouchers}
                    onEditVoucher={handleEditVoucher}
                    onDeactivateVoucher={handleDeactivateVoucher}
                />
            </div>
        </div>
    );
};

export default Vouchers;