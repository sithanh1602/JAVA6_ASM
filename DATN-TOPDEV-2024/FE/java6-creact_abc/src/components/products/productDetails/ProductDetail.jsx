import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductService from "../../../services/ProductService";
import ProductRating from "./ProductRating";
import {
  addProductToCart,
  getAllCartItemsForUser,
  removeProductFromCart,
} from "../../../services/CartService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "sonner";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

const ProductDetail = () => {
  const navigate = useNavigate();
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
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra sản phẩm có đang hoạt động không
  const isProductUnavailable = selectedVariant?.status === "Unavailable";
  const isOutOfStock = (selectedVariant?.quantity === 0 || selectedVariant?.stock === 0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        const productData = await ProductService.getProductDetail(productId);
        if (productData && productData.length > 0) {
          setProduct(productData[0]);
          setVariants(productData);
          const firstVariant = productData[0];
          setSelectedVariant(firstVariant);

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
            const firstVariant = productVariants[0];
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
      } finally {
        setIsLoading(false);
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
    const fetchedImages = await ProductService.getImagesByProductVariantId(
      variant.variantId || variant.idVariants
    );
    if (fetchedImages) {
      setImages(fetchedImages);
      setMainImage(fetchedImages.length > 0 ? fetchedImages[0].image : null);
      setMainImageIndex(0);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    const maxStock = selectedVariant?.quantity || selectedVariant?.stock || 0;

    if (value < 1) {
      setQuantity(1);
    } else if (value > maxStock) {
      setQuantity(maxStock);
      toast.error(`Chỉ còn ${maxStock} sản phẩm trong kho`);
    } else {
      setQuantity(value);
    }
  };

  const getUserIdFromToken = () => {
    const token = Cookies.get("jwtToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.userId;
      } catch (err) {
        console.error("Token không hợp lệ:", err);
        return null;
      }
    }
    return null;
  };

  const handleAddToCart = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng",
        icon: "warning",
        confirmButtonText: "Đăng nhập",
      }).then(() => {
        navigate("/loginn");
      });
      return;
    }
    try {
      const variantId = selectedVariant.variantId || selectedVariant.idVariants;
      const actualStock = await ProductService.checkVariantQuantity(variantId);

      if (actualStock === 0) {
        toast.error("Sản phẩm đã hết hàng!");
        setSelectedVariant((prev) => ({ ...prev, quantity: 0, stock: 0 }));
        return;
      }

      if (quantity > actualStock) {
        toast.warning(
          `Chỉ còn ${actualStock} sản phẩm trong kho. Vui lòng giảm số lượng.`
        );
        setSelectedVariant((prev) => ({
          ...prev,
          quantity: actualStock,
          stock: actualStock,
        }));
        setQuantity(actualStock);
        return;
      }

      const cartItem = {
        userId: userId,
        productVariantId: variantId,
        quantity: quantity,
      };

      await addProductToCart(
        cartItem.userId,
        cartItem.productVariantId,
        cartItem.quantity
      );
      toast.success("Sản phẩm đã được thêm vào giỏ hàng thành công.");
    } catch (error) {
      toast.error(
        error.message ||
          "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau."
      );
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 rounded-lg shadow-sm border border-red-100 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-red-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Đã xảy ra lỗi
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">
          Đang tải thông tin sản phẩm...
        </span>
      </div>
    );
  }

  if (!product && variants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm border border-gray-100 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-gray-600">
            Sản phẩm này không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  const productName = selectedVariant
    ? selectedVariant.name
    : "Product not found";

  const hasDiscount =
    selectedVariant?.discountPrice > 0 &&
    selectedVariant?.discountPrice < selectedVariant?.price;
  const stockStatus =
    selectedVariant?.quantity > 0 || selectedVariant?.stock > 0
      ? "inStock"
      : "outOfStock";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Left Column - Images */}
            <div className="space-y-6">
              <div className="relative w-full h-[500px] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
                {mainImage && (
                  <img
                    src={
                      mainImage ||
                      selectedVariant?.image ||
                      selectedVariant?.imageUrl
                    }
                    alt={selectedVariant?.attributes || "Product image"}
                    className="h-full w-full object-contain transition-transform duration-500 hover:scale-110"
                  />
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-3 text-gray-700 hover:bg-white hover:text-blue-600 transition shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-3 text-gray-700 hover:bg-white hover:text-blue-600 transition shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {images.length > 0 && (
                <div className="relative">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-1 py-2">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                          index === mainImageIndex
                            ? " shadow-md transform scale-105"
                            : "border border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => handleImageChange(index)}>
                        <div className="w-full h-full relative group">
                          <img
                            src={image.image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {images.length > 5 && (
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <div className="w-8 bg-gradient-to-l from-white to-transparent h-full pointer-events-none"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Right Column - Product Info */}
            <div className="flex flex-col">
              <div className="space-y-6">
                <div>
                  {category && (
                    <div className="text-blue-600 font-medium text-sm mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {category?.name}
                    </div>
                  )}

                  <h1 className="text-2xl font-bold text-gray-800">
                    {productName}
                  </h1>

                  {brand && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-600 text-sm">
                        Thương hiệu:
                      </span>
                      <span className="font-medium text-gray-800">
                        {brand?.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thông báo sản phẩm không hoạt động */}
                {isProductUnavailable && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-600" />
                    <span>Sản phẩm này hiện không hoạt động</span>
                  </div>
                )}

                {/* Thông báo sản phẩm hết hàng */}
                {isOutOfStock && !isProductUnavailable && (
                  <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg flex items-center gap-2">
                    <FaExclamationTriangle className="text-yellow-600" />
                    <span>Sản phẩm này hiện đang hết hàng</span>
                  </div>
                )}

                <div className="space-y-2 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Thương hiệu:</span>
                    <span className="text-gray-600">
                      {brand?.name || "Không rõ"}
                    </span>
                  </div>
                  <div className="flex items-end gap-3">
                    {hasDiscount ? (
                      <>
                        <span className="text-2xl font-bold text-blue-600">
                          {selectedVariant.discountPrice.toLocaleString()}VND
                        </span>
                        <span className="text-base text-gray-500 line-through">
                          {selectedVariant.price.toLocaleString()}VND
                        </span>
                        <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded">
                          {Math.round(
                            ((selectedVariant.price -
                              selectedVariant.discountPrice) /
                              selectedVariant.price) *
                              100
                          )}
                          % GIẢM
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        {selectedVariant.price > 0
                          ? `${selectedVariant.price.toLocaleString()}đ`
                          : "Liên hệ để biết giá"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        stockStatus === "inStock"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      <span
                        className={`w-2 h-2 rounded-full mr-1 ${
                          stockStatus === "inStock"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}></span>
                      {stockStatus === "inStock" ? "Còn hàng" : "Hết hàng"}
                    </div>

                    {stockStatus === "inStock" && (
                      <span className="text-gray-600 text-sm">
                        Còn{" "}
                        {selectedVariant?.quantity || selectedVariant?.stock || 0}{" "}
                        sản phẩm
                      </span>
                    )}
                  </div>

                  {variants.length > 0 &&
                    selectedVariant?.attributes?.length > 0 && (
                      <div className="border-t border-gray-100 pt-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                          </svg>
                          Phiên bản
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {variants.map((variant) => {
                            const isSelected =
                              selectedVariant?.variantId === variant.variantId;
                            return (
                              <div
                                key={variant.variantId || variant.idVariants}
                                onClick={() => handleVariantSelect(variant)}
                                className={`border p-3 rounded-lg cursor-pointer transition-all group ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 shadow-sm"
                                    : "hover:border-blue-300 hover:bg-blue-50/40"
                                }`}>
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-16 h-16 rounded-lg overflow-hidden mb-2 ${
                                      isSelected ? "" : ""
                                    }`}>
                                    <img
                                      src={variant?.image}
                                      alt={variant.attributes || "Variant"}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="text-center">
                                    <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                                      {variant.attributes}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-4 mb-6">
                      <label className="font-medium text-gray-700">
                        Số lượng:
                      </label>
                      <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
                        <button
                          className="px-4 py-2 text-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() =>
                            handleQuantityChange({
                              target: { value: quantity - 1 },
                            })
                          }
                          disabled={quantity <= 1}>
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-16 text-center px-2 py-2 focus:outline-none "
                        />
                        <button
                          className="px-4 py-2 text-lg bg-gray-100 hover:bg-gray-200 transition"
                          onClick={() =>
                            handleQuantityChange({
                              target: { value: quantity + 1 },
                            })
                          }
                          disabled={
                            quantity >=
                            (selectedVariant?.quantity ||
                              selectedVariant?.stock ||
                              0)
                          }>
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <button
                        onClick={handleAddToCart}
                        disabled={isProductUnavailable || isOutOfStock}
                        className={`w-full py-3 px-6 rounded-lg shadow transition ${
                          isProductUnavailable
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                            : isOutOfStock
                            ? "bg-yellow-400 text-white cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}>
                        {isProductUnavailable
                          ? "Sản phẩm không hoạt động"
                          : isOutOfStock
                          ? "Hết hàng"
                          : "Thêm vào giỏ hàng"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="border-t border-gray-100 mt-6">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Mô tả sản phẩm
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
              <div className="prose prose-blue max-w-none text-gray-700">
                <ReactMarkdown>
                  {selectedVariant?.description ||
                    "Không có mô tả chi tiết cho sản phẩm này."}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Rating Section */}
      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <ProductRating productDetailsId={productId} />
        </div>
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
};

export default ProductDetail;