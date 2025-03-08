import React ,{ useState,useEffect } from 'react';
import { FaShippingFast, FaUndo, FaShieldAlt, FaHeadset, FaShoppingCart, FaSearch, FaHeart } from "react-icons/fa";
import { Carousel } from 'primereact/carousel';
import Banner1 from '../../assets/images/imageBanner/unnamed.webp';
import Banner2 from '../../assets/images/imageBanner/unnamed2.jpg';
import Banner3 from '../../assets/images/imageBanner/unnamed3.jpg';
import Bg150 from '../../assets/images/imageBanner/150x150.png';

const ProductList = () => {
    const responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '480px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    const images = [Banner1, Banner2, Banner3];
    const productsBanChay = [
        {
            id: 1,
            imageUrl: Bg150,
            discount: '-15%',
            name: 'MacBook Air 2018 128GB (Open Box)',
            currentPrice: '27,500,000₫',
            originalPrice: '32,500,000₫',
            category: 'Laptop',
        },
        {
            id: 2,
            imageUrl: Bg150,
            discount: '-20%',
            name: 'iPhone 12 Pro Max 256GB',
            currentPrice: '30,000,000₫',
            originalPrice: '37,000,000₫',
            category: 'Điện thoại',
        },
        {
            id: 3,
            imageUrl: Bg150,
            discount: '-10%',
            name: 'Samsung Galaxy S21 Ultra',
            currentPrice: '22,000,000₫',
            originalPrice: '24,500,000₫',
            category: 'Điện thoại',
        },
        {
            id: 4,
            imageUrl: Bg150,
            discount: '-25%',
            name: 'Sony WH-1000XM4',
            currentPrice: '7,500,000₫',
            originalPrice: '10,000,000₫',
            category: 'Tablet',
        },
        {
            id: 5,
            imageUrl: Bg150,
            discount: '-30%',
            name: 'Apple Watch Series 6',
            currentPrice: '10,500,000₫',
            originalPrice: '15,000,000₫',
            category: 'Điện thoại',
        },
        {
            id: 6,
            imageUrl: Bg150,
            discount: '-15%',
            name: 'MacBook Air 2018 128GB (Open Box)',
            currentPrice: '27,500,000₫',
            originalPrice: '32,500,000₫',
            category: 'Laptop',
        },
        {
            id: 7,
            imageUrl: Bg150,
            discount: '-15%',
            name: 'MacBook Air 2018 128GB (Open Box)',
            currentPrice: '27,500,000₫',
            originalPrice: '32,500,000₫',
            category: 'Laptop',
        },
        {
            id: 8,
            imageUrl: Bg150,
            discount: '-15%',
            name: 'MacBook Air 2018 128GB (Open Box)',
            currentPrice: '27,500,000₫',
            originalPrice: '32,500,000₫',
            category: 'Laptop',
        },
        {
            id: 9,
            imageUrl: Bg150,
            discount: '-15%',
            name: 'MacBook Air 2018 128GB (Open Box)',
            currentPrice: '27,500,000₫',
            originalPrice: '32,500,000₫',
            category: 'Laptop',
        },

    ];

    const [selectedCategory, setSelectedCategory] = useState('Điện thoại');
    const filteredProducts = productsBanChay.filter(
        (product) => product.category === selectedCategory
    );
    const ProductCardCategory = ({ product }) => (
        <div className="w-[210px] h-[348.56px] relative border border-[#e1e1e1] rounded-lg shadow-md overflow-hidden group">
            <img className="w-full h-[184px] object-cover" src={product.imageUrl} alt={product.name} />
            <div className="absolute top-4 right-4 bg-[#f14705] rounded-[3px]">
                <div className="px-2 py-1 text-center text-white text-sm font-semibold font-['Work Sans']">
                    {product.discount}
                </div>
            </div>
            <div className="w-full h-[36px] absolute bottom-[65px] left-0 px-4 text-[#0066cc] text-sm font-normal font-['Work Sans']">
                {product.name}
            </div>
            <div className="absolute bottom-[24px] left-4 text-[#ff3300] text-base font-normal font-['Work Sans']">
                {product.currentPrice}
            </div>
            <div className="absolute bottom-[4px] left-4 text-[#999999] text-sm font-normal font-['Work Sans'] line-through">
                {product.originalPrice}
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex justify-between gap-4">
                    <button className="bg-[#f1f1f1] p-2 rounded-full text-[#333] hover:bg-yellow-400">
                        <FaShoppingCart />
                    </button>
                    <button className="bg-[#f1f1f1] p-2 rounded-full text-[#333] hover:bg-yellow-400">
                        <FaSearch />
                    </button>
                    <button className="bg-[#f1f1f1] p-2 rounded-full text-[#333] hover:bg-yellow-400">
                        <FaHeart />
                    </button>
                </div>
            </div>
        </div>
    );
    return (
      <>
          {/* Start section footer  */}
          <div className="container mx-auto mb-10">
              {/* Tiêu đề */}
              <div className="h-[59px] relative border-b mb-4  border-[#e1e1e1]">
                  <div className="absolute left-[20px] top-1/2 transform -translate-y-1/2 flex items-center">
                      <FaShippingFast className="text-black text-[28px] mr-[10px]" />
                      <div className="w-[244.09px] h-[33px] text-black text-[28px] font-semibold font-['Work Sans'] leading-7">
                          Danh mục nổi bật
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                  {/* Banner lớn */}
                  <div className="col-span-9">
                      <div class="mt-3">
                          <Carousel
                              value={images}
                              itemTemplate={(image, index) => (
                                  <img
                                      className="rounded-lg w-full"
                                      src={image}
                                      alt={`banner-${index}`}
                                      style={{ height: '400px', objectFit: 'cover' }}
                                  />
                              )}
                              circular
                              autoplayInterval={3000}
                              showIndicators
                              showNavigators
                              responsiveOptions={responsiveOptions}
                          />
                      </div>
                  </div>

                  {/* Danh sách sản phẩm nổi bật */}
                  <div className="col-span-3 bg-white shadow-md rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-2">Nổi bật</h3>
                      <ul className="space-y-3">
                          {productsBanChay.slice(0, 3).map((product, index) => (
                              <li
                                  key={index}
                                  className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg shadow hover:shadow-lg transition"
                              >
                                  <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="w-16 h-16 object-cover rounded-md"
                                  />
                                  <div className="flex-1">
                                      <h4 className="text-sm font-medium">{product.name}</h4>
                                      <span className="block text-red-500 font-bold">{product.price}</span>
                                  </div>
                              </li>
                          ))}
                      </ul>

                      <button className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition">
                          Xem thêm
                      </button>
                  </div>
              </div>

              <div className="h-[87.39px] relative border-b border-[#e3e3e3]">
                  <div className="w-[270.23px] ml-4 h-[33px] left-0 top-[18.19px] absolute text-black text-[28px] font-semibold font-['Work Sans'] leading-7">
                      <div
                          className={`w-[101.88px] h-[38.39px] left-0 top-[16px] absolute rounded-[50px] cursor-pointer ${selectedCategory === 'Điện thoại' ? 'bg-[#000000]' : ''}`}
                          onClick={() => setSelectedCategory('Điện thoại')}
                      >
                          <div className={`w-[70.19px] h-4 left-[16px] top-[11px] absolute text-center ${selectedCategory === 'Điện thoại' ? 'text-white' : 'text-[#666666]'} text-sm font-normal font-['Work Sans'] leading-snug`}>
                              Điện thoại
                          </div>
                      </div>

                      <div
                          className={`w-20 h-[38.39px] left-[126.87px] top-[16px] absolute rounded-[50px] cursor-pointer ${selectedCategory === 'Laptop' ? 'bg-[#000000]' : ''}`}
                          onClick={() => setSelectedCategory('Laptop')}
                      >
                          <div className={`w-[48.35px] h-4 left-[16px] top-[11px] absolute text-center ${selectedCategory === 'Laptop' ? 'text-white' : 'text-[#666666]'} text-sm font-normal font-['Work Sans'] leading-snug`}>
                              Laptop
                          </div>
                      </div>

                      <div
                          className={`w-[73.77px] h-[38.39px] left-[231.87px] top-[16px] absolute rounded-[50px] cursor-pointer ${selectedCategory === 'Tablet' ? 'bg-[#000000]' : ''}`}
                          onClick={() => setSelectedCategory('Tablet')}
                      >
                          <div className={`w-[42.10px] h-4 left-[16px] top-[11px] absolute text-center ${selectedCategory === 'Tablet' ? 'text-white' : 'text-[#666666]'} text-sm font-normal font-['Work Sans'] leading-snug`}>
                              Tablet
                          </div>
                      </div>
                  </div>
                  <div className="w-[305.64px] h-[70.39px] left-[864.36px] top-0 absolute">

                  </div>
              </div>
              <div className="grid mt-3 p-4 mb-16 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-7">
                  {filteredProducts.slice(0, 5).map((product) => (
                      <ProductCardCategory key={product.id} product={product} />
                  ))}
              </div>

              {/* Tabs danh mục */}
          </div>
          {/* End sản phẩm bán chạy */}

      </>
    );
};

export default ProductList;
