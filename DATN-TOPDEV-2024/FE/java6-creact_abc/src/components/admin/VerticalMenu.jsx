import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaHome,
    FaEnvelope,
    FaEdit,
    FaCalendarAlt,
    FaComments,
    FaChartBar,
    FaPencilAlt,
    FaPuzzlePiece,
    FaTable,
    FaMap,
    FaFileAlt,
    FaLayerGroup,
    FaChevronRight,
    FaBars
    ,
    FaProductHunt,
    FaUser,
} from 'react-icons/fa';
import { MdCategory } from 'react-icons/md';

const VerticalMenu = ({ isOpen, toggleMenu }) => {
    // State để lưu các mục menu có cấp 2 đang mở
    const [openSubMenus, setOpenSubMenus] = useState({});

    const menuItems = [
        { icon: <FaHome className="text-blue-500" />, label: 'Dashboard', link: '/admin/dash' },
        { icon: <MdCategory className="text-red-500" />, label: 'Category', link: '/admin/cateTable' },
        { icon: <FaProductHunt className="text-orange-500" />, label: 'Product', link: '/admin/product' },
        { icon: <FaUser className="text-pink-500" />, label: 'User', link: '/admin/user' },
        { icon: <FaEnvelope className="text-purple-500" />, label: 'Email', link: '/chat' },
        { icon: <FaComments className="text-purple-500" />, label: 'Chat', link: '/chat' },
        { icon: <FaChartBar className="text-blue-500" />, label: 'Charts', link: '/charts' },
        { icon: <FaPencilAlt className="text-blue-500" />, label: 'Forms', link: '/forms' },
        { icon: <FaPuzzlePiece className="text-pink-500" />, label: 'UI Elements', link: '/ui-elements' },
        { icon: <FaTable className="text-orange-500" />, label: 'Tables', hasArrow: true, subItems: [
                { label: 'Basic Table', link: '/tables/basic' },
                { label: 'Data Table', link: '/tables/data' },
                { label: 'Responsive Table', link: '/tables/responsive' }
            ]},
        { icon: <FaMap className="text-purple-500" />, label: 'Maps', hasArrow: true, subItems: [
                { label: 'Google Map', link: '/maps/google' },
                { label: 'OpenStreet Map', link: '/maps/openstreet' }
            ]},
        { icon: <FaFileAlt className="text-red-500" />, label: 'Pages', hasArrow: true, subItems: [
                { label: 'Login', link: '/pages/login' },
                { label: 'Register', link: '/pages/register' },
                { label: 'Forgot Password', link: '/pages/forgot-password' }
            ]},
        { icon: <FaLayerGroup className="text-green-500" />, label: 'Multiple Levels', hasArrow: true, subItems: [
                { label: 'Level 1', link: '/levels/level1' },
                { label: 'Level 2', link: '/levels/level2' }
            ]}
    ];

    const toggleSubMenu = (index) => {
        setOpenSubMenus((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    return (
        <div className={`h-screen bg-white shadow-md transition-width duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-between h-16 border-b px-4">
                <img src="https://placehold.co/40x40" alt="Adminator Logo" className={`h-10 w-10 ${isOpen ? '' : 'hidden'}`} />
                {isOpen && <span className="ml-2 text-xl font-bold">Adminator</span>}
                <FaBars className="cursor-pointer text-gray-600" onClick={toggleMenu} />
            </div>
            <ul className="mt-4">
                {menuItems.map((item, index) => (
                    <li key={index} className="flex flex-col">
                        <div
                            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => item.hasArrow && toggleSubMenu(index)}
                        >
                            {item.icon}
                            {isOpen && (
                                <Link to={item.link} className="ml-2">
                                    {item.label}
                                </Link>
                            )}
                            {item.hasArrow && isOpen && (
                                <FaChevronRight
                                    className={`ml-auto transition-transform ${openSubMenus[index] ? 'rotate-90' : ''}`}
                                />
                            )}
                        </div>
                        {/* Menu cấp 2 */}
                        {item.subItems && openSubMenus[index] && (
                            <ul className="ml-8 mt-2 space-y-2">
                                {item.subItems.map((subItem, subIndex) => (
                                    <li key={subIndex}>
                                        <Link to={subItem.link} className="text-gray-600 hover:text-blue-500">
                                            {subItem.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VerticalMenu;
