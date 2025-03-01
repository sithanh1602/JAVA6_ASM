import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import BillingInfo from "./OderBingllingInfor";
import OrderInfo from "./OderInfor";
import OrderBr from "./OderBr";
import OrderService from "../../services/OrderSevice";
import UserAddressService from "../../services/UserAddressService";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const GroupOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems = [] } = location.state || {};

  const [userInfo, setUserInfo] = useState({
    id: "",
    fullName: "",
    phone: "",
    email: "",
    fullAddress: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedLogo, setSelectedLogo] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherCode, setVoucherCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const getUserIdFromToken = () => {
    const token = Cookies.get("token");
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

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        Swal.fire({
          title: "Lỗi",
          text: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.",
          icon: "error",
        }).then(() => {
          navigate("/login");
        });
        return;
      }

      try {
        const userData = await UserAddressService.getDefaultUserInfo(userId);
        if (userData) {
          setUserInfo({
            id: userId,
            fullName: userData.fullName,
            phone: userData.phone,
            email: userData.email,
            fullAddress: userData.fullAddress,
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        Swal.fire({
          title: "Lỗi",
          text: "Không thể tải thông tin người dùng.",
          icon: "error",
        });
      }
    };
    fetchUserInfo();
  }, [navigate]);

  const calculateTotalPrice = () => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0
    );
    return Math.max(total - voucherDiscount, 0);
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng chọn phương thức thanh toán.",
        icon: "error",
      });
      return;
    }

    if (!userInfo.fullAddress) {
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng cung cấp địa chỉ giao hàng.",
        icon: "error",
      });
      return;
    }

    if (paymentMethod === "bank" && !selectedLogo) {
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng chọn phương thức thanh toán (VNPay hoặc ZaloPay).",
        icon: "error",
      });
      return;
    }

    setLoading(true);

    const orderData = {
      userId: userInfo.id,
      fullName: userInfo.fullName,
      fullAddress: userInfo.fullAddress,
      phone: userInfo.phone,
      email: userInfo.email,
      cartItems: cartItems.map((item) => ({
        productVariantId: item.product_variant_id,
        quantity: item.quantity,
        productName: `${item.nameVariants} (${item.productName})`, // Kết hợp cả nameVariants và productName
        productPrice: item.productPrice,
        size: item.size,
      })),
      totalPrice: calculateTotalPrice(),
      paymentMethod,
      voucherDiscount,
      voucherCode,
      status: 0,
    };

    try {
      if (paymentMethod === "bank") {
        let response;
        if (selectedLogo === "zaloPay") {
          response = await OrderService.placeOrderZaloPay(orderData);
        } else if (selectedLogo === "vnp") {
          response = await OrderService.placeOrder(orderData);
        }

        Swal.fire({
          title: "Chuyển hướng...",
          text: "Đang chuyển đến cổng thanh toán.",
          icon: "info",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = response;
        });
      } else if (paymentMethod === "cash") {
        await OrderService.placeOrderNoVnpay(orderData);

        const productDetails = cartItems
          .map(
            (item) =>
              `<li>${item.nameVariants} (${item.productName}) - Số lượng: ${
                item.quantity
              } - Giá: ${(
                item.productPrice * item.quantity
              ).toLocaleString()} VNĐ</li>`
          ) // Hiển thị cả nameVariants và productName
          .join("");

        Swal.fire({
          title: "Đặt hàng thành công!",
          html: `
                        <p>Đơn hàng của bạn đã được ghi nhận.</p>
                        <ul style="text-align: left; margin: 10px 0;">${productDetails}</ul>
                        <p><strong>Tổng tiền: ${calculateTotalPrice().toLocaleString()} VNĐ</strong></p>
                        <p class="mt-2">Cảm ơn bạn đã mua hàng!</p>
                    `,
          icon: "success",
          confirmButtonText: "Xem đơn hàng",
          showCancelButton: true,
          cancelButtonText: "Tiếp tục mua sắm",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/OrderUser");
          } else {
            navigate("/");
          }
        });
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      Swal.fire({
        title: "Lỗi",
        text:
          error.message ||
          "Đã xảy ra lỗi trong quá trình đặt hàng. Vui lòng thử lại.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <OrderBr />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BillingInfo setUserInfo={setUserInfo} userInfo={userInfo} />
        <OrderInfo
          setPaymentMethod={setPaymentMethod}
          setSelectedLogo={setSelectedLogo}
          setVoucherDiscount={setVoucherDiscount}
          setVoucherCode={setVoucherCode}
        />
      </div>
      <button
        onClick={handlePlaceOrder}
        className="mt-4 w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "ĐẶT HÀNG"}
      </button>
    </div>
  );
};

export default GroupOrder;
