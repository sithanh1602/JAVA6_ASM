import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase.config"; // Firebase config
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [image, setImage] = useState(null); // File ảnh tạm thời

    // Fetch user data
    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (userId) {
            UserService.getUserById(userId)
                .then((data) => setUser(data))
                .catch(() => setError("Không thể tải thông tin người dùng."));
        } else {
            setError("UserId không tồn tại trong localStorage.");
        }
    }, []);

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file); // Lưu file để upload
            setUser({ ...user, image: URL.createObjectURL(file) }); // Hiển thị ảnh tạm thời
        }
    };

    // Save user data
    const handleSave = async () => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (!userId || !user) {
            toast.error("Không tìm thấy thông tin người dùng.");
            return;
        }

        try {
            let imageURL = user.image; // URL ảnh hiện tại

            // Upload ảnh mới nếu có
            if (image) {
                const fileRef = ref(storage, `profiles/${userId}_${Date.now()}_${image.name}`);
                await uploadBytes(fileRef, image);
                imageURL = await getDownloadURL(fileRef); // Lấy URL ảnh sau khi upload
            }

            // Cập nhật user với URL ảnh mới
            const updatedUser = { ...user, image: imageURL };

            await UserService.updateUser(userId, updatedUser);
            setUser(updatedUser); // Cập nhật state user
            toast.success("Cập nhật thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật profile:", error);
            toast.error("Cập nhật thất bại. Vui lòng thử lại.");
        }
    };

    if (!user && !error) return null; // Không hiển thị gì khi dữ liệu chưa sẵn sàng

    return (
        <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen p-2">
            {/* Toast container */}
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Sidebar */}
            <aside className="w-full md:w-1/4 bg-white p-6 shadow-lg">
                <div className="flex items-center mb-6">
                    <img
                        src={user.image || "https://placehold.co/50x50"}
                        alt="User avatar"
                        className="rounded-full w-12 h-12 mr-4"
                    />
                    <div>
                        <h2 className="font-bold text-lg">{user.userName}</h2>
                        <p className="text-sm text-gray-500">Sửa Hồ Sơ</p>
                    </div>
                </div>
                <nav className="space-y-4">
                    <SidebarItem icon="fa-user" text="Tài Khoản Của Tôi" active />
                    <SidebarItem icon="fa-id-card" text="Hồ Sơ" />
                    <SidebarItem icon="fa-university" text="Ngân Hàng" />
                    <SidebarItem icon="fa-map-marker-alt" text="Địa Chỉ" />
                    <SidebarItem icon="fa-lock" text="Đổi Mật Khẩu" />
                    <SidebarItem icon="fa-bell" text="Cài Đặt Thông Báo" />
                </nav>
            </aside>

            {/* Main Section */}
            <main className="w-full md:w-3/4 bg-white p-8 shadow-lg" id="main-section">
                <h2 className="text-xl font-bold mb-4" id="profile-heading">Hồ Sơ Của Tôi</h2>
                {error && <p id="error-message" className="text-red-500">{error}</p>}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                    id="profile-form"
                >
                    <div className="flex flex-wrap">
                        {/* Input fields */}
                        <div className="w-full md:w-2/3 pr-4">
                            <FormField
                                label="Tên đầy đủ"
                                value={user.fullName}
                                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                                id="full-name"
                            />
                            <FormField
                                label="Email"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                id="email"
                            />
                            <FormField
                                label="Phone"
                                value={user.phone}
                                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                id="phone"
                            />
                        </div>

                        {/* Profile Picture */}
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                            <div className="relative w-40 h-40 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center overflow-hidden" id="profile-picture">
                                <img
                                    src={user.image || "https://placehold.co/150x150"}
                                    alt="User profile"
                                    className="w-full h-full object-cover"
                                />
                                {/* Hiển thị nút "Chọn ảnh" ở trên */}
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                    <label htmlFor="profileImage" className="text-white text-sm font-semibold cursor-pointer" id="select-image-label">
                                        Chọn ảnh
                                    </label>
                                </div>
                            </div>
                            <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <p className="text-sm text-gray-500 mt-4" id="file-size-info">Dung lượng file tối đa 1 MB</p>
                        </div>
                    </div>
                    <button className="bg-red-500 text-white px-6 py-2 rounded mt-6" type="submit" id="save-button">
                        Lưu
                    </button>
                </form>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, text, active }) => (
    <div
        className={`flex items-center p-2 ${
            active ? "text-blue-500 font-bold" : "text-gray-700"
        }`}
    >
        <i className={`fas ${icon} mr-2`}></i>
        {text}
    </div>
);

const FormField = ({ label, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-gray-700 font-medium">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
        />
    </div>
);

export default ProfilePage;
