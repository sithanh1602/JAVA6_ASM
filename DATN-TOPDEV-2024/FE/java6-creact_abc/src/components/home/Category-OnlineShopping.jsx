import React, { useState } from "react";
import imagess from '../../assets/images/imageProducts/NVIDIARTX3080.webp'

const categories = [
    "Bluetooth Speaker",
    "Digital Camera",
    "Electric Razor",
    "External Hard Drive",
    "Frying Pan",
    "Laser Printer",
    "Rice Cooker",
];

const products = [
    {
        id: 1,
        title: "TP-Link Smart WiFi Router Wireless Internet Router",
        oldPrice: "690,000đ",
        newPrice: "590,000đ",
        image: "router.jpg", // Replace with your image source
    },
    {
        id: 2,
        title: "Skullcandy Dime True In-Ear Earbuds – Golden",
        oldPrice: "500,000đ",
        newPrice: "390,000đ",
        image: "earbuds.jpg", // Replace with your image source
    },
    {
        id: 3,
        title: "Skullcandy Dime True In-Ear Earbuds – Golden",
        oldPrice: "500,000đ",
        newPrice: "390,000đ",
        image: "earbuds.jpg", // Replace with your image source
    },{
        id: 4,
        title: "Skullcandy Dime True In-Ear Earbuds – Golden",
        oldPrice: "500,000đ",
        newPrice: "390,000đ",
        image: "earbuds.jpg", // Replace with your image source
    },
    // Add more products here
];

const TabComponent = () => {
    const [activeTab, setActiveTab] = useState("hang-dau"); // Default tab
    const [activeCategory, setActiveCategory] = useState(0); // Default category

    // Content of each tab
    const renderContent = () => {
        const productList = products.map((product) => (
            <div key={product.id} className="product-card relative bg-white shadow-md rounded-lg p-4 text-center">
                <img src={product.image} alt={product.title} className="w-full h-32 object-cover rounded-md mb-4" />
                <h3 className="text-sm font-semibold">{product.title}</h3>
                <div className="price flex justify-center items-center space-x-2 mt-2">
                    <span className="original-price line-through text-gray-500 text-xs">{product.oldPrice}</span>
                    <span className="sale-price text-red-500 font-bold text-md">{product.newPrice}</span>
                </div>
                <div className="rating text-yellow-500 mt-2">★★★★★</div>
            </div>
        ));

        switch (activeTab) {
            case "hang-dau":
                return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{productList}</div>;
            case "ban-chay":
                return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{productList}</div>;
            default:
                return null;
        }
    };

    return (
        <>
            <div className=" items-center justify-center">
                <div className=" w-full max-w-7xl mx-auto">
                    <div className="container mx-auto mt-6">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b pb-2">
                            {/* Left: Main category */}
                            <h2 className="text-xl font-semibold text-orange-500">Danh Mục</h2>

                            {/* Center: Online Shopping */}
                            <h2 className="text-xl font-semibold">
                                Mua Sắm <span className="text-orange-500">Trực Tuyến</span>
                            </h2>

                            {/* Right: Tabs */}
                            <div>
                                {/* Tabs */}
                                <div className="flex space-x-4 border-b pb-2">
                                    <button
                                        className={`text-gray-600 hover:text-orange-500 transition ${
                                            activeTab === "hang-dau" ? "text-orange-500 font-semibold" : ""
                                        }`}
                                        onClick={() => setActiveTab("hang-dau")}
                                    >
                                        Hàng đầu
                                    </button>
                                    <button
                                        className={`text-gray-600 hover:text-orange-500 transition ${
                                            activeTab === "ban-chay" ? "text-orange-500 font-semibold" : ""
                                        }`}
                                        onClick={() => setActiveTab("ban-chay")}
                                    >
                                        Bán chạy
                                    </button>
                                </div>


                            </div>
                        </div>

                        <div className="flex mt-6">
                            {/* Sidebar */}
                            <div className="w-1/4">
                                <div className="bg-gray-100 p-4 rounded-lg shadow">
                                    {categories.map((category, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveCategory(index)}
                                            className={`block text-left w-full px-4 py-2 mb-2 rounded-lg ${
                                                activeCategory === index
                                                    ? "bg-orange-500 text-white"
                                                    : "bg-white text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={`w-3/4`}>
                                {/* Displayed content */}
                                <div className="mt-4">{renderContent()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>

    );
};

function App() {
    return <TabComponent/>;
}

export default App;