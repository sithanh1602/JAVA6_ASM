import React ,{useState}from 'react';
import Bg150 from '../../assets/images/imageBanner/150x150.png';
import {  FaShoppingCart, FaSearch, FaHeart } from "react-icons/fa";

const NewProduct = () => {
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
    const ProductCard = ({ product }) => (
        <div className="w-[226px] h-[348.56px] relative border border-[#e1e1e1] rounded-lg shadow-md overflow-hidden group">
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
    return(
        <>
            {/* Start sản phẩm mới */}
            <div className="h-[87.39px] relative border-b border-[#e3e3e3]">
                <div className="w-[270.23px] h-[33px] left-0 top-[18.19px] absolute text-black text-[28px] font-semibold font-['Work Sans'] leading-7">
                    Sản phẩm mới
                </div>
                <div className="w-[305.64px] h-[70.39px] left-[864.36px] top-0 absolute">
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
            </div>
            <div className="grid mt-3 mb-16 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {/* End sản phẩm mới */}

        </>

    )
}
export default NewProduct;