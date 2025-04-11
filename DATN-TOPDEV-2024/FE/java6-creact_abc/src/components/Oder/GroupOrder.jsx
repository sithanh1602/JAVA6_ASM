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
    district: "",
    ward: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedLogo, setSelectedLogo] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherCode, setVoucherCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voucherId, setVoucherid] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);

  const TOKEN = "138133d6-a702-11ef-8d10-46c07cb69264";
  const SHOP_ID = "5468597";

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
            district: userData.district,
            ward: userData.ward,
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
    return Math.max(total - voucherDiscount + shippingFee, 0);
  };

  const fetchShippingFee = async (address) => {
    console.log("Address used for shipping fee:", address);

    const districtData = await fetchDistrictData();
    if (!districtData || !Array.isArray(districtData)) {
      console.error("districtData không hợp lệ:", districtData);
      Swal.fire("Lỗi", "Không thể lấy danh sách quận/huyện.", "error");
      return;
    }

    const district = districtData.find(
      (d) => d.DistrictName === address.district
    );
    const districtID = district ? district.DistrictID : "";
    if (!districtID) {
      console.error("Không tìm thấy DistrictID cho:", address.district);
      Swal.fire("Lỗi", "Không tìm thấy quận/huyện phù hợp.", "error");
      return;
    }

    const wardData = await fetchWardData(districtID);
    if (!wardData || !Array.isArray(wardData)) {
      console.error("wardData không hợp lệ:", wardData);
      Swal.fire("Lỗi", "Không thể lấy danh sách xã/phường.", "error");
      return;
    }

    const ward = wardData.find((w) => w.WardName === address.ward);
    const wardCode = ward ? ward.WardCode : "";
    if (!wardCode) {
      console.error("Không tìm thấy WardCode cho:", address.ward);
      Swal.fire("Lỗi", "Không tìm thấy xã/phường phù hợp.", "error");
      return;
    }

    const payload = {
      shop_id: SHOP_ID,
      to_district_id: districtID,
      to_ward_code: wardCode,
      weight: 1000,
      service_type_id: 2,
    };

    try {
      const response = await fetch(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Token: TOKEN,
            ShopId: SHOP_ID,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.code === 200) {
        setShippingFee(data.data.total);
      } else {
        console.error("Lỗi lấy phí vận chuyển:", data);
        Swal.fire("Lỗi", "Không thể lấy phí vận chuyển.", "error");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API GHN:", error);
    }
  };

  const fetchDistrictData = async () => {
    try {
      const response = await fetch(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        {
          headers: { Token: TOKEN },
        }
      );
      const data = await response.json();
      console.log("districtData response:", data);
      return data.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy districtData:", error);
      return [];
    }
  };

  const fetchWardData = async (districtID) => {
    try {
      const response = await fetch(
        `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtID}`,
        {
          headers: { Token: TOKEN },
        }
      );
      const data = await response.json();
      console.log("wardData response:", data);
      return data.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy wardData:", error);
      return [];
    }
  };

  useEffect(() => {
    if (userInfo.fullAddress && userInfo.district && userInfo.ward) {
      fetchShippingFee(userInfo);
    }
  }, [userInfo]);

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
          productVariantId: item.productVariantId || item.product_variant_id,
          quantity: item.quantity,
          productName: item.buildId ? item.nameVariants : item.productName,
          productPrice: item.productPrice,
          buildId: item.buildId || null,
          buildName: item.buildName || null,
          size: item.size || null,
      })),
      totalPrice: calculateTotalPrice(),
      paymentMethod,
      voucherDiscount,
      voucherCode,
      status: 0,
      voucherId,
      shippingFee,
  };
  
  console.log("Dữ liệu gửi lên backend:", JSON.stringify(orderData, null, 2));

    try {
        if (paymentMethod === "bank") {
            let response;
            if (selectedLogo === "momoPay") {
                response = await OrderService.placeOrderMomo(orderData);
                console.log("URL thanh toán Momo:", response);
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

        // Nhóm các sản phẩm theo buildId giống OrderInfo
        const groupedItems = cartItems.reduce((acc, item) => {
          const key = item.buildId ? `build-${item.buildId}` : `single-${item.productVariantId || item.product_variant_id}`;
          if (!acc[key]) {
              acc[key] = {
                  buildId: item.buildId || null,
                  buildName: item.buildName || null,
                  items: [],
              };
          }
          acc[key].items.push(item);
          return acc;
      }, {});

      // Tạo danh sách sản phẩm chi tiết
      const productDetails = Object.values(groupedItems)
          .map((group) => {
              let groupHtml = '';
              if (group.buildId) {
                  groupHtml += `<li style="font-weight: bold; color: #1e90ff; margin-bottom: 5px;">BuildPC: ${group.buildName}</li>`;
              }
              const itemsHtml = group.items
                  .map((item) => {
                      // Sửa logic description: linh kiện BuildPC dùng nameVariants, sản phẩm thường dùng cả productName và nameVariants
                      let description = item.buildId 
                          ? (item.nameVariants || "Linh kiện không tên") 
                          : `${item.productName || ""}${item.nameVariants ? ` (${item.nameVariants})` : ""}` || "Sản phẩm không tên";
                      const itemTotal = (item.productPrice * item.quantity).toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                      })
                      .replace("₫", "VNĐ");
                      return `<li style="margin-left: ${group.buildId ? '20px' : '0'}; list-style-type: ${group.buildId ? "'↳ '" : "'- '"}">${description} × ${item.quantity} - ${itemTotal}</li>`;
                  })
                  .join('');
              return groupHtml + itemsHtml;
          })
          .join('');

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
            text: error.message || "Đã xảy ra lỗi trong quá trình đặt hàng. Vui lòng thử lại.",
            icon: "error",
        });
    } finally {
        setLoading(false);
    }
};

return (
  <div className="container mx-auto p-4">
    <OrderBr />
    {/* Thay đổi grid layout để OrderInfo chiếm nhiều không gian hơn */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-4">
        <BillingInfo
          setUserInfo={setUserInfo}
          userInfo={userInfo}
          setShippingFee={setShippingFee}
          fetchShippingFee={fetchShippingFee}
        />
        
        {/* Nút đặt hàng đã được di chuyển xuống dưới BillingInfo */}
        <button
          onClick={handlePlaceOrder}
          className="mt-4 w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "ĐẶT HÀNG"}
        </button>
      </div>
      
      <div className="md:col-span-8">
        <OrderInfo
          setPaymentMethod={setPaymentMethod}
          setVoucherDiscount={setVoucherDiscount}
          setVoucherCode={setVoucherCode}
          setVoucherid={setVoucherid}
          shippingFee={shippingFee}
          setSelectedLogo={setSelectedLogo}
        />
      </div>
    </div>
  </div>
);
};

export default GroupOrder;
