// src/components/App.js
import React from 'react';
import BillingInfo from "./OderBingllingInfor";
import OrderInfo from "./OderInfor";
import OrderBr from "./OderBr";

const GroupOrder = () => (
    <div className="container mx-auto p-4">
        <OrderBr />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BillingInfo />
            <OrderInfo />
        </div>
    </div>
);

export default GroupOrder ;
