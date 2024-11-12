// src/components/CartItem.js
import React from 'react';

const CartItem = () => (
    <div className="grid grid-cols-5 gap-4 items-center mt-4">
        <div className="col-span-2 flex items-center">
            <img src="https://placehold.co/50x50" alt="Air Purifier" className="w-12 h-12 mr-4"/>
            <span>Air Purifier for Home Allergies Pets Hair in Bedroom</span>
        </div>
        <div>590,000₫</div>
        <div className="flex items-center">
            <button className="px-2 py-1 border">-</button>
            <input type="text" value="2" className="w-12 text-center border mx-2"/>
            <button className="px-2 py-1 border">+</button>
        </div>
        <div>1,180,000₫</div>
    </div>
);

export default CartItem;