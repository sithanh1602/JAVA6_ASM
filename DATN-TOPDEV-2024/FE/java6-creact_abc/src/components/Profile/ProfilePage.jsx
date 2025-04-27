import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase.config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserProfileForm from "./UserProfileForm";
import Sidebar from "./Sidebar";
import { Routes, Route, useNavigate } from "react-router-dom";
import EditAddress from "../account/EditAddress";
import ProvinceSelect from "../account/ProvinceSelect";
import AddressList from "../account/AdderssList";
import ChangePassword from "./ChangePassword";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const ProfilePage = () => {
    const [user, setUser] = useState({
        image: "", // Default image value
    });
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    const getUserIdFromToken = () => {
        const token = Cookies.get("jwtToken");
        let decodedUserId = null;

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                decodedUserId = decodedToken.userId;
                if (!decodedUserId) {
                    console.error("getUserIdFromToken: No userId in token");
                }
            } catch (error) {
                console.error("getUserIdFromToken: Error decoding token", error);
            }
        } else {
            console.log("getUserIdFromToken: No jwtToken found in cookies");
        }

        return decodedUserId;
    };

    useEffect(() => {
        const userId = getUserIdFromToken();
        if (userId) {
            UserService.getUserById(userId, Cookies.get("jwtToken"))
                .then((data) => {
                    if (data) {
                        setUser(data);
                    } else {
                        toast.error("Không thể tải thông tin người dùng.");
                    }
                })
                .catch((err) => {
                    console.error("fetchUser: Error fetching user data", {
                        message: err.message,
                        status: err.response?.status,
                        data: err.response?.data,
                    });
                    if (err.response?.status === 401) {
                        Swal.fire({
                            icon: "warning",
                            title: "Phiên đăng nhập hết hạn",
                            text: "Vui lòng đăng nhập lại để xem thông tin cá nhân.",
                            confirmButtonText: "Đăng nhập",
                        }).then(() => {
                            Cookies.remove("jwtToken");
                            navigate("/loginn");
                        });
                    } else {
                        toast.error("Không thể tải thông tin người dùng.");
                    }
                });
        } else {
            Swal.fire({
                icon: "warning",
                title: "Thông báo",
                text: "Vui lòng đăng nhập để xem thông tin cá nhân.",
                confirmButtonText: "Đăng nhập",
            }).then(() => {
                Cookies.remove("jwtToken");
                navigate("/loginn");
            });
        }
    }, [navigate]);

    const handleImageChange = (file) => {
        setImage(file);
        setUser((prev) => ({
            ...prev,
            image: URL.createObjectURL(file), // Update preview image
        }));
    };

    const handleSave = async () => {
        const userId = getUserIdFromToken();
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
            await UserService.updateUser(userId, updatedUser, Cookies.get("jwtToken"));
            setUser(updatedUser);
            toast.success("Cập nhật thành công!");
        } catch (error) {
            console.error("handleSave: Error updating profile", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            if (error.response?.status === 401) {
                Swal.fire({
                    icon: "warning",
                    title: "Phiên đăng nhập hết hạn",
                    text: "Vui lòng đăng nhập lại để cập nhật thông tin.",
                    confirmButtonText: "Đăng nhập",
                }).then(() => {
                    Cookies.remove("jwtToken");
                    navigate("/loginn");
                });
            } else {
                toast.error("Cập nhật thất bại. Vui lòng thử lại.");
            }
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
                <div className="bg-white p-6 mb-6 h-[700px]">
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