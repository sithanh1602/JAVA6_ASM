import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import images from '../../assets/images/imageProducts/Mainboard.webp'
import imagess from '../../assets/images/imageProducts/NVIDIARTX3080.webp'


const ProductsSlider = ({products}) => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <NextArrow/>,
        prevArrow: <PrevArrow/>,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex">
                {/* Left section: Image */}
                <div className="relative w-1/5 px-3">
                    <div
                        className="relative bg-white bg-opacity-90 border border-gray-300 rounded-lg shadow-lg p-4 text-center">
        <span
            className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            NEW
        </span>
                        <h2 className="text-sm font-semibold text-gray-800 mt-6">
                            HIỆU SUẤT CAO VÀ TIỆN ÍCH
                        </h2>
                        <p className="text-orange-500 text-xl font-bold mt-1">Ưu đãi 40%</p>
                        <a href="#"
                           className="inline-block mt-3 px-4 py-1 border border-orange-500 text-orange-500 font-semibold rounded hover:bg-orange-500 hover:text-white transition duration-200">
                            KHÁM PHÁ →
                        </a>
                        <img
                            src={imagess}
                            alt="Product Image"
                            className="w-full h-45 mt-4 object-cover rounded-lg"
                        />
                    </div>
                </div>


                {/* Right section: Slider */}
                <div className="w-4/5">
                    <div className="border border-gray-300 p-5 rounded-lg ">
                        <Slider {...settings}>
                            {products.map((product, index) => (
                                <div key={index} className="px-3">
                                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                        <img
                                            src={images}
                                            alt={product.name}
                                            className="w-full h-40 object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                                            <p className=" text-gray-800 mb-2">{product.describe}</p>
                                            <p className="text-orange-600 font-semibold mb-4">{product.price}đ</p>
                                            <button
                                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition duration-300">
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
        </div>
    );
};
const PrevArrow = ({onClick}) => {
    return (
        <button
            onClick={onClick}
            className="absolute left-0 transform -translate-y-1/2 -translate-x-10 top-1/2 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition duration-300 flex items-center  w-10 h-10"
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
            className="absolute right-0 transform -translate-y-1/2 translate-x-10 top-1/2 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center w-10 h-10"
            style={{zIndex: 1}}
        >
            <span className="text-2xl">❯</span>
        </button>
    );
};

export default ProductsSlider;
