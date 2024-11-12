import React, { useState } from 'react';
import PopularTabs from './PopularTabs';

const data = {
    Ram: [
        { name: 'Laptop', price: '$1000', image: 'laptop.jpg' },
        { name: 'Smartphone', price: '$800', image: 'smartphone.jpg' },
        { name: 'Tablet', price: '$600', image: 'tablet.jpg' },
        { name: 'Smartwatch', price: '$200', image: 'smartwatch.jpg' },
        { name: 'Headphones', price: '$150', image: 'headphones.jpg' },
    ],
    CPU: [
        { name: 'Jacket', price: '$60', image: 'jacket.jpg' },
        { name: 'Shoes', price: '$120', image: 'shoes.jpg' },
        { name: 'Dress', price: '$70', image: 'dress.jpg' },
        { name: 'Handbag', price: '$90', image: 'handbag.jpg' },
        { name: 'Sunglasses', price: '$50', image: 'sunglasses.jpg' },
    ],
    Motherboard: [
        { name: 'T-shirt', price: '$30', image: 'tshirt.jpg' },
        { name: 'Backpack', price: '$50', image: 'backpack.jpg' },
        { name: 'Sweater', price: '$40', image: 'sweater.jpg' },
        { name: 'Jeans', price: '$60', image: 'jeans.jpg' },
        { name: 'Scarf', price: '$20', image: 'scarf.jpg' },
    ],
    GraphicsCard: [
        { name: 'Coat', price: '$100', image: 'coat.jpg' },
        { name: 'Boots', price: '$150', image: 'boots.jpg' },
        { name: 'Skirt', price: '$45', image: 'skirt.jpg' },
        { name: 'Gloves', price: '$25', image: 'gloves.jpg' },
        { name: 'Belt', price: '$35', image: 'belt.jpg' },
    ],
    Electronics: [
        { name: 'Watch', price: '$250', image: 'watch.jpg' },
        { name: 'Pants', price: '$50', image: 'pants.jpg' },
        { name: 'Earrings', price: '$30', image: 'earrings.jpg' },
        { name: 'Socks', price: '$10', image: 'socks.jpg' },
        { name: 'Tie', price: '$20', image: 'tie.jpg' },
    ],
};

const CategoryTabs = () => {
    const [selectedCategory, setSelectedCategory] = useState('Electronics');
    const categories = Object.keys(data);

    return (
        <>
            <div className=" items-center justify-center">
                <div className=" w-full max-w-7xl mx-auto">
                    <div className="p-6">
                        <PopularTabs categories={categories} onSelectCategory={setSelectedCategory}/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {data[selectedCategory].map((product, index) => (
                            <div key={index}
                                 className="product-card relative bg-white shadow-md rounded-lg p-4 text-center">
                                <div
                                    className="sale-badge absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">SALE!
                                </div>
                                <img src="https://i.pinimg.com/564x/00/a7/f7/00a7f7a8c0c30c7e3e2ed058694d3dc0.jpg"
                                     alt={product.name} className="w-full h-32 object-cover rounded-md mb-4"/>
                                <h3 className="text-sm font-semibold">{product.name}</h3>
                                <div className="price flex justify-center items-center space-x-2 mt-2">
                                    <span
                                        className="original-price line-through text-gray-500 text-xs">{product.price}</span>
                                    <span className="sale-price text-red-500 font-bold text-md">{product.price}</span>
                                </div>
                                <div className="rating text-yellow-500 mt-2 mb-3">★★★★★</div>
                                <button
                                    className="w-50 bg-orange-500 hover:bg-orange-600 p-5 text-white font-semibold py-1 rounded-lg transition duration-300">
                                    Thêm vào giỏ hàng
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CategoryTabs;