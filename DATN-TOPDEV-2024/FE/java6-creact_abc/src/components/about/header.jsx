// File: src/components/ShoppingExperience.jsx

import React from "react";

const Header = () => {
    return (
        <div className="mt-12 flex items-center justify-center px-3">
            <div className="max-w-7xl flex flex-col lg:flex-row items-center gap-8">
                {/* Left Image Section */}
                <div className="relative w-full lg:w-1/2">
                    <img
                        src="https://mona-smart.monamedia.net/wp-content/uploads/2022/09/img_16-600x427.jpg" // Replace with the main monitor image URL
                        alt="Main screen"
                        className="w-full rounded-lg shadow-lg "
                    />
                </div>

                {/* Right Text Section */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Trải nghiệm mua sắm thuận tiện và hài lòng
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Chúng tôi cam kết cung cấp những sản phẩm tốt nhất từ các thương hiệu
                        hàng đầu trên thị trường, đảm bảo mang lại sự tiện nghi và hài lòng
                        cho nhu cầu của quý khách.
                    </p>
                    <div className=" flex ">
                        <div className="flex items-start gap-4">
                            <div className="mt-2">
                                <img src="https://themexriver.com/wp/radios/wp-content/uploads/2022/09/about_01.svg" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Bộ sưu tập đa dạng
                                </h3>
                                <p className="text-gray-600">
                                    Cảm nhận các sản phẩm công nghệ mới nhất và phù hợp nhất hiện
                                    nay.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="mt-2">
                                <img src="https://themexriver.com/wp/radios/wp-content/uploads/2022/09/about_01.svg" alt=""/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Uy tín đáng tin cậy
                                </h3>
                                <p className="text-gray-600">
                                    Đảm bảo bạn luôn cảm thấy an tâm khi sử dụng sản phẩm.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Header;
