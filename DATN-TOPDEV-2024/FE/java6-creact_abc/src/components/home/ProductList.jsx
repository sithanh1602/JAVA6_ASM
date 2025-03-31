import React, { useState, useEffect } from "react";
import {
  FaShippingFast,
  FaUndo,
  FaShieldAlt,
  FaHeadset,
  FaShoppingCart,
  FaSearch,
  FaHeart,
} from "react-icons/fa";
import { Carousel } from "primereact/carousel";
import ProductCardNew from "../products/ProductCard";
import ProductVariantService from "../../services/ProductVariantService";
import CategoryService from "../../services/CategoryService";
import Banner1 from "../../assets/images/imageBanner/unnamed.webp";
import Banner2 from "../../assets/images/imageBanner/unnamed2.jpg";
import Banner3 from "../../assets/images/imageBanner/unnamed3.jpg";
import { FaFire, FaChevronDown, FaChevronUp } from "react-icons/fa";

const ProductList = ({ view }) => {
  const responsiveOptions = [
    { breakpoint: "1024px", numVisible: 3, numScroll: 1 },
    { breakpoint: "768px", numVisible: 2, numScroll: 1 },
    { breakpoint: "480px", numVisible: 1, numScroll: 1 },
  ];
  const images = [Banner1, Banner2, Banner3];

  const [TopRatedProducts, setTopRatedProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const topProducts = await ProductVariantService.getAllProductVariants();
        console.log("Dữ liệu sản phẩm từ API:", topProducts);
        setTopRatedProducts(topProducts || []);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        setTopRatedProducts([]);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesData = await CategoryService.getTop5Categories();
        console.log("Dữ liệu danh mục từ API:", categoriesData);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        setCategories([]);
      }
    };

    fetchTopProducts();
    fetchCategories();
  }, []);

  const toggleShowMore = () => {
    if (expanded) {
      setVisibleCount(5);
    } else {
      setVisibleCount(20);
    }
    setExpanded(!expanded);
  };

  // Lọc sản phẩm theo categoryName
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProducts(TopRatedProducts);
    } else {
      const filtered = TopRatedProducts.filter(
        (product) => product?.categoryName === selectedCategory
      );
      setFilteredProducts(filtered);
      console.log("Sản phẩm đã lọc theo categoryName:", filtered); // Debug kết quả lọc
    }
  }, [selectedCategory, TopRatedProducts]);

  // Chọn category.name thay vì category.id
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  return (
    <div className="container mx-auto mb-10">
      <div className="h-[59px] relative border-b mb-4 border-[#e1e1e1]">
        <div className="absolute left-[20px] top-1/2 transform -translate-y-1/2 flex items-center">
          <FaShippingFast className="text-black text-[28px] mr-[10px]" />
          <div className="w-[244.09px] h-[33px] text-black text-[28px] font-semibold font-['Work Sans'] leading-7">
            Danh mục nổi bật
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-9">
          <div className="mt-3">
            <Carousel
              value={images}
              itemTemplate={(image, index) => (
                <img
                  className="rounded-lg w-full"
                  src={image}
                  alt={`banner-${index}`}
                  style={{ height: "300px", objectFit: "cover" }}
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
        <div className="col-span-3 bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
          <div className="flex flex-col space-y-2 w-4/5">
            <button
              className={`px-4 py-2 w-full text-sm font-semibold rounded-md transition-all duration-300 ${
                selectedCategory === "all"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white"
              }`}
              onClick={() => setSelectedCategory("all")}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.id} // Dùng id làm key để đảm bảo tính duy nhất
                className={`px-4 py-2 w-full text-sm font-semibold rounded-md transition-all duration-300 ${
                  selectedCategory === category.name
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white"
                }`}
                onClick={() => handleCategoryClick(category.name)} // Chọn theo name
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="flex justify-between items-center mt-10 mb-4"></div>
        <div className="min-h-[400px]">
          <div
            className={`grid ${
              view === "grid" ? "grid-cols-2" : "grid-cols-1"
            } sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.slice(0, visibleCount).map((product, index) =>
                product && product.id ? (
                  <ProductCardNew
                    key={product.id}
                    variant={product}
                    index={index}
                  />
                ) : null
              )
            ) : (
              <p>Không có sản phẩm bán chạy.</p>
            )}
          </div>
        </div>
        {TopRatedProducts.length > 5 && (
          <div className="flex justify-center mt-4">
            <button
              className="text-blue-400 px-4 py-2 rounded-md hover:text-blue-600 flex items-center gap-2"
              onClick={toggleShowMore}
            >
              {expanded ? (
                <>
                  Ẩn bớt <FaChevronUp />
                </>
              ) : (
                <>
                  Xem thêm <FaChevronDown />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;