import React, { useState, useEffect } from "react";
import UserService from "../../services/UserService";

const ProfilePage = () => {
    const [user, setUser] = useState(null); // State lưu thông tin người dùng
    const [loading, setLoading] = useState(true); // State hiển thị trạng thái loading
    const [error, setError] = useState(null); // State lưu lỗi

    // Lấy userId từ localStorage và gọi API
    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (userId) {
            UserService.getUserById(userId)
                .then((data) => {
                    if (data) {
                        setUser(data); // Cập nhật dữ liệu người dùng
                    } else {
                        setError("Không tìm thấy thông tin người dùng.");
                    }
                    setLoading(false); // Tắt trạng thái loading
                })
                .catch((err) => {
                    console.error("Error fetching user:", err);
                    setError("Không thể tải thông tin người dùng.");
                    setLoading(false);
                });
        } else {
            setError("UserId không tồn tại trong localStorage.");
            setLoading(false);
        }
    }, []);

    const handleChange = (field, value) => {
        setUser({ ...user, [field]: value }); // Cập nhật state khi người dùng chỉnh sửa
    };

    const handleSave = () => {
        const userId = JSON.parse(localStorage.getItem("UserId"));
        if (!user || !userId) {
            alert("Không có thông tin người dùng để cập nhật.");
            return;
        }
        UserService.updateUser(userId, user)
            .then(() => alert("Cập nhật thành công!"))
            .catch((err) => {
                console.error("Error updating user:", err);
                alert("Cập nhật thất bại. Vui lòng thử lại.");
            });
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="flex flex-wrap p-8 bg-gray-100 min-h-screen">
            {/* Sidebar */}
            <aside className="w-full md:w-1/4 bg-white p-4 rounded shadow mb-4 md:mb-0">
                <div className="flex items-center mb-4">
                    <img
                        src="https://placehold.co/50x50"
                        alt="User avatar"
                        className="rounded-full w-12 h-12 mr-2"
                    />
                    <div>
                        <h2 className="font-bold">{user.userName}</h2>
                        <p className="text-sm text-gray-500">Sửa Hồ Sơ</p>
                    </div>
                </div>
                <nav>
                    <ul>
                        <SidebarLink icon="fas fa-user" text="Tài Khoản Của Tôi" />
                        <SidebarLink icon="fas fa-id-card" text="Hồ Sơ" active />
                        <SidebarLink icon="fas fa-university" text="Ngân Hàng" />
                        <SidebarLink icon="fas fa-map-marker-alt" text="Địa Chỉ" />
                        <SidebarLink icon="fas fa-lock" text="Đổi Mật Khẩu" />
                    </ul>
                </nav>
            </aside>

            {/* Main Profile Section */}
            <main className="w-full md:w-3/4 bg-white p-8 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Hồ Sơ Của Tôi</h2>
                <p className="text-gray-500 mb-6">Quản lý thông tin hồ sơ để bảo mật tài khoản.</p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault(); // Ngăn reload
                        handleSave(); // Gọi hàm lưu dữ liệu
                    }}
                >
                    {/* Profile Form */}
                    <section className="w-full md:w-2/3">
                        <FormField
                            label="Tên đăng nhập"
                            value={user.userName}
                            disabled
                            note="Tên đăng nhập chỉ có thể thay đổi một lần."
                        />
                        <FormField
                            label="Tên đầy đủ"
                            value={user.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                        />
                        <FormField
                            label="Email"
                            value={user.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                        <FormField
                            label="Phone"
                            value={user.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                        />

                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded"
                            type="submit" // Loại button là submit để kích hoạt sự kiện onSubmit
                        >
                            Lưu
                        </button>
                    </section>

                    {/* Profile Picture Section */}
                    <aside className="w-full md:w-1/3 flex flex-col items-center mt-6 md:mt-0">
                        <img
                            src="https://placehold.co/100x100"
                            alt="User profile"
                            className="rounded-full w-24 h-24 mb-4"
                        />
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Chọn Ảnh</button>
                        <p className="text-gray-500 text-sm mt-2">Dụng lượng file tối đa 1 MB</p>
                        <p className="text-gray-500 text-sm">Định dạng: .JPEG, .PNG</p>
                    </aside>
                </form>
            </main>
        </div>
    );
};

// Các component phụ
const SidebarLink = ({ icon, text, active }) => (
    <li className="mb-2">
        <a href="#" className={`flex items-center ${active ? "text-red-500" : "text-gray-700"}`}>
            <i className={`${icon} mr-2`}></i>
            {text}
        </a>
    </li>
);

const FormField = ({ label, value, onChange, disabled, note, customContent }) => (
    <div className="mb-4">
        <label className="block text-gray-700 font-medium">{label}</label>
        {customContent || (
            <input
                type="text"
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full p-2 border rounded mt-1"
            />
        )}
        {note && <p className="text-gray-500 text-sm mt-1">{note}</p>}
    </div>
);

export default ProfilePage;
