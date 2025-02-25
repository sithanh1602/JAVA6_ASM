import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProductToCart } from "../../services/CartService";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faHeart,
  faExclamationCircle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import FavoriteService from "../../services/FavoriteService";


const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VND";
};

const ProductCard = ({ variant, index }) => {
  // console.log('Product:', variant.image);
  const navigate = useNavigate();
  const isOutOfStock = variant.quantity === 0;
  const [isFavorited, setIsFavorited] = useState(false);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("UserId");
    const role = localStorage.getItem("role");

    if (!userId) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng",
        icon: "warning",
        confirmButtonText: "Đăng nhập",
      }).then(() => {
        navigate("/login");
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
    const userId = localStorage.getItem("UserId");
    if (!userId) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng đăng nhập trước khi thêm vào yêu thích",
        icon: "warning",
        confirmButtonText: "Đăng nhập",
      }).then(() => {
        navigate("/login");
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
        setIsFavorited(false); // Update UI state immediately
        Swal.fire("Thành công", "Đã xóa khỏi danh sách yêu thích", "success");
      } else {
        await FavoriteService.addToFavorites(userId, variant.id);
        setIsFavorited(true); // Update UI state immediately
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

  return (
    <div
      className={`relative bg-white p-4 border shadow-md overflow-hidden group ${
        isOutOfStock ? "opacity-50" : ""
      }`}
    >
      <div
        className="relative cursor-pointer"
        onClick={!isOutOfStock ? handleShowProductDetails : undefined}
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
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-red-800 font-bold text-lg">
            HẾT HÀNG
          </div>
        )}
      </div>
      {variant.discount && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{variant.discount}%
        </span>
      )}
      <h3 className="text-sm font-bold mt-3">{variant.nameVariants}</h3>
      <div className="text-sm font-bold text-red-500">
        {formatPrice(variant.price)}
      </div>

      <div className="flex mt-2">
        <button
          className={`text-gray-500 hover:text-red-500 ${
            isFavorited ? "text-red-500" : ""
          }`}
          onClick={handleFavorite}
        >
          <FontAwesomeIcon icon={faHeart} />
        </button>
        <button
          className="text-gray-500 p-2 hover:text-orange-500"
          onClick={handleShowProductDetails}
        >
          <FontAwesomeIcon icon={faExclamationCircle} />
        </button>
      </div>
      <div className="flex items-center mt-2">
        {[...Array(5)].map((_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={faStar}
            className="text-yellow-400 mr-1"
          />
        ))}
      </div>
      <button
        className="w-full mt-3 px-4 py-2 text-xs font-bold bg-blue-700 text-white shadow opacity-100 hover:bg-gray-200 hover:text-black transition"
        onClick={handleAddToCart}
      >
        <FontAwesomeIcon icon={faCartPlus} /> THÊM VÀO GIỎ HÀNG
      </button>
    </div>
  );
};

export default ProductCard;
