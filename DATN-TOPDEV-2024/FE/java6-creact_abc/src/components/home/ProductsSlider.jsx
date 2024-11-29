import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import images from '../../assets/images/imageProducts/Mainboard.webp';
import 'aos/dist/aos.css';

const ProductsSlider = () => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
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
            },]
    };

    return (
        <div className="container mx-auto px-4 py-1" data-aos="fade-down-right">


                {/* Right section: Slider */}
                <div className="w-4/4">
                    <div className="border border-gray-300 p-5 rounded-lg">
                        <Slider {...settings}>
                            {[1, 2, 3, 4].map((_, index) => (
                                <div key={index} className="px-3">
                                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                        <img
                                            src={images}
                                            className="w-full h-40 object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tên sản phẩm {index + 1}</h3>
                                            <p className="text-gray-800 mb-2">Mô tả sản phẩm {index + 1}</p>
                                            <p className="text-orange-600 font-semibold mb-4">Giá đ</p>
                                            <button
                                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition duration-300"
                                            >
                                                Thêm vào giỏ hàng
                                            </button>
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

const PrevArrow = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="absolute left-0 transform -translate-y-1/2 -translate-x-10 top-1/2 bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition duration-300 flex items-center w-10 h-10"
            style={{ zIndex: 1 }}
        >
            <span className="text-2xl">❮</span>
        </button>
    );
};

const NextArrow = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="absolute right-0 transform -translate-y-1/2 translate-x-10 top-1/2 bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center w-10 h-10"
            style={{ zIndex: 1 }}
        >
            <span className="text-2xl">❯</span>
        </button>
    );
};

export default ProductsSlider;
