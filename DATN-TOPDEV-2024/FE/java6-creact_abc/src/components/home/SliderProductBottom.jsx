import React, { useEffect, useState } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import images from '../../assets/images/imageProducts/image6.webp';
import 'aos/dist/aos.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCartPlus, faExclamationCircle, faHeart} from "@fortawesome/free-solid-svg-icons";
import AOS from 'aos';  // Import thư viện AOS
const SliderProductBottom = () => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 6, // Hiển thị 6 sản phẩm trên màn hình lớn
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024, // Màn hình tablet
                settings: {
                    slidesToShow: 3, // Hiển thị 3 sản phẩm
                },
            },
            {
                breakpoint: 768, // Màn hình nhỏ
                settings: {
                    slidesToShow: 2, // Hiển thị 2 sản phẩm
                },
            },
            {
                breakpoint: 480, // Màn hình điện thoại
                settings: {
                    slidesToShow: 1, // Hiển thị 1 sản phẩm
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
        <div className={`container mx-auto px-4 py-1 mt-10 ${scrollingUp ? 'opacity-0' : 'opacity-100'}`} data-aos="fade-down-right">
            {/* Right section: Slider */}
            <div className="w-full">
                <div className="border border-orange-300 p-5 rounded-lg">
                    <Slider {...settings}>
                        {[1, 2, 3, 4, 5, 6].map((_, index) => (

                            <div className="px-2">
                                <div className=" rounded-lg overflow-hidden relative ">
                                    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                                        <div className="relative">
                                            <img src={images} alt="Product Image"
                                                 className="w-full h-45 object-cover rounded"/>
                                        </div>
                                        <h3 className="mt-2 text-sm font-semibold">
                                            Ram DDR4 Gigabyte 16G/3200 Aorus RGB (2x 8GB) (GP-ARS16G32)
                                        </h3>
                                        <div className="flex items-center mt-2 text-yellow-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current"
                                                 viewBox="0 0 20 20">
                                                <path
                                                    d="M10 15l-5.878 3.09 1.122-6.545L0 6.545l6.561-.954L10 0l3.439 5.591L20 6.545l-5.244 5.09L15.878 18z"/>
                                            </svg>
                                            <span className="ml-1 text-gray-600">(1)</span>
                                        </div>
                                        <div className="mt-2">
                                            <span className="text-red-500 font-bold">390,000₫</span>
                                            <span className="text-gray-500 line-through ml-2">500,000₫</span>
                                        </div>
                                    </div>
                                    <div
                                        className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-0 hover:opacity-60 transition-opacity duration-300 flex justify-center items-center space-x-4 ">
                                        <FontAwesomeIcon
                                            icon={faCartPlus}
                                            className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-900"

                                        />
                                        <FontAwesomeIcon
                                            icon={faHeart}
                                            className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-red-900"

                                        />
                                        <FontAwesomeIcon
                                            icon={faExclamationCircle}
                                            className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-yellow-900"

                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};

const PrevArrow = ({onClick}) => {
    return (
        <button
            onClick={onClick}
            className="absolute left-0 transform -translate-y-1/2 -translate-x-10 top-1/2 bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition duration-300 flex items-center w-10 h-10"
            style={{zIndex: 1}}
        >
            <span className="text-2xl">❮</span>
        </button>
    );
};

const NextArrow = ({onClick}) => {
    return (
        <button
            onClick={onClick}
            className="absolute right-0 transform -translate-y-1/2 translate-x-10 top-1/2 bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center w-10 h-10"
            style={{zIndex: 1}}
        >
            <span className="text-2xl">❯</span>
        </button>
    );
};

export default SliderProductBottom;
