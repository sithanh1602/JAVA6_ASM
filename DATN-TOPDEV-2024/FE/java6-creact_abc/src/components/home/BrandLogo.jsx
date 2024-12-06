import React, { useEffect, useState } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import 'aos/dist/aos.css';
import AOS from 'aos';  // Import thư viện AOS
import amdLogo from '../../assets/images/imageBrands/AMDicon.png';
import kingston from '../../assets/images/imageBrands/Kingstonicon.png';
import samsung from '../../assets/images/imageBrands/Samsungicon.png';
import NVIDIA from '../../assets/images/imageBrands/NVIDIAicon.png';
import intel from '../../assets/images/imageBrands/Intelicon.png';

const BrandLogo = () => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 100,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 2000,
        cssEase: 'ease-in-out',
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

    const [scrollingUp, setScrollingUp] = useState(false);  // State để theo dõi khi cuộn lên

    useEffect(() => {
        AOS.init({ duration: 1000 });  // Khởi tạo AOS với hiệu ứng kéo dài 1 giây
    }, []);

    useEffect(() => {
        let lastScrollTop = 0;  // Để lưu vị trí cuộn trước đó
        const handleScroll = () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;  // Vị trí cuộn hiện tại
            if (currentScroll > lastScrollTop) {
                setScrollingUp(false);  // Cuộn xuống
            } else {
                setScrollingUp(true);  // Cuộn lên
            }
            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Đảm bảo không bị âm
        };

        window.addEventListener('scroll', handleScroll);  // Lắng nghe sự kiện cuộn trang

        // Cleanup để ngừng lắng nghe sự kiện khi component bị unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`items-center justify-center ${scrollingUp ? 'opacity-0' : 'opacity-100'}`} data-aos="fade-up-right">
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
                    <div className="px-3">
                        <div className="rounded-lg overflow-hidden">
                            <img
                                src={amdLogo}
                                alt="Brand Logo"
                                className="w-full h-40 object-contain"
                            />
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="rounded-lg overflow-hidden">
                            <img
                                src={kingston}
                                alt="Brand Logo"
                                className="w-full h-40 object-contain"
                            />
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="rounded-lg overflow-hidden">
                            <img
                                src={samsung}
                                alt="Brand Logo"
                                className="w-full h-40 object-contain"
                            />
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="rounded-lg overflow-hidden">
                            <img
                                src={NVIDIA}
                                alt="Brand Logo"
                                className="w-full h-40 object-contain"
                            />
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="rounded-lg overflow-hidden">
                            <img
                                src={intel}
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
