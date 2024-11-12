import React, { useState } from 'react';
import Tabs from './Tabs';
import ProductsSlider from './ProductsSlider';

const data = {
    Ram: [
        { name: 'Laptop', price: '$1000', image: 'laptop.jpg' },
        { name: 'Smartphone', price: '$800', image: 'smartphone.jpg' },
        { name: 'Tablet', price: '$600', image: 'tablet.jpg' },
        { name: 'Smartwatch', price: '$200', image: 'smartwatch.jpg' },
        { name: 'Headphones', price: '$150', image: 'headphones.jpg' },
        { name: 'Camera', price: '$500', image: 'camera.jpg' },
        { name: 'Bluetooth Speaker', price: '$100', image: 'speaker.jpg' },
    ],
    CPU: [
        { name: 'Jacket', price: '$60', image: 'jacket.jpg' },
        { name: 'Shoes', price: '$120', image: 'shoes.jpg' },
        { name: 'Dress', price: '$70', image: 'dress.jpg' },
        { name: 'Handbag', price: '$90', image: 'handbag.jpg' },
        { name: 'Sunglasses', price: '$50', image: 'sunglasses.jpg' },
        { name: 'Watch', price: '$250', image: 'watch.jpg' },
        { name: 'Hat', price: '$25', image: 'hat.jpg' },
    ],
    Motherboard:[
        { name: 'T-shirt', price: '$30', image: 'tshirt.jpg' },
        { name: 'Backpack', price: '$50', image: 'backpack.jpg'},
        { name: 'Sweater', price: '$40', image: 'sweater.jpg' },
        { name: 'Jeans', price: '$60', image: 'jeans.jpg' },
        { name: 'Scarf', price: '$20', image: 'scarf.jpg' },
    ],
    GraphicsCard:[
        { name: 'Coat', price: '$100', image: 'coat.jpg' },
        { name: 'Boots', price: '$150', image: 'boots.jpg' },
        { name: 'Skirt', price: '$45', image: 'skirt.jpg' },
        { name: 'Gloves', price: '$25', image: 'gloves.jpg' },
        { name: 'Belt', price: '$35', image: 'belt.jpg' },
    ],

    Electronics:[
        { name: 'Watch', price: '1,000,000', describe:"describe 1", image: 'watch.jpg' },
        { name: 'Pants', price: '11,000,00', describe:"describe 2", image: 'pants.jpg' },
        { name: 'Earrings', price: '8,000,000', describe:"describe 3", image: 'earrings.jpg' },
        { name: 'Socks', price: '22,000,000', describe:"describe 4", image: 'socks.jpg' },
        { name: 'Tie', price: '18,000,000', describe:"describe 5", image: 'tie.jpg' },
    ],
};

const CategoryTabs = () => {
    const [selectedCategory, setSelectedCategory] = useState('Electronics');
    const categories = Object.keys(data);

    return (
        <div className="p-6">
            <div className=" items-center justify-center">
                <div className=" w-full max-w-7xl mx-auto">
                    <Tabs categories={categories} onSelectCategory={setSelectedCategory}/>
                    <ProductsSlider products={data[selectedCategory]}/>
                </div>
            </div>
        </div>
                );
                };

                export default CategoryTabs;
