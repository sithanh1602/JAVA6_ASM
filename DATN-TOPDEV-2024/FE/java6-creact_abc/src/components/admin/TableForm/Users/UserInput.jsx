import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../../../../firebase.config';
import UserService from '../../../../services/UserService'

const UserInput = ({ user, onSave }) => {
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        fullName: "",
        phone: "",
        status: "Active",
        image: "",
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(user); // Load user data vào form khi edit
        }
    }, [user]);

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Upload ảnh lên Firebase
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setUploading(true); // Hiển thị trạng thái đang upload
                const storageRef = ref(storage, `users/${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => {
                        setUploading(false);
                        Swal.fire({
                            icon: "error",
                            title: "Upload Failed",
                            text: "Could not upload the image. Please try again.",
                        });
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setUploading(false);
                        setFormData({ ...formData, image: downloadURL });
                        Swal.fire({
                            icon: "success",
                            title: "Image Uploaded",
                            text: "The image has been uploaded successfully!",
                        });
                    }
                );
            } catch (error) {
                setUploading(false);
            }
        }
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (user) {
                await UserService.updateUser(user.userId, formData); // Update user
                Swal.fire("Success", "User updated successfully", "success");
            } else {
                await UserService.createUser(formData); // Create user
                Swal.fire("Success", "User created successfully", "success");
            }
            onSave();
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "An error occurred", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input fields */}
            <div>
                <label className="block text-sm font-semibold">User Name</label>
                <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded-md"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded-md"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold">Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded-md"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold">Phone</label>
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded-md"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold">Upload image</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border p-2 rounded-md"
                />
                {uploading && <p className="text-blue-500 text-sm">Uploading...</p>}
                {formData.image && (
                    <img
                        src={formData.image}
                        alt="image Preview"
                        className="h-20 w-20 rounded-full object-cover mt-2"
                    />
                )}
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                disabled={uploading}
            >
                {user ? "Update User" : "Create User"}
            </button>
        </form>
    );
};

export default UserInput;
