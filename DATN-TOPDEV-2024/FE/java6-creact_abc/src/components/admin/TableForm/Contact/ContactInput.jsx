import React, { useState } from 'react';
import Swal from 'sweetalert2';
import ContactService from '../../../../services/ContactService';

const ContactInput = ({ isOpen, onClose, contact, onSuccess }) => {
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendFeedback = async () => {
        if (!feedback.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Thông báo',
                text: 'Vui lòng nhập nội dung phản hồi',
            });
            return;
        }

        if (!contact?.id || !contact?.email) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không tìm thấy thông tin liên hệ',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await ContactService.sendFeedback(contact.id, contact.email, feedback);

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Phản hồi đã được gửi thành công',
            });

            onSuccess(contact.id);
            onClose();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Gửi Phản Hồi</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>
                <div className="mb-4">
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        rows="5"
                        placeholder="Nhập phản hồi của bạn..."
                        disabled={isSubmitting}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSendFeedback}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Phản Hồi'}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ContactInput;
