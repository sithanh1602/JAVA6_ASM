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
  const [description, setDescription] = useState(
    selectedVariant?.description || ""
  );

  // Kiểm tra sản phẩm có đang hoạt động không
  const isProductUnavailable = selectedVariant?.status === "Unavailable";
  const isOutOfStock = (selectedVariant?.quantity === 0 || selectedVariant?.stock === 0);

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

  // Hàm kiểm tra và điều chỉnh số lượng
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    const maxStock = selectedVariant.quantity || selectedVariant.stock || 0;

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
      // Kiểm tra số lượng tồn thực tế
      const variantId = selectedVariant.variantId || selectedVariant.idVariants;
      const actualStock = await ProductService.checkVariantQuantity(variantId);

      // Kiểm tra nếu hết hàng
      if (actualStock === 0) {
        alert("Sản phẩm đã hết hàng!");
        setSelectedVariant((prev) => ({ ...prev, quantity: 0, stock: 0 }));
        return;
      }

      // Kiểm tra nếu không đủ số lượng
      if (quantity > actualStock) {
        alert(
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

      // Nếu đủ số lượng thì thêm vào giỏ hàng
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
      console.error("Lỗi:", error);
      toast.error(
        error.message ||
          "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau."
      );
    }
  };

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="container mx-auto px-4 max-w-6xl  bg-white">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div className="space-y-4">
              <div className="relative w-full h-[400px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={
                    mainImage ||
                    selectedVariant?.image ||
                    selectedVariant?.imageUrl
                  }
                  alt={selectedVariant?.attributes || "Product image"}
                  className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                />
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 text-gray-800 hover:bg-white transition"
                >
                  {"<"}
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 text-gray-800 hover:bg-white transition"
                >
                  {">"}
                </button>
              </div>

              {images.length > 0 && (
                <div className="flex gap-2">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`w-20 h-20  overflow-hidden cursor-pointer hover:scale-105 transition-transform ${
                        index === mainImageIndex ? "border-blue-500" : ""
                      }`}
                      onClick={() => handleImageChange(index)}
                    >
                      <img
                        src={image.image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="border p-4">
                <h2 className="text-lg font-bold mb-2">Mô tả sản phẩm</h2>
                <div
                  className="text-sm text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: selectedVariant?.description || "Không có mô tả",
                  }}
                ></div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="rounded-lg">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h1 className="text-2xl font-bold mb-2">{productName}</h1>
                  <div className="text-xl font-semibold text-blue-600">
                    {(() => {
                      const price = selectedVariant?.price;
                      const discountPrice = selectedVariant?.discountPrice;
                      const hasDiscount =
                        discountPrice > 0 && discountPrice < price;

                      if (hasDiscount) {
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-semibold text-blue-600">
                              {discountPrice.toLocaleString()}đ
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {price.toLocaleString()}đ
                            </span>
                          </div>
                        );
                      } else if (price > 0) {
                        return <span>{price.toLocaleString()}đ</span>;
                      } else {
                        return <span>Liên hệ để biết giá</span>;
                      }
                    })()}
                  </div>
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
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Danh mục:</span>
                    <span className="text-gray-600">
                      {category?.name || "Không rõ"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Kho:</span>
                    <span className="text-gray-600">
                      {selectedVariant?.quantity || selectedVariant?.stock || 0}{" "}
                      sản phẩm
                    </span>
                  </div>
                </div>

                {variants.length > 0 &&
                  selectedVariant?.attributes?.length > 0 && (
                    <div className="border-t py-4">
                      <h2 className="text-lg font-bold mb-4">Chọn sản phẩm</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {variants.map((variant) => (
                          <div
                            key={variant.variantId}
                            onClick={() => handleVariantSelect(variant)}
                            className={`p-3 border cursor-pointer transition-all ${
                              selectedVariant?.variantId === variant.variantId
                                ? "border-blue-500 bg-blue-50"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <img
                              src={variant?.image}
                              console={variant}
                              alt={variant.attributes || "Variant"}
                              className="w-16 h-16 object-cover mx-auto mb-2"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-6">
                        <span className="font-semibold">{productName}</span>
                        <span className="text-gray-600">
                          {selectedVariant.attributes}
                        </span>
                      </div>
                    </div>
                  )}


                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="font-medium">Số lượng:</label>
                    <div className="flex items-center border rounded-lg">
                      <button
                        className="px-3 py-1 border-r hover:bg-gray-50"
                        onClick={() =>
                          handleQuantityChange({
                            target: { value: quantity - 1 },
                          })
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-16 text-center px-2 py-1 focus:outline-none"
                      />
                      <button
                        className="px-3 py-1 border-l hover:bg-gray-50"
                        onClick={() =>
                          handleQuantityChange({
                            target: { value: quantity + 1 },
                          })
                        }
                      >
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
                      }`}
                    >
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

      <ProductRating productDetailsId={productId} />

      <Toaster richColors position="top-center" />
    </div>
  );
};

export default ProductDetail;
