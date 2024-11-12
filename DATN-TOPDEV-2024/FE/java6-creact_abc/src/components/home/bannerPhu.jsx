import React from 'react';
import imgBanner1 from "../../assets/images//banner1.jpg";

const BannerPhu = () => {
    return (
        <div className=" items-center justify-center py-5">
            <div className=" w-full max-w-7xl mx-auto">
                <div className="relative">
                    <img
                        src={imgBanner1}
                        alt="Banner 1"
                        className="w-full object-cover rounded-lg h-96"
                    />
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-start p-8 text-white">
                        <p className="text-orange-500 text-sm mb-2">Widescreen 4k .......</p>
                        <h1 className="text-4xl font-bold leading-snug mb-4">
                            CÔNG NGHỆ ĐỘT PHÁ <br/> VÀ TIÊN TIẾN
                        </h1>
                        <p className="text-gray-200 mb-6">Sang trọng, hiện đại, hấp dẫn,....</p>
                        <p className="text-orange-400 text-xl font-bold mb-6">
                            Ưu đãi <span className="text-4xl font-extrabold">70%</span>{" "}
                            <span className="text-white">2,990,000đ</span>
                        </p>

                    </div>
                </div>
            </div>
        </div>
                );

                }
                export default BannerPhu;