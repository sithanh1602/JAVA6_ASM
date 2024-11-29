import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import 'aos/dist/aos.css';

const BrandLogo = () => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    return (
        <div className=" items-center justify-center" data-aos="fade-up-right">
            <div className=" w-full max-w-5xl mx-auto">
                <Slider {...settings}>
                    <div className="px-3">
                        <div className=" rounded-lg overflow-hidden">
                            <img
                                src="https://images.acer.com/is/content/acer/acer-4"
                                alt="Brand Logo"
                                className="w-full h-40 object-contain" // object-contain để giữ nguyên tỷ lệ hình ảnh
                            />
                        </div>
                    </div>
                    {/* Thêm các logo khác tại đây */}
                    <div className="px-3">
                        <div className=" rounded-lg overflow-hidden">
                            <img
                                src="https://dlcdnimgs.asus.com/images/logo/logo-blue001.svg"
                                alt="Brand Logo"
                                className="w-full h-40 object-contain"
                            />
                        </div>
                    </div>
                    <div className="px-3">
                        <div className=" rounded-lg overflow-hidden">
                            <img
                                src="https://p4-ofp.static.pub/fes/cms/2022/11/14/h82es5y402b4rh1089sf86ay7n9sdl721044.png"
                                alt="Brand Logo"
                                className="w-full h-40 object-contain"
                            />
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="rounded-lg overflow-hidden">
                            <img
                                src="https://storage-asset.msi.com/frontend/imgs/logo.png"
                                alt="Brand Logo"
                                className="w-full h-40 object-contain"
                            />
                        </div>
                    </div>
                </Slider>
            </div>
        </div>
                );
                };

                export default BrandLogo;
