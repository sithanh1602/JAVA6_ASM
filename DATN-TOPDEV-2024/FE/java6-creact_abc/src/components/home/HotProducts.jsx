import React from 'react';
import { FaShippingFast } from "react-icons/fa";
const HotProducts = () => {

    return (
        <>
            {/* Start product hot  */}
            <div className="h-[59px] relative border-b mb-4  border-[#e1e1e1]">
                <div className="absolute left-[20px] top-1/2 transform -translate-y-1/2 flex items-center">
                    <FaShippingFast className="text-black text-[28px] mr-[10px]"/>
                    <div
                        className="w-[244.09px] h-[33px] text-black text-[28px] font-semibold font-['Work Sans'] leading-7">
                        Sản phẩm hot
                    </div>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="grid grid-cols-4 gap-4 mt-4 mb-10">
                {[
                    {name: "Bộ kit Camera Vantech 450CVI+ 4 Camera", price: "2,150,000đ"},
                    {name: "Camera Hành trình YI Dash Camera - Dark grey 2K", price: "1,110,000đ"},
                    {name: "Camera Xiaomi Yi - Cloud Dome 1080P", price: "1,250,000đ"},
                    {name: "Camera IP không dây Dahua IPC-C35P 3.0Mp", price: "1,550,000đ"},
                ].map((product, index) => (
                    <div key={index} className="bg-white shadow-md rounded-lg p-4 text-center">
                        <div className="h-32 bg-gray-300 rounded-lg mb-2"></div>
                        <h4 className="text-sm font-semibold">{product.name}</h4>
                        <span className="block text-red-500 font-bold">{product.price}</span>
                    </div>
                ))}
            </div>
            {/* End product hot */}

        </>
    );
}
export default HotProducts;