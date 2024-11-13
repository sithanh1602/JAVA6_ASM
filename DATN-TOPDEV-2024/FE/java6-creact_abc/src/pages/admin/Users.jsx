import React, { useState, useEffect } from 'react';
import UserService from '../../services/UserService';
import UserTable from '../../components/admin/TableForm/Users/UserTable';
import UserInput from '../../components/admin/TableForm/Users/UserInput';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);  // Track selected user for editing

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await UserService.getAllUsers();
            setUsers(data.filter(user => !user.deleted));  // Filter out soft-deleted users
        } catch (error) {
            setError('Failed to fetch users');
            console.error(error);
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);  // Clear selected user for adding new user
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);  // Set selected user for editing
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-lg space-y-6">
            <div className="space-y-6">
                {/* User Input Form (below the table) */}
                <UserInput
                    user={selectedUser}  // Pass selected user or null to UserInput
                    onSave={fetchUsers}  // Refresh user list after save
                />

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                    <button
                        onClick={handleAddUser}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Add User
                    </button>
                </div>
                {/* User Table (top part of the page) */}
                <div>
                    {error && <p className="text-red-600 font-semibold">{error}</p>}
                    <UserTable users={users} onEditUser={handleEditUser}/>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;