import React, { useEffect, useState } from "react";
import ProductCardNew from "../products/ProductCardNew";
import ProductVariantService from "../../services/ProductVariantService";
import CategoryService from "../../services/CategoryService";
import {
  MdFiberNew,
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";

const NewProduct = ({ view }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newProducts, setNewProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false); // Trạng thái xem thêm / ẩn bớt
  const [visibleCount, setVisibleCount] = useState(5); // Hiển thị 5 sản phẩm ban đầu

  // Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getAllCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Không thể tải danh mục sản phẩm");
      }
    };
    fetchCategories();
  }, []);

  // Lấy danh sách sản phẩm mới
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ProductVariantService.getTopNewestVariants();
        setNewProducts(data || []);
        // Ban đầu hiển thị tất cả sản phẩm
        setFilteredProducts(data || []);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        setNewProducts([]);
        setFilteredProducts([]);
      }
    };
    fetchData();
  }, []); // Chỉ chạy 1 lần khi component mount

  // Lọc sản phẩm khi danh mục thay đổi
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProducts(newProducts);
    } else {
      const filtered = newProducts.filter(
        (product) => product.product.category.id === selectedCategory
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, newProducts]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };
  const toggleShowMore = () => {
    if (expanded) {
      setVisibleCount(5); 
    } else {
      setVisibleCount(newProducts.length); 
    }
    setExpanded(!expanded);
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mt-10 mb-4 flex items-center gap-2">
        <MdFiberNew className="text-red-500" /> Sản phẩm mới
      </h2>

      <div className="flex space-x-4 overflow-x-auto pb-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-semibold transition-all ${
            selectedCategory === "all"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-600 hover:text-red-500"
          }`}
          onClick={() => handleCategoryClick("all")}>
          Tất cả
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 text-sm font-semibold transition-all ${
              selectedCategory === category.id
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
            onClick={() => handleCategoryClick(category.id)}>
            {category.name}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="min-h-[400px]">
        <div
          className={`grid ${
            view === "grid" ? "grid-cols-2" : "grid-cols-1"
          } sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}>
          {filteredProducts.length > 0 ? (
            filteredProducts
              .slice(0, expanded ? filteredProducts.length : 5) // Hiển thị tất cả hoặc 5 sản phẩm
              .map((product, index) => (
                <ProductCardNew
                  key={product.id}
                  variant={product}
                  index={index}
                />
              ))
          ) : (
            <p>Không có sản phẩm.</p>
          )}
        </div>
      </div>
      {newProducts.length > 5 && (
        <div className="flex justify-center mt-4">
          <button
            className="text-blue-400 px-4 py-2 rounded-md hover:text-blue-600 flex items-center gap-2"
            onClick={toggleShowMore}>
            {expanded ? (
              <>
                Ẩn bớt <MdKeyboardDoubleArrowUp />
              </>
            ) : (
              <>
                Xem thêm <MdKeyboardDoubleArrowDown />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewProduct;
