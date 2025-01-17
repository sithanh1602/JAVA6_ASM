import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase.config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserProfileForm from "./UserProfileForm";
import Sidebar from "./Sidebar";
import { Routes, Route } from "react-router-dom";
import EditAddress from "../account/EditAddress";
import ProvinceSelect from "../account/ProvinceSelect";
import AddressList from "../account/AdderssList";
import ChangePassword from "./ChangePassword";

const ProfilePage = () => {
    const [user, setUser] = useState({
        image: "", // Đảm bảo có giá trị mặc định cho hình ảnh
    });
    const [image, setImage] = useState(null);

    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (userId) {
            UserService.getUserById(userId)
                .then((data) => {
                    // Đảm bảo rằng dữ liệu trả về không undefined
                    if (data) {
                        setUser(data);
                    } else {
                        toast.error("Không thể tải thông tin người dùng.");
                    }
                })
                .catch(() => toast.error("Không thể tải thông tin người dùng."));
        }
    }, []);

    const handleImageChange = (file) => {
        setImage(file);
        setUser((prev) => ({
            ...prev,
            image: URL.createObjectURL(file), // Cập nhật ảnh mới vào state
        }));
    };

    const handleSave = async () => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (!userId || !user) {
            toast.error("Không tìm thấy thông tin người dùng.");
            return;
        }

        try {
            let imageURL = user.image;

            if (image) {
                const fileRef = ref(storage, `profiles/${userId}_${Date.now()}_${image.name}`);
                await uploadBytes(fileRef, image);
                imageURL = await getDownloadURL(fileRef);
            }

            const updatedUser = { ...user, image: imageURL };
            await UserService.updateUser(userId, updatedUser);
            setUser(updatedUser);
            toast.success("Cập nhật thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật profile:", error);
            toast.error("Cập nhật thất bại. Vui lòng thử lại.");
        }
    };

    if (!user) return null;

    return (
        <div className="flex flex-col md:flex-row bg-gray-100 p-6 h-[750px]">
            <ToastContainer position="top-right" autoClose={3000} />

            <aside className="w-full md:w-1/4 bg-white rounded-lg h-[700px]">
                <Sidebar user={user} />
            </aside>

            <main className="flex flex-col w-full md:w-3/4 px-6">
                <div className="bg-white rounded-lg p-6 mb-6 h-[700px]">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <UserProfileForm
                                    user={user}
                                    setUser={setUser}
                                    handleImageChange={handleImageChange}
                                    handleSave={handleSave}
                                />
                            }
                        />
                        <Route path="address-list" element={<AddressList />} />
                        <Route path="edit-address" element={<EditAddress />} />
                        <Route path="province-select" element={<ProvinceSelect />} />
                        <Route path="change-password" element={<ChangePassword />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
