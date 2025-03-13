import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ user }) => {
    const items = [
        { path: "/profile", label: "Hồ sơ", icon: "fa-user" },
        { path: "/profile/address-list", label: "Địa chỉ", icon: "fa-map-marker-alt" },
        { path: "/profile/change-password", label: "Đổi mật khẩu", icon: "fa-map-marker-alt" },
    ];

    return (
        <aside className="w-full md:w-4/4 bg-white p-6">
            <div className="mb-6 text-center">
                <img
                    src={user.image || "https://placehold.co/50x50"}
                    alt="User avatar"
                    className="rounded-full w-20 h-20 mb-4 mx-auto object-cover border-2 border-blue-500"
                />
                <h2 className="font-semibold text-xl text-gray-800">Hồ Sơ Của Tôi</h2>
            </div>
            <nav className="space-y-4">
                {items.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center p-3 rounded-lg transition-all duration-200 ${
                                isActive ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-blue-50"
                            }`
                        }
                    >
                        <i className={`fas ${item.icon} mr-3 text-lg`} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
