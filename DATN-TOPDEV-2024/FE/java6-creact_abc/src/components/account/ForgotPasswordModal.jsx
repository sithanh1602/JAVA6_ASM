import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { FaEnvelope } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ForgotPasswordModal = ({ isOpen, onRequestClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!email) {
            Swal.fire({
                icon: 'error',
                title: 'Vui lòng nhập email!',
            });
            return;
        }

        setLoading(true);

        try {
            // Gửi yêu cầu đến API để gửi email đặt lại mật khẩu
            const response = await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            Swal.fire({
                icon: 'success',
                title: 'Kiểm tra email của bạn!',
                text: 'Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn.',
            });
            onRequestClose(); // Đóng modal sau khi gửi thành công
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Có lỗi xảy ra!',
                text: 'Không thể gửi email. Vui lòng thử lại.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Quên Mật Khẩu"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <h2 className="text-2xl font-semibold mb-4">Quên Mật Khẩu</h2>
            <form onSubmit={handleForgotPassword}>
                <div className="mb-4 flex items-center">
                    <input
                        type="email"
                        className="p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <FaEnvelope className="ml-2 mt-1" />
                </div>
                <button
                    type="submit"
                    className={`w-full bg-blue-600 text-white py-2 rounded ${loading ? 'bg-gray-400' : 'hover:bg-blue-700'} transition duration-200`}
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                </button>
            </form>
            <div className="mt-4 text-center">
                <button onClick={onRequestClose} className="text-red-500 hover:underline">
                    Hủy
                </button>
            </div>
        </Modal>
    );
};

export default ForgotPasswordModal;
