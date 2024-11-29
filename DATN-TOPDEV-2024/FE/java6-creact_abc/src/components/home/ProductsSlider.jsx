import React, { useEffect, useState } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import 'aos/dist/aos.css';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faHeart, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import ProductService from '../../services/ProductService'; // Import ProductService
import { addProductToCart } from '../../services/CartService';

const ProductsSlider = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    // Fetch products directly from the ProductService
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsData = await ProductService.getAllProducts();
                setProducts(productsData); // Set fetched products to state
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = async (product) => {
        const userId = JSON.parse(localStorage.getItem('UserId')); // Get userId from localStorage

        if (!userId) {
            Swal.fire({
                title: 'Thông báo',
                text: 'Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng',
                icon: 'warning',
                confirmButtonText: 'Đăng nhập'
            }).then(() => {
                navigate('/login');
            });
            return;
        }

        try {
            await addProductToCart(userId, product.id, 1); // Pass userId first, then productId and quantity
            Swal.fire({
                title: 'Thành công',
                text: 'Thêm vào giỏ hàng thành công!',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Xem giỏ hàng',
                cancelButtonText: 'Tiếp tục mua sắm'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/cart');
                }
            });
        } catch (error) {
            Swal.fire('Lỗi', 'Lỗi khi thêm sản phẩm vào giỏ hàng', 'error');
        }
    };

    const handleFavorite = () => {
        // Implement the logic for adding the product to favorites
        Swal.fire({
            title: 'Thông báo',
            text: 'Sản phẩm đã được thêm vào danh sách yêu thích',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    };

    const handleShowProductDetails = (product) => {
        navigate(`/product/${product.id}`);
    };

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
        ]
    };

    return (
        <div className="container mx-auto px-4 py-1" data-aos="fade-down-right">
            <div className="w-full">
                <div className="border border-gray-300 p-5 rounded-lg">
                    <Slider {...settings}>
                        {products.map((product, index) => (
                            <div key={product.id} className="px-3">
                                <div className="bg-white shadow-lg rounded-lg overflow-hidden relative">
                                    <Link to={`/product/${product.id}`}>
                                        <div className="flex justify-center items-center">
                                            <img
                                                src={product.imageUrl || `https://placehold.co/200x200?text=Product+Image+${index + 1}`}
                                                className="w-full h-40 object-cover"
                                                alt={product.name || `Product Image ${index + 1}`}
                                            />
                                        </div>
                                    </Link>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                                        <p className="text-gray-800 mb-2">{product.stock}</p>
                                        <p className="text-orange-600 font-semibold mb-4">{formatPrice(product.price)}</p>
                                        <button
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition duration-300"
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            Thêm vào giỏ hàng
                                        </button>
                                    </div>
                                    <div
                                        className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-0 hover:opacity-60 transition-opacity duration-300 flex justify-center items-center space-x-4"
                                    >
                                        <FontAwesomeIcon
                                            icon={faCartPlus}
                                            className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-900"
                                            onClick={() => handleAddToCart(product)}
                                        />
                                        <FontAwesomeIcon
                                            icon={faHeart}
                                            className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-red-900"
                                            onClick={handleFavorite}
                                        />
                                        <FontAwesomeIcon
                                            icon={faExclamationCircle}
                                            className="text-white text-xl cursor-pointer transition-colors duration-300 ease-in-out hover:text-yellow-900"
                                            onClick={() => handleShowProductDetails(product)}
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

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

export default ProductsSlider;
