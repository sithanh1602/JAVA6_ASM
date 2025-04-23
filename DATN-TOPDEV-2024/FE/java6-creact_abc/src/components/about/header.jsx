// File: src/components/ShoppingExperience.jsx

import React from "react";

const ShoppingExperience = () => {
    return (
        <div className="mt-12 px-4 flex items-center justify-center">
            <div className="max-w-7xl flex flex-col lg:flex-row items-center gap-10">
                {/* Left Image Section */}
                <div className="relative w-full lg:w-1/2">
                    <img
                        src="https://i.pinimg.com/736x/91/68/bf/9168bf7444d87b0e3ca548f312b1f5bb.jpg" // Hình ảnh phù hợp linh kiện máy tính
                        alt="Linh kiện máy tính"
                        className="w-full rounded-xl shadow-lg object-cover"
                    />
                </div>

                {/* Right Text Section */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold  mb-4">
                        Trải nghiệm mua sắm linh kiện máy tính chất lượng
                    </h1>
                    <p className="text-gray-600 mb-6 text-base md:text-lg">
                        Chúng tôi cung cấp đầy đủ các loại linh kiện chính hãng từ các thương hiệu hàng đầu:
                        CPU, RAM, SSD, VGA, PSU... với giá cả cạnh tranh, dịch vụ tận tâm và giao hàng nhanh chóng.
                    </p>

                    {/* Features Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/1087/1087815.png"
                                alt="Sản phẩm đa dạng"
                                className="w-10 h-10"
                            />
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Sản phẩm đa dạng
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Cập nhật liên tục các mẫu mã linh kiện mới nhất trên thị trường.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
                                alt="Chất lượng uy tín"
                                className="w-10 h-10"
                            />
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Uy tín & Chính hãng
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Cam kết linh kiện chính hãng, bảo hành rõ ràng, tư vấn nhiệt tình.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingExperience;
