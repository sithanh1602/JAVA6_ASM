// src/components/CartSummary.js
import React from 'react';

const CartSummary = () => (
    <div className="border rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold mb-4">Tổng giỏ hàng</h2>
        <div className="grid grid-cols-2 gap-4">
            <div className="font-bold">TỔNG</div>
            <div>1,180,000₫</div>
        </div>
    </div>
);

export default CartSummary;