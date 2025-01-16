import React, { useEffect, useState } from "react";
import { Tabs, Tab, Spinner } from "@nextui-org/react";
import ProductService from "../../../services/ProductService";
import CategoryService from "../../../services/CategoryService";
import ProductCard from "../../products/ProductCard";
import { AiOutlineAppstore } from 'react-icons/ai';
import "aos/dist/aos.css";

const TabProduct = () => {
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState({});  // Caching all products by categoryId
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const allCategories = await CategoryService.getAllCategories();
            setCategories(allCategories);
            if (allCategories.length > 0) {
                const firstCategoryId = allCategories[0].id;
                setSelectedCategoryId(firstCategoryId);
                fetchProductsByCategory(firstCategoryId);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProductsByCategory = async (categoryId) => {
        if (allProducts[categoryId]) {
            // If products for this category are already cached, don't fetch them again
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const productsByCategory = await ProductService.getProductsByCategoryId(categoryId);
            setAllProducts((prev) => ({
                ...prev,
                [categoryId]: productsByCategory,  // Store the products in the cache
            }));
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
        }
        setLoading(false);
    };

    const handleTabChange = (key) => {
        const categoryId = parseInt(key);
        setSelectedCategoryId(categoryId);
        fetchProductsByCategory(categoryId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col mt-8 border-3 bg-white p-10 relative">
            <span className="absolute -top-3 left-4 px-2 text-xm flex items-center bg-white rounded-lg text-2xl font-normal ">
                <AiOutlineAppstore className="mr-2  text-blue-950" size={25}/>
                <a>Sản phẩm phổ biến</a>
            </span>
            <Tabs
                aria-label="Product Categories"
                selectedKey={selectedCategoryId?.toString()}
                onSelectionChange={handleTabChange}
                classNames={{
                    base: "transition-all duration-300 ease-in-out",
                    tabList: "flex space-x-4",
                    tab: "px-2 py-2 rounded-md cursor-pointer",
                    tabContent: "transition-opacity duration-300",
                    panel: "p-4",
                }}
            >
                {categories.map((category) => (
                    <Tab
                        key={category.id}
                        title={
                            <div className="flex items-center">
                                <img
                                    src={category.image} // Replace with your actual image URL field
                                    alt={category.name}
                                    className="w-6 h-6 rounded-full mr-2"
                                />
                                <span>{category.name}</span>
                            </div>
                        }
                        value={category.id.toString()}
                    >
                        <div
                            className={`${
                                selectedCategoryId === category.id
                                    ? "opacity-100"
                                    : "opacity-0"
                            } transition-opacity duration-300`}
                        >
                            {selectedCategoryId === category.id && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                                     data-aos="fade-up">
                                    {allProducts[category.id] && allProducts[category.id].length > 0 ? (
                                        allProducts[category.id].map((product) => (
                                            <ProductCard key={product.id} product={product}/>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <p className="text-gray-500">Hiện chưa có sản phẩm trong danh mục này.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </div>
    );
};

export default TabProduct;
