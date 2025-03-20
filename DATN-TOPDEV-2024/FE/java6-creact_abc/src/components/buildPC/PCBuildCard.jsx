import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faHeart,
  faInfoCircle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { addProductToCart } from "../../services/CartService";

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VND";
};

const getPurposeColor = (purpose) => {
  switch (purpose) {
    case "Gaming":
      return "bg-red-500";
    case "Streaming":
      return "bg-purple-500";
    case "Workstation":
      return "bg-blue-500";
    case "Office":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getPurposeIcon = (purpose) => {
  switch (purpose) {
    case "Gaming":
      return "🎮";
    case "Streaming":
      return "🎬";
    case "Workstation":
      return "💼";
    case "Office":
      return "📊";
    default:
      return "💻";
  }
};

const PCBuildCard = ({ build, index }) => {
  const navigate = useNavigate();
  const isOutOfStock = build.status !== "Available";

  const handleViewDetails = () => {
    navigate(`/details/${build.buildId}`);
  };

  const handleAddAllToCart = async () => {
    const userId = localStorage.getItem("UserId");
    const role = localStorage.getItem("role");

    if (!userId) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng đăng nhập trước khi thêm vào giỏ hàng",
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
      // Hiển thị loading
      Swal.fire({
        title: "Đang xử lý...",
        text: "Đang thêm các linh kiện vào giỏ hàng",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Thêm tất cả linh kiện vào giỏ hàng
      const addPromises = build.buildPCProductVariants.map((variant) =>
        addProductToCart(
          userId,
          variant.productVariantId,
          variant.variantQuantity
        )
      );

      await Promise.all(addPromises);

      Swal.fire({
        title: "Thành công",
        text: "Đã thêm tất cả linh kiện vào giỏ hàng!",
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
      Swal.fire("Lỗi", "Có lỗi xảy ra khi thêm vào giỏ hàng", "error");
    }
  };

  return (
    <div
      className={`relative bg-white p-4 border shadow-md overflow-hidden group ${
        isOutOfStock ? "opacity-50" : ""
      } hover:shadow-lg transition-all duration-300`}
    >
      <div
        className="relative cursor-pointer"
        onClick={!isOutOfStock ? handleViewDetails : undefined}
      >
        <img
          src={
            build.image ||
            `https://placehold.co/400x300?text=PC+Build+${index + 1}`
          }
          alt={build.buildName || `PC Build ${index + 1}`}
          className="h-64 w-full object-cover rounded-lg"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-red-800 font-bold text-lg">
            KHÔNG KHẢ DỤNG
          </div>
        )}
        <span
          className={`absolute top-2 left-2 ${getPurposeColor(
            build.usagePurpose
          )} text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1`}
        >
          {getPurposeIcon(build.usagePurpose)} {build.usagePurpose}
        </span>
      </div>

      <h3 className="text-lg font-bold mt-3 h-14 overflow-hidden">
        {build.buildName}
      </h3>

      <div className="flex justify-between items-center mt-2">
        <div className="text-md font-bold text-red-500">
          {formatPrice(build.totalPrice)}
        </div>
        <div className="text-sm font-medium text-gray-600">
          {build.totalProducts} linh kiện
        </div>
      </div>

      <div className="flex justify-between mt-4">
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
          className="px-2 py-1 text-blue-600 hover:text-blue-800"
          onClick={handleViewDetails}
        >
          <FontAwesomeIcon icon={faInfoCircle} /> Chi tiết
        </button>
      </div>

      <button
        className="w-full mt-3 px-4 py-2 text-sm font-bold bg-blue-700 text-white shadow hover:bg-blue-800 transition"
        onClick={handleAddAllToCart}
        disabled={isOutOfStock}
      >
        <FontAwesomeIcon icon={faCartPlus} /> THÊM TẤT CẢ VÀO GIỎ HÀNG
      </button>
    </div>
  );
};

export default PCBuildCard;
