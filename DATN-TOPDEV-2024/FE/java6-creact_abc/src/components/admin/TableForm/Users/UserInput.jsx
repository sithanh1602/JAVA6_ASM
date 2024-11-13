import React, { useState, useEffect } from 'react';
import UserService from '../../../../services/UserService';

const UserInput = ({ user, onSave }) => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        fullName: '',
        phone: '',
        totalSpent: '',
        registrationDate: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(user);  // Load user data if editing
        }
    }, [user]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    const handleSubmit = async () => {
        if (user) {
            await UserService.updateUser(user.userId, formData);  // Update user data
        } else {
            await UserService.createUser(formData);  // Create new user
        }
        onSave(); // Refresh user list
    };

    const handleClear = () => {
        setFormData({
            userName: '',
            email: '',
            fullName: '',
            phone: '',
            totalSpent: '',
            registrationDate: '',
        }); // Reset the form
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-full mx-auto bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    {user ? 'Edit User' : 'Add User'}
                </h2>
                <div className="flex flex-wrap gap-4">
                    <div className="space-y-6">
                        {/* User Name */}
                        <div>
                            <label htmlFor="userName" className="block text-sm font-semibold text-gray-700 mb-1">User
                                Name</label>
                            <input
                                id="userName"
                                placeholder="Enter User Name"
                                value={formData.userName}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                        {/* Email */}
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="email"
                                   className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Full Name */}
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">Full
                                Name</label>
                            <input
                                id="fullName"
                                placeholder="Enter Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="phone"
                                   className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="Enter Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Registration Date */}
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="registrationDate"
                                   className="block text-sm font-semibold text-gray-700 mb-1">Registration Date</label>
                            <input
                                id="registrationDate"
                                type="date"
                                value={formData.registrationDate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-2 mt-6 justify-start">
                        <button
                            onClick={handleSubmit}
                            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {user ? 'Save Changes' : 'Add User'}
                        </button>

                        <button
                            onClick={handleClear} // Clear form
                            className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
            );
            };

            export default UserInput;
