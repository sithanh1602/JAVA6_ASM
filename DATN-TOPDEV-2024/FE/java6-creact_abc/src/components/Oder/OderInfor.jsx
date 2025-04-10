import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import logoMomo from "../../assets/images/logoMomo.png";
import logoVNP from "../../assets/images/logoVNP.jpg";
import OrderService from "../../services/OrderSevice";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import classNames from "classnames";
import Swal from "sweetalert2";

const OrderInfo = ({
  setPaymentMethod,
  setVoucherDiscount,
  setVoucherCode,
  setVoucherid,
  shippingFee,
  setSelectedLogo,
}) => {
  const location = useLocation();
  const { cartItems = [] } = location.state || {};
  const [selectedPayment, setSelectedPayment] = useState("bank");
  const [selectedPaymentLogo, setSelectedPaymentLogo] = useState("");
  const [showVouchers, setShowVouchers] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [userOrders, setUserOrders] = useState([]);

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

  const fetchUserOrders = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;
    try {
      const orders = await OrderService.getOrdersByUserId(userId);
      setUserOrders(orders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    }
  };

  const fetchVouchers = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/vouchers`);
      setVouchers(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vouchers:", error);
    }
  };

  useEffect(() => {
    fetchUserOrders();
    if (showVouchers) fetchVouchers();
  }, [showVouchers]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
    .format(value)
    .replace("₫", "VNĐ");

  const handleLogoClick = (logo) => {
    setSelectedPaymentLogo(logo);
    setSelectedLogo(logo);
    setSelectedPayment("bank");
    setPaymentMethod("bank");
  };

  const handlePaymentChange = (method) => {
    setSelectedPayment(method);
    setPaymentMethod(method);
    if (method === "cash") {
      setSelectedPaymentLogo("");
      setSelectedLogo("");
    }
  };

  const handleApplyVoucher = (voucher) => {
    const isVoucherUsed = userOrders.some(
      (order) => order.voucher && order.voucher.id === voucher.id
    );
    if (isVoucherUsed) {
      Swal.fire({
        title: "Voucher đã sử dụng!",
        text: "Voucher này đã được sử dụng trong một đơn hàng trước đó. Vui lòng chọn voucher khác.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    setSelectedVoucher(voucher);
    setDiscountAmount(voucher.discount);
    setVoucherDiscount(voucher.discount);
    setVoucherCode(voucher.code);
    setVoucherid(voucher.id);
    console.log("Voucher applied:", voucher);

    Swal.fire({
      title: "Mã giảm giá áp dụng thành công!",
      text: `Bạn đã được giảm ${formatCurrency(voucher.discount)}.`,
      icon: "success",
      confirmButtonText: "OK",
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.productPrice * item.quantity,
    0
  );

  const totalAfterDiscount = Math.max(
    totalAmount - discountAmount + shippingFee,
    0
  );

  useEffect(() => {
    setPaymentMethod("bank");
  }, [setPaymentMethod]);

  // Nhóm các sản phẩm theo buildId và xử lý dữ liệu từ CartPage/GroupOrder
  const groupedItems = () => {
    const result = {};

    cartItems.forEach((item) => {
      if (item.buildId) {
        // Trường hợp BuildPC
        const key = `build-${item.buildId}`;
        if (!result[key]) {
          result[key] = {
            buildId: item.buildId,
            buildName: item.buildName || "BuildPC không tên",
            items: [],
          };
        }
        // Tạo danh sách linh kiện từ buildPCProductVariants nếu có, hoặc dùng dữ liệu từ item
        if (item.buildPC && item.buildPC.buildPCProductVariants) {
          item.buildPC.buildPCProductVariants.forEach((variant) => {
            result[key].items.push({
              productVariantId: variant.productVariantId,
              quantity: variant.variantQuantity * item.quantity,
              productName: variant.nameVariants,
              productPrice: variant.price,
            });
          });
        } else {
          result[key].items.push({
            productVariantId: item.product_variant_id || item.productVariantId,
            quantity: item.quantity,
            productName: item.nameVariants || item.productName || "Linh kiện không xác định",
            productPrice: item.productPrice,
          });
        }
      } else {
        // Trường hợp sản phẩm đơn lẻ
        const key = `single-${item.product_variant_id || item.productVariantId}`;
        result[key] = {
          buildId: null,
          buildName: null,
          items: [{
            productVariantId: item.product_variant_id || item.productVariantId,
            quantity: item.quantity,
            productName: item.productName || item.nameVariants || "Linh kiện không xác định",
            productPrice: item.productPrice,
          }],
        };
      }
    });

    return result;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Thông tin đơn hàng</h2>
      <div className="border border-gray-300 rounded-md p-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Tạm tính</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(groupedItems()).map((group, index) => (
              <React.Fragment key={index}>
                {group.buildId && (
                  <tr>
                    <td colSpan="2" className="font-semibold text-blue-600 py-2">
                      PC: {group.buildName}
                    </td>
                  </tr>
                )}
                {group.items.map((item, idx) => (
                  <tr key={idx} className={group.buildId ? "pl-4" : ""}>
                    <td>
                    {group.buildId && "↳ "} {item.productName} × <span className="font-semibold text-red-600 py-2">{item.quantity}</span>
                    </td>
                    <td>{formatCurrency(item.productPrice * item.quantity)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Tạm tính</td>
              <td>{formatCurrency(totalAmount)}</td>
            </tr>
            <tr>
              <td>Phí vận chuyển</td>
              <td>{formatCurrency(shippingFee)}</td>
            </tr>
            {discountAmount > 0 && (
              <tr>
                <td>Giảm giá</td>
                <td>{formatCurrency(discountAmount)}</td>
              </tr>
            )}
            <tr>
              <td className="font-bold">Tổng</td>
              <td className="font-bold">{formatCurrency(totalAfterDiscount)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Voucher Section */}
        <button
          onClick={() => setShowVouchers((prev) => !prev)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {showVouchers ? "Ẩn mã giảm giá" : "Xem mã giảm giá"}
        </button>

        {showVouchers && (
          <div className="mt-4 p-4 border rounded-md bg-gray-100">
            <h3 className="text-lg font-bold mb-2">Danh sách mã giảm giá</h3>
            {vouchers.filter((voucher) => {
              const currentDate = new Date();
              const startDate = new Date(voucher.startDate);
              const endDate = new Date(voucher.endDate);
              return (
                voucher.quantity > 0 &&
                startDate <= currentDate &&
                endDate > currentDate
              );
            }).length > 0 ? (
              <ul>
                {vouchers
                  .filter((voucher) => {
                    const currentDate = new Date();
                    const startDate = new Date(voucher.startDate);
                    const endDate = new Date(voucher.endDate);
                    return (
                      voucher.quantity > 0 &&
                      startDate <= currentDate &&
                      endDate > currentDate
                    );
                  })
                  .map((voucher, index) => {
                    const isUsed = userOrders.some(
                      (order) =>
                        order.voucher && order.voucher.id === voucher.id
                    );
                    return (
                      <li
                        key={index}
                        className="p-2 border-b flex justify-between items-center"
                      >
                        <span>Giảm {formatCurrency(voucher.discount)}</span>
                        <button
                          className={classNames(
                            "px-2 py-1 text-white rounded-md",
                            {
                              "bg-green-500":
                                !isUsed && selectedVoucher?.id !== voucher.id,
                              "bg-gray-500":
                                isUsed || selectedVoucher?.id === voucher.id,
                            }
                          )}
                          onClick={() => handleApplyVoucher(voucher)}
                          disabled={
                            isUsed || selectedVoucher?.id === voucher.id
                          }
                        >
                          {isUsed
                            ? "Đã dùng"
                            : selectedVoucher?.id === voucher.id
                            ? "Đã áp dụng"
                            : "Sử dụng"}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p className="text-gray-500">
                Bạn chưa có mã giảm giá nào hợp lệ.
              </p>
            )}
          </div>
        )}

        {/* Payment Methods Section */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="payment"
              checked={selectedPayment === "bank"}
              onChange={() => handlePaymentChange("bank")}
              className="h-4 w-4 text-orange-600"
            />
            <span className="ml-2">Chuyển khoản ngân hàng</span>
          </label>

          {selectedPayment === "bank" && (
            <div className="mt-4 space-y-4">
              <div className="p-2 border bg-gray-100 text-sm rounded">
                Vui lòng chọn phương thức thanh toán bên dưới
              </div>

              <div className="flex space-x-4">
                {["vnp", "momoPay"].map((logo, idx) => (
                  <div
                    key={idx}
                    className={classNames(
                      "flex items-center p-2 rounded cursor-pointer transition-all duration-200",
                      {
                        "border-2 border-orange-500 shadow-lg":
                          selectedPaymentLogo === logo,
                        "border border-gray-300 hover:border-orange-300":
                          selectedPaymentLogo !== logo,
                      }
                    )}
                    onClick={() => handleLogoClick(logo)}
                  >
                    <img
                      src={logo === "vnp" ? logoVNP : logoMomo}
                      alt={`${logo} Logo`}
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center mt-4">
            <input
              type="radio"
              name="payment"
              checked={selectedPayment === "cash"}
              onChange={() => handlePaymentChange("cash")}
              className="h-4 w-4 text-orange-600"
            />
            <span className="ml-2">Trả tiền mặt khi nhận hàng</span>
          </label>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Dữ liệu cá nhân của bạn sẽ được sử dụng theo{" "}
          <a href="#" className="text-orange-600 hover:underline">
            chính sách riêng tư
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default OrderInfo;