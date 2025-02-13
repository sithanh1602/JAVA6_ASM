import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import getAllProductVariants from "../../services/ProductVariantService";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaSearch } from "react-icons/fa";
import {Spinner, Slider, Checkbox, Input} from "@nextui-org/react";

const ProductList = ({ currentPage, productsPerPage, view, sortOption }) => {
    const [variants, setVariants] = useState([]);
    const [filteredVariants, setFilteredVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isFiltering, setIsFiltering] = useState(false);
    const [priceRange, setPriceRange] = useState([1000, 20000000]); // Giá tối thiểu và tối đa
    const [selectedColors, setSelectedColors] = useState([]);
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);
    const colors = [
        { name: "Đen", code: "#000000" },
        { name: "Xanh Navy", code: "#1E2A78" },
        { name: "Xanh Ngọc", code: "#1CA7A1" },
        { name: "Trắng", code: "#F2F2F2" },
        { name: "Nâu", code: "#B68D6E" },
        { name: "Xanh Biển", code: "#2DB5E0" },
        { name: "Đỏ", code: "#A32222" },
        { name: "Vàng", code: "#FFC107" },
    ];

    useEffect(() => {
        const fetchVariants = async () => {
            try {
                const fetchedVariants = await getAllProductVariants();
                const sortedVariants = [...fetchedVariants].sort((a, b) => {
                    if (sortOption === "priceAsc") return a.price - b.price;
                    if (sortOption === "priceDesc") return b.price - a.price;
                    return 0;
                });
                setVariants(sortedVariants);
                setFilteredVariants(sortedVariants);
                setLoading(false);
            } catch (err) {
                setError("Lỗi khi lấy dữ liệu biến thể sản phẩm");
                setLoading(false);
            }
        };
        fetchVariants();
    }, [sortOption]);

    useEffect(() => {
        setIsFiltering(true);

        const timer = setTimeout(() => {
            let filtered = variants.filter((variant) => {
                const variantName = variant.nameVariants || "";
                return variantName.toLowerCase().includes(searchQuery.toLowerCase());
            });

            if (selectedBrands.length > 0) {
                filtered = filtered.filter((variant) => selectedBrands.includes(variant.product.brand.name));
            }

            if (selectedCategories.length > 0) {
                filtered = filtered.filter((variant) => selectedCategories.includes(variant.product.category.name));
            }

            // Lọc theo giá
            filtered = filtered.filter(
                (variant) => variant.price >= priceRange[0] && variant.price <= priceRange[1]
            );

            setFilteredVariants(filtered);
            setIsFiltering(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedBrands, selectedCategories, priceRange, variants]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleBrandChange = (event) => {
        const { value, checked } = event.target;
        setSelectedBrands((prev) =>
            checked ? [...prev, value] : prev.filter((brand) => brand !== value)
        );
    };

    const handleCategoryChange = (event) => {
        const { value, checked } = event.target;
        setSelectedCategories((prev) =>
            checked ? [...prev, value] : prev.filter((category) => category !== value)
        );
    };

    const handlePriceChange = (value) => {
        setPriceRange(value);
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const indexOfLastVariant = currentPage * productsPerPage;
    const indexOfFirstVariant = indexOfLastVariant - productsPerPage;
    const currentVariants = filteredVariants.slice(indexOfFirstVariant, indexOfLastVariant);

    return (
        <div className="flex">
            {/* Bộ lọc bên trái */}
            <div className="w-1/6 p-4 border bg-white">
                <h3 className="font-bold mb-2">THƯƠNG HIỆU</h3>
                <div>
                    <label>
                        <Checkbox type="checkbox" value="Intel" onChange={handleBrandChange}/> Intel
                    </label>
                    <br/>
                    <label>
                        <Checkbox type="checkbox" value="AMD" onChange={handleBrandChange}/> AMD
                    </label>
                    <br/>
                    <label>
                        <Checkbox type="checkbox" value="NVIDIA" onChange={handleBrandChange}/> NVIDIA
                    </label>
                    <br/>
                    <label>
                        <Checkbox type="checkbox" value="Kingston" onChange={handleBrandChange}/> Kingston
                    </label>
                    <br/>
                    <label>
                        <Checkbox type="checkbox" value="Samsung" onChange={handleBrandChange}/> Samsung
                    </label><br/>
                    <label>
                        <Checkbox type="checkbox" value="HP" onChange={handleBrandChange}/> HP
                    </label><br/>
                    <label>
                        <Checkbox type="checkbox" value="Asus" onChange={handleBrandChange}/> Asus
                    </label><br/>
                    <label>
                        <Checkbox type="checkbox" value="AULA" onChange={handleBrandChange}/> AULA
                    </label>
                </div>
                <h3 className="font-bold mt-4 mb-2">LOẠI</h3>
                <div>
                    <label>
                        <Checkbox type="checkbox" value="CPU" onChange={handleCategoryChange}/> CPU
                    </label>
                    <br/>
                    <label>
                        <Checkbox type="checkbox" value="GPU" onChange={handleCategoryChange}/> GPU
                    </label>
                    <br/>
                    <label>
                        <Checkbox type="checkbox" value="RAM" onChange={handleCategoryChange}/> RAM
                    </label>
                    <br/>
                    <label>
                        <Checkbox type="checkbox" value="Mainboard" onChange={handleCategoryChange}/> Mainboard
                    </label>
                    <br/>
                    <label>
                        <Checkbox type="checkbox" value="SSD" onChange={handleCategoryChange}/> SSD
                    </label><br/>
                    <label>
                        <Checkbox type="checkbox" value="Chuột" onChange={handleCategoryChange}/> Chuột
                    </label><br/>
                    <label>
                        <Checkbox type="checkbox" value="Màn hình" onChange={handleCategoryChange}/> Màn hình
                    </label><br/>
                    <label>
                        <Checkbox type="checkbox" value="Nguồn" onChange={handleCategoryChange}/> Nguồn
                    </label>
                </div>

                {/* Bộ lọc giá */}
                <h3 className="font-bold mt-4 mb-2">GIÁ</h3>
                <Slider
                    className="max-w-md"
                    maxValue={20000000}
                    minValue={1000}
                    step={1000}
                    value={priceRange}
                    onChange={handlePriceChange}
                    formatOptions={{style: 'currency', currency: 'VND'}}
                />
                <p className="mt-2 text-sm">
                    Giá: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} VND
                </p>
                <h3 className="font-bold mb-2 pt-8">Màu sắc</h3>
                <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                        <div
                            key={color.code}
                            className={`w-8 h-8 rounded-md border cursor-pointer ${
                                selectedColors.includes(color.code)
                                    ? "ring-2 ring-black"
                                    : ""
                            }`}
                            style={{backgroundColor: color.code}}
                            // onClick={() => handleSelectColor(color.code)}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="w-3/2 pl-2">
                <div className="search-filter-container mb-4 flex justify-start items-center space-x-4"
                     data-aos="fade-down">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm.........."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="border-white bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none p-2 w-full sm:w-1/3 transition duration-200"
                    />
                    <FaSearch size={18}/>
                </div>
                <div className="relative min-h-[400px]">
                    {isFiltering && (
                        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50 z-10">
                            <Spinner size="lg" color="primary"/>
                        </div>
                    )}
                    <div
                        className={`grid ${view === "grid" ? "grid-cols-2" : "grid-cols-1"} sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}>
                        {currentVariants.length > 0 ? (
                            currentVariants.map((variant) => (
                                <ProductCard key={variant.idVariants} variant={variant}/>
                            ))
                        ) : (
                            <p>Không có sản phẩm nào.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
