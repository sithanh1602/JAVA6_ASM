import React, { useEffect, useState } from "react";
import ProductCardNew from "../products/ProductCardNew";
import ProductVariantService from "../../services/ProductVariantService";
import { FaGetPocket  ,FaChevronDown, FaChevronUp } from "react-icons/fa";

const HotProducts = ({ view }) => {
  const [TopRatedProducts, setTopRatedProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5); 
  const [expanded, setExpanded] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ProductVariantService.getTopRatedProductsVariants();
        setTopRatedProducts(data);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm nỗi bật:", error);
      }
    };
    fetchData();
  }, []);

  const toggleShowMore = () => {
    if (expanded) {
      setVisibleCount(5); 
    } else {
      setVisibleCount(TopRatedProducts.length); 
    }
    setExpanded(!expanded);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mt-10 mb-4">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <FaGetPocket  className="text-yellow-500" />
          Sản phẩm nỗi bật
        </h2>
      </div>
      <div className="min-h-[400px]">
        <div
          className={`grid ${
            view === "grid" ? "grid-cols-2" : "grid-cols-1"
          } sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}
        >
          {TopRatedProducts.length > 0 ? (
            TopRatedProducts.slice(0, visibleCount).map((product, index) => (
              <ProductCardNew key={product.id} variant={product} index={index} />
            ))
          ) : (
            <p>Không có sản phẩm nỗi bật.</p>
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
  );
};

export default HotProducts;
