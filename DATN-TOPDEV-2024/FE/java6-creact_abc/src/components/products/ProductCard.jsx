import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProductToCart } from "../../services/CartService";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaStar } from "react-icons/fa";
import {
  faCartPlus,
  faHeart,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import FavoriteService from "../../services/FavoriteService";
import RatingService from "../../services/RatingService";

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
};

const ProductCard = ({ variant, index }) => {
  const navigate = useNavigate();
  const isOutOfStock = variant.quantity === 0;
  const isUnavailable = variant.status === "Unavailable";
  const [isFavorited, setIsFavorited] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Kiểm tra và tính toán giảm giá
  const hasDiscount =
    variant.discountPrice > 0 && variant.discountPrice < variant.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((variant.price - variant.discountPrice) / variant.price) * 100
      )
    : 0;

  const handleAddToCart = async () => {
    // Kiểm tra sản phẩm không hoạt động
    if (isUnavailable) {
      Swal.fire({
        title: "Thông báo",
        text: "Sản phẩm này hiện không hoạt động và không thể thêm vào giỏ hàng",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const userId = localStorage.getItem("UserId");
    const role = localStorage.getItem("role");

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

    if (role === "ADMIN") {
      Swal.fire({
        title: "Thông báo",
        text: "Quản trị viên không được phép thêm sản phẩm vào giỏ hàng",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      await addProductToCart(userId, variant.id, 1);
      Swal.fire({
        title: "Thành công",
        text: "Thêm vào giỏ hàng thành công!",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Xem giỏ hàng",
        cancelButtonText: "Tiếp tục mua sắm",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/cart");
        }
      });
    } catch (error) {
      Swal.fire("Lỗi", "Số lượng sản phẩm không đủ", "error");
    }
  };

  const handleFavorite = async () => {
    // Kiểm tra sản phẩm không hoạt động
    if (isUnavailable) {
      Swal.fire({
        title: "Thông báo",
        text: "Không thể thêm sản phẩm không hoạt động vào danh sách yêu thích",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const userId = localStorage.getItem("UserId");
    if (!userId) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng đăng nhập trước khi thêm vào yêu thích",
        icon: "warning",
        confirmButtonText: "Đăng nhập",
      }).then(() => {
        navigate("/loginn");
      });
      return;
    }

    try {
      const isFavorited = await FavoriteService.checkIsFavorited(
        userId,
        variant.id
      );
      if (isFavorited) {
        await FavoriteService.removeFromFavorites(userId, variant.id);
        setIsFavorited(false);
        Swal.fire("Thành công", "Đã xóa khỏi danh sách yêu thích", "success");
      } else {
        await FavoriteService.addToFavorites(userId, variant.id);
        setIsFavorited(true);
        Swal.fire("Thành công", "Đã thêm vào danh sách yêu thích", "success");
      }
    } catch (error) {
      Swal.fire("Lỗi", "Không thể thực hiện thao tác", "error");
    }
  };

  const handleShowProductDetails = () => {
    navigate(`/products/${variant.productId}/productdetail`);
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const userId = localStorage.getItem("UserId");
      if (userId) {
        try {
          const status = await FavoriteService.checkIsFavorited(
            userId,
            variant.id
          );
          setIsFavorited(status);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };
    checkFavoriteStatus();
  }, [variant.id]);

  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await RatingService.getAverageRating(variant.productId);
        setAverageRating(response);
      } catch (error) {
        console.error("Lỗi khi lấy đánh giá trung bình:", error);
        setAverageRating(0);
      }
    };
    fetchAverageRating();
  }, [variant.productId]);

  return (
    <div
      className={`relative bg-white p-4 border shadow-md overflow-hidden h-[497px] flex flex-col justify-between group ${
        isOutOfStock || isUnavailable ? "opacity-70" : ""
      }`}
    >
      <div
        className="relative cursor-pointer"
        onClick={!isOutOfStock && !isUnavailable ? handleShowProductDetails : undefined}
      >
        <img
          src={
            variant.image
              ? variant.image
              : `https://placehold.co/200x200?text=Variant+Image+${index + 1}`
          }
          alt={variant.name || `Variant Image ${index + 1}`}
          className="h-64 w-full object-cover rounded-lg"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-lg">
            HẾT HÀNG
          </div>
        )}
        {isUnavailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-lg">
              KHÔNG HOẠT ĐỘNG
            </span>
          </div>
        )}
      </div>
      {hasDiscount && !isUnavailable && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{variant.discountPercentage}%
        </span>
      )}
      <h3 className="text-sm font-bold mt-3 text-gray-800 line-clamp-2 overflow-hidden text-ellipsis">
        {variant.nameVariants}
      </h3>
      {hasDiscount ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-red-500">
            {formatPrice(variant.discountPrice)}
          </span>
          <span className="text-xs text-gray-500 line-through">
            {formatPrice(variant.price)}
          </span>
        </div>
      ) : (
        <div className="text-sm font-bold text-red-500">
          {formatPrice(variant.price || 0)}
        </div>
      )}
      <div className="flex mt-2">
        <button
          className={`text-gray-500 hover:text-red-500 ${isFavorited ? "text-red-500" : ""} ${isUnavailable ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={!isUnavailable ? handleFavorite : undefined}
        >
          <FontAwesomeIcon icon={faHeart} />
        </button>
        <button
          className={`text-gray-500 p-2 hover:text-orange-500 ${isUnavailable ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={!isUnavailable ? handleShowProductDetails : undefined}
        >
          <FontAwesomeIcon icon={faExclamationCircle} />
        </button>
      </div>
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <button
              key={index}
              className="bg-transparent border-none outline-none cursor-pointer transition-transform duration-200 hover:scale-125">
              <FaStar
                className="text-lg text-gray-400"
                style={{
                  color: ratingValue <= averageRating ? "#ffc107" : "#e4e5e9",
                }}
              />
            </button>
          );
        })}{" "}
        <span className="font-semibold text-gray-500">
          ({averageRating ? averageRating.toFixed(1) : "0.0"})
        </span>
      </div>
      <button
        className={`w-full mt-3 px-4 py-2 text-xs font-bold ${
          isUnavailable 
            ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
            : "bg-blue-700 text-white shadow opacity-100 hover:bg-gray-200 hover:text-black transition"
        }`}
        onClick={!isUnavailable ? handleAddToCart : undefined}
        disabled={isUnavailable}
      >
        <FontAwesomeIcon icon={faCartPlus} /> {isUnavailable ? "KHÔNG HOẠT ĐỘNG" : "THÊM VÀO GIỎ HÀNG"}
      </button>
    </div>
  );
};

export default ProductCard;
