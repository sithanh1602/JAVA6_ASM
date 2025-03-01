import React, { useState, useEffect } from 'react';
import {
    Button,
    Card,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from '@nextui-org/react';
import ComponentSelectionModal from './ComponentSelectionModal';
import CategoryService from "../../services/CategoryService";

const PCBuilderComponent = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComponents, setSelectedComponents] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await CategoryService.getAllCategories();
                const filteredCategories = data.filter(category => category.id_build === 2);
                setCategories(filteredCategories);
                console.log(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        // Calculate total price whenever selected components change
        let total = 0;
        Object.values(selectedComponents).forEach(component => {
            if (component && component.price) {
                total += component.price;
            }
        });
        setTotalPrice(total);
    }, [selectedComponents]);

    const openModal = (categoryId) => {
        setSelectedCategory(categoryId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleComponentSelect = (component) => {
        setSelectedComponents(prev => ({
            ...prev,
            [selectedCategory]: component
        }));
        closeModal();
    };

    // Format price with thousand separator
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Handle add to cart
    const handleAddToCart = () => {
        // Check if any components are selected
        if (Object.keys(selectedComponents).length === 0) {
            alert('Vui lòng chọn ít nhất một linh kiện trước khi thêm vào giỏ hàng');
            return;
        }

        // Here you would implement the actual cart functionality
        // For example, call an API service to add items to cart
        console.log('Adding to cart:', selectedComponents);
        alert('Đã thêm cấu hình PC vào giỏ hàng!');

        // You might also want to redirect to cart page or show a confirmation
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex items-center mb-6">
                <nav className="flex text-gray-500 text-sm">
                    <a href="/" className="hover:text-blue-600">Trang chủ</a>
                    <span className="mx-2">&gt;</span>
                    <span className="text-gray-800">Build PC</span>
                </nav>
            </div>

            <h1 className="text-2xl font-bold text-gray-700 mb-6">Build PC - Xây dựng cấu hình máy tính</h1>

            <div className="flex flex-wrap gap-2 mb-6 items-center">
                <Button color="primary" variant="solid" className="font-medium rounded-none">Cấu hình 1</Button>
                <Button color="default" variant="flat" className="font-medium rounded-none">Cấu hình 2</Button>
                <Button color="default" variant="flat" className="font-medium rounded-none">Cấu hình 3</Button>

                <div className="ml-auto flex items-center gap-4">
                    {/* Total Price Display */}
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500">Tổng tiền tạm tính:</span>
                        <span className="text-lg font-bold text-red-600">{formatPrice(totalPrice)} ₫</span>
                    </div>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="bordered" className="font-medium rounded-none">
                                Tải cấu hình
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Tùy chọn tải" className="rounded-none">
                            <DropdownItem key="export">Xuất file</DropdownItem>
                            <DropdownItem key="save">Lưu cấu hình</DropdownItem>
                            <DropdownItem key="share">Chia sẻ</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            <Card className="p-6 mb-4 shadow-md rounded-none">
                <div className="flex">
                    <Button className="rounded-none" color="secondary">Thêm vào giỏ hàng</Button>
                    <div className="pl-4">
                        <Button className="rounded-none" color="success">Nhận tư vấn từ AI</Button>
                    </div>
                </div>
                <div className="relative">
                    {categories.map((category) => (
                        <div key={category.id}
                             className="border-b border-gray-200 py-6 flex flex-wrap md:flex-nowrap items-center">
                            <div className="w-full md:w-1/4 font-medium text-gray-700 mb-2 md:mb-0">
                                {category.name}
                            </div>
                            <div className="w-full md:w-2/5 text-gray-500 mb-2 md:mb-0">
                                {selectedComponents[category.id] ? (
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-700">
                                            {selectedComponents[category.id].name}
                                        </span>
                                        <span className="text-red-600">
                                            {formatPrice(selectedComponents[category.id].price)} ₫
                                        </span>
                                    </div>
                                ) : (
                                    "Vui lòng chọn linh kiện"
                                )}
                            </div>
                            <div className="w-full md:w-1/6 flex justify-end">
                                <Button
                                    color="primary"
                                    className="font-medium rounded-none"
                                    onPress={() => openModal(category.id)}
                                >
                                    Chọn
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <ComponentSelectionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedCategory={selectedCategory}
                categories={categories}
                onSelectComponent={handleComponentSelect}
            />
        </div>
    );
};

export default PCBuilderComponent;