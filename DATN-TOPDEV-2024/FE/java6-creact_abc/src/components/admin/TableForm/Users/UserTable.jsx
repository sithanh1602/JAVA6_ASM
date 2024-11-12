import React from 'react';

const UserTable = ({ users, onEditUser }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-lg rounded-lg">
                <thead>
                <tr className="bg-indigo-100 text-indigo-800 text-left text-sm font-semibold uppercase tracking-wide">
                    <th className="px-4 py-3 border-b">User Name</th>
                    <th className="px-4 py-3 border-b">Email</th>
                    <th className="px-4 py-3 border-b">Full Name</th>
                    <th className="px-4 py-3 border-b">Phone</th>
                    <th className="px-4 py-3 border-b">Total Spent</th>
                    <th className="px-4 py-3 border-b">Roles</th>
                    <th className="px-4 py-3 border-b">OTP SMS</th>
                    <th className="px-4 py-3 border-b">Registration Date</th>
                    <th className="px-4 py-3 border-b">Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 border-b text-gray-700">{user.userName}</td>
                        <td className="px-4 py-3 border-b text-gray-700">{user.email}</td>
                        <td className="px-4 py-3 border-b text-gray-700">{user.fullName}</td>
                        <td className="px-4 py-3 border-b text-gray-700">{user.phone}</td>
                        <td className="px-4 py-3 border-b text-green-600 font-semibold">
                            ${user.totalSpent ? user.totalSpent.toLocaleString() : '0'}
                        </td>
                        <td className="px-4 py-3 border-b text-gray-700">
                            {user.roles.map(role => role.roleName).join(', ')}
                        </td>
                        <td className="px-4 py-3 border-b text-gray-700">{user.otpSms || 'N/A'}</td>
                        <td className="px-4 py-3 border-b text-gray-700">
                            {new Date(user.registrationDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 border-b flex space-x-2">
                            <button
                                onClick={() => onEditUser(user)}
                                className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                                Edit
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
