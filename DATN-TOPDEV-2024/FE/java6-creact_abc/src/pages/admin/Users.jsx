import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import UserService from '../../services/UserService';
import UserTable from '../../components/admin/TableForm/Users/UserTable';
import UserInput from '../../components/admin/TableForm/Users/UserInput';
import Swal from "sweetalert2";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await UserService.getAllUsers();
            const activeUsers = data.filter(user => !user.deleted);
            setUsers(activeUsers);
        } catch (error) {
            setError('Failed to fetch users');
            console.error(error);
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchUsers(); // Refresh the user list after closing the modal
    };

    const handleDelete = async (userId, user) => {
        console.log("User ID:", userId);
        console.log("User Object:", user);

        // Xác định trạng thái mới
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        const statusMessage = newStatus === 'Active' ? 'Còn Hoạt Động' : 'Hết Hoạt Động';

        try {
            // Cập nhật trạng thái mới cho người dùng
            const updatedUserDetails = { ...user, status: newStatus };
            await UserService.updateUser(userId, updatedUserDetails);

            // Thông báo thành công
            Swal.fire({
                icon: 'success',
                title: 'Cập nhật thành công',
                text: `Người dùng đã chuyển sang trạng thái "${statusMessage}".`,
            });

            // Làm mới danh sách người dùng
            await fetchUsers();
        } catch (error) {
            // Thông báo lỗi
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể cập nhật trạng thái người dùng.',
            });
            console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
        }
    };




    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            {/* Modal for User Input */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                ariaHideApp={false}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                style={{
                    content: {
                        maxWidth: '60vw',
                        width: '100%',
                        height: '70vh',
                        padding: '0',
                        border: 'none',
                        background: 'transparent',
                        overflow: 'visible'
                    }
                }}
            >
                <div className="h-full bg-white p-6 rounded-lg flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            {selectedUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
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
                        <UserInput
                            user={selectedUser}
                            onSave={handleModalClose}
                        />
                    </div>
                </div>
            </Modal>

            {/* Page Title */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
            </div>

            {/* User Table and Add User Button  */}
            <div className="bg-white rounded-lg">
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ml-4"
                    onClick={handleAddUser}
                >
                    + Thêm người dùng
                </button>
                <UserTable
                    users={users}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDelete}
                />
            </div>
        </div>
    );
};

export default AdminUsersPage;
