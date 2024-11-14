import React from 'react';
import imgBanner1 from '../../assets/images/banner1.jpg';
import imgBanner2 from '../../assets/images/banner2.jpg';
import imgBanner3 from '../../assets/images/banner3.jpg';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import AOS from 'aos'; // Import AOS library
import 'aos/dist/aos.css'; // Import AOS styles

const BannerContent = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
    };

    return (
        <div className=" items-center justify-center" data-aos="fade-up">
            <div className=" w-full max-w-7xl mx-auto">
                <main className="container mx-auto py-8">
                    <div className="flex gap-8 items-center">
                        <div className="w-full max-w-4xl mx-auto mt-8">
                            <Slider {...settings}>
                                <div className="relative">
                                    <img
                                        src={imgBanner1}
                                        alt="Banner 1"
                                        className="w-full object-cover rounded-lg"
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
                                        <button
                                            className="bg-orange-500 text-white px-6 py-3 rounded-md text-lg flex items-center">
                                            MUA NGAY <i className="fas fa-arrow-right ml-2"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <img
                                        src={imgBanner2}
                                        alt="Banner 2"
                                        className="w-full h-90 object-cover rounded-lg"
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
                                        <button
                                            className="bg-orange-500 text-white px-6 py-3 rounded-md text-lg flex items-center">
                                            MUA NGAY <i className="fas fa-arrow-right ml-2"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <img
                                        src={imgBanner3}
                                        alt="Banner 3"
                                        className="w-full object-cover rounded-lg"
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
                                        <button
                                            className="bg-orange-500 text-white px-6 py-3 rounded-md text-lg flex items-center">
                                            MUA NGAY <i className="fas fa-arrow-right ml-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </Slider>
                        </div>
                        <div className="w-1/3 bg-gray-50 p-6 rounded-lg">
                            <div>
                        <span className="bg-orange-500 text-white text-sm px-2 py-1 rounded-md">
                            NEW
                        </span>
                                <h2 className="text-2xl font-bold mt-4 mb-4 leading-snug">
                                    MUA SẮM THUẬN TIỆN <br/> VÀ ĐƠN GIẢN
                                </h2>
                                <p className="text-orange-500 text-xl font-bold">
                                    Ưu đãi <span className="text-4xl font-extrabold">70%</span>
                                </p>
                            </div>
                            <button
                                className="border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-md text-lg mt-6 flex items-center hover:bg-orange-500 hover:text-white transition-colors">
                                MUA NGAY <i className="fas fa-arrow-right ml-2"></i>
                            </button>

                            <img
                                src={imgBanner1}
                                alt="Smartphone with stylus"
                                className="mt-6 h-48 w-auto mx-auto"
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>

    );
};

export default BannerContent;