import React, { useState } from 'react';
import CartModal from './CartModal';  // Import component CartModal

const CartButton = ({ cartItemsCount, cartItems }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <>
            <div className="fixed bottom-4 right-4">
                <button
                    onClick={toggleModal}
                    className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
                    title="Giỏ hàng"
                >
                    <i className="fas fa-shopping-cart ml-2"></i> {/* Biểu tượng giỏ hàng */}
                </button>
            </div>

            {/* Hiển thị modal khi isModalOpen là true */}
            <CartModal
                isOpen={isModalOpen}
                closeModal={toggleModal}
                cartItems={cartItems}
            />
        </>
    );
};

export default CartButton;
