import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductService from "../../../services/ProductService";
import { addProductToCart, getAllCartItemsForUser, removeProductFromCart, updateCartItemQuantity } from "../../../services/CartService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";


const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [brand, setBrand] = useState(null);
  const [category, setCategory] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productData = await ProductService.getProductDetail(productId);
        if (productData && productData.length > 0) {
          setProduct(productData[0]);
          setVariants(productData);
          const firstVariant = productData[0];
          setSelectedVariant(firstVariant);
          console.log("id_variant", firstVariant);
          const brand = await ProductService.getBrand(productId);
          setBrand(brand);
          const category = await ProductService.getCategory(productId);
          setCategory(category);
          const fetchedImages =
            await ProductService.getImagesByProductVariantId(
              firstVariant.variantId
            );
          if (fetchedImages) {
            setImages(fetchedImages);
            setMainImage(
              fetchedImages.length > 0 ? fetchedImages[0].image : null
            );
          }
        } else {
          const productVariants = await ProductService.getProduct(productId);
          if (productVariants && productVariants.length > 0) {
            setVariants(productVariants);
            const firstVariant = productVariants[0]; // Lấy biến thể đầu tiên
            console.log(firstVariant);
            setSelectedVariant(firstVariant);
            setProduct(firstVariant);
            const brand = await ProductService.getBrand(productId);
            setBrand(brand);
            const category = await ProductService.getCategory(productId);
            setCategory(category);
            const fetchedImages =
              await ProductService.getImagesByProductVariantId(
                firstVariant.idVariants
              );
            if (fetchedImages) {
              setImages(fetchedImages);
              setMainImage(
                fetchedImages.length > 0 ? fetchedImages[0].image : null
              );
            }
          } else {
            setProduct(null);
          }
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleImageChange = (index) => {
    setMainImageIndex(index);
    setMainImage(images[index]?.image || null);
  };

  const handlePreviousImage = () => {
    const newIndex =
      mainImageIndex > 0 ? mainImageIndex - 1 : images.length - 1;
    handleImageChange(newIndex);
  };

  const handleNextImage = () => {
    const newIndex =
      mainImageIndex < images.length - 1 ? mainImageIndex + 1 : 0;
    handleImageChange(newIndex);
  };

  const handleVariantSelect = async (variant) => {
    setSelectedVariant(variant);
    console.log("id_variant", variant);
    const fetchedImages = await ProductService.getImagesByProductVariantId(
      variant.variantId
    );
    if (fetchedImages) {
      setImages(fetchedImages);
      setMainImage(fetchedImages.length > 0 ? fetchedImages[0].image : null);
      setMainImageIndex(0);
    }
  };

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10 text-lg">
        Error: {error}
      </div>
    );
  }

  if (!product && variants.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500 text-lg">Loading...</div>
    );
  }

  const productName = selectedVariant
    ? selectedVariant.name
    : "Product not found";

  // Giải mã token và lấy userId từ cookie
  const getUserIdFromToken = () => {
    const token = Cookies.get("token"); // Lấy token từ cookie
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Giải mã token
        console.log("Token giải mã:", decodedToken); // Kiểm tra cấu trúc
        return decodedToken.userId; // Trả về userId từ token
      } catch (err) {
        console.error("Token không hợp lệ:", err);
        return null;
      }
    }
    return null;
  };
  

  const handleAddToCart = async () => {
    const userId = getUserIdFromToken(); // Lấy userId từ token
    if (!userId) {
      alert("Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.");
      return;
    }

    try {
      const cartItem = {
        userId: userId,
        productVariantId: selectedVariant.variantId||selectedVariant.idVariants, // ID của biến thể sản phẩm
        quantity: 1, // Số lượng mặc định là 1, có thể điều chỉnh theo nhu cầu
      };

      await addProductToCart(cartItem.userId,cartItem.productVariantId,cartItem.quantity);  // Gọi API thêm sản phẩm vào giỏ hàng
      alert("Sản phẩm đã được thêm vào giỏ hàng.");
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", err);
      alert("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="container mx-auto p-5 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative w-full h-96 bg-gray-100 border rounded-lg overflow-hidden flex items-center justify-center shadow-lg">
            <img
              src={
                mainImage || selectedVariant.image || selectedVariant.imageUrl
              }
              alt={selectedVariant.attributes || "No attributes"}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <button
              onClick={handlePreviousImage}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-2xl transition duration-300 hover:text-gray-700"
            >
              {"<"}
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black text-2xl transition duration-300 hover:text-gray-700"
            >
              {">"}
            </button>
          </div>
          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`w-20 h-20 border rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform ${
                    index === mainImageIndex ? "border-blue-500" : ""
                  }`}
                  onClick={() => handleImageChange(index)}
                >
                  <img
                    src={image.image}
                    alt={`Sản phẩm ${image.id}`}
                    className="w-full h-full object-cover transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="p-4 border rounded-lg h-32 overflow-y-auto shadow">
            <h2 className="text-lg font-bold mb-2">Mô tả sản phẩm</h2>
            <p className="text-sm text-gray-600">
              {selectedVariant.description || "Không có mô tả"}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between h-[500px]">
          <div>
            <h1 className="text-2xl font-bold mb-2">{productName}</h1>
            <div className="text-xl font-semibold text-blue-600 mb-4">
              {selectedVariant.price
                ? `${selectedVariant.price.toLocaleString()}đ`
                : "Liên hệ để biết giá"}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Thương hiệu:</strong> {brand?.name || "Không rõ"}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Danh mục:</strong> {category?.name || "Không rõ"}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <strong>Số lượng:</strong>{" "}
              {selectedVariant.quantity || selectedVariant.stock || 0}
            </div>
          </div>
          <div className="h-[300px] p-4 overflow-y-auto ">
            {variants.length > 0 && selectedVariant.attributes?.length > 0 && (
              <>
                <h2 className="text-lg font-bold mb-4">Chọn sản phẩm</h2>
                <div className="flex gap-4 flex-wrap">
                  {variants.map((variant) => (
                    <div
                      key={variant.variantId}
                      onClick={() => handleVariantSelect(variant)}
                      className={`p-3 border rounded-lg text-center cursor-pointer transition-all 
                                            ${
                                              selectedVariant?.variantId ===
                                              variant.variantId
                                                ? "border-blue-500 bg-blue-100"
                                                : "hover:bg-gray-100"
                                            }`}
                    >
                      <img
                        src={variant.image}
                        alt={variant.attributes || "Variant Image"}
                        className="w-16 h-16 object-cover mx-auto mb-2"
                      />
                      <div className="text-sm">{variant.attributes}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="space-y-2 mt-4">
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
              Mua ngay
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full text-blue-600 border border-blue-600 py-3 px-6 rounded-lg shadow hover:bg-blue-50 transition duration-300"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
