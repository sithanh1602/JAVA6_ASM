// src/pages/CartPage.jsx
import React from 'react';
import Breadcrumb from '../components/cart/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import CouponForm from '../components/cart/CouponForm';
import CartSummary from '../components/cart/CartSummary';

const CartPage = () => (
    <div className="flex justify-center">
        <div className="container mt-4 max-w-4xl">
            <Breadcrumb/>
            <div className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-2 font-bold">SẢN PHẨM</div>
                    <div className="font-bold">GIÁ</div>
                    <div className="font-bold">SỐ LƯỢNG</div>
                    <div className="font-bold">TẠM TÍNH</div>
                </div>
                <CartItem/>
                <CouponForm/>
            </div>
            <CartSummary/>
            <div className="flex justify-end">
                <button className="bg-orange-500 text-white px-6 py-2">TIẾN HÀNH THANH TOÁN</button>
            </div>
        </div>
    </div>
);

export default CartPage;