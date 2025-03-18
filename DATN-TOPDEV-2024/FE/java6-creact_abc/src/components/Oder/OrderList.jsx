import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OrderService from "../../services/OrderSevice";
import RatingService from "../../services/RatingService";
import {
  faBoxOpen,
  faCheckCircle,
  faCheckDouble,
  faClipboardCheck,
  faDollarSign,
  faExclamationCircle,
  faHandshake,
  faQuestionCircle,
  faTimesCircle,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { FaStar } from "react-icons/fa";

const getStatusInfo = (status) => {
  const statusMap = {
    1: {
      text: "Đã đặt hàng",
      icon: faClipboardCheck,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    2: {
      text: "Chưa thanh toán",
      icon: faExclamationCircle,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    3: {
      text: "Đã thanh toán",
      icon: faDollarSign,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    4: {
      text: "Đã xác nhận",
      icon: faCheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    5: {
      text: "Đang giao hàng",
      icon: faTruck,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
    6: {
      text: "Đã giao hàng",
      icon: faBoxOpen,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    7: {
      text: "Đã nhận hàng",
      icon: faHandshake,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    8: {
      text: "Hoàn thành",
      icon: faCheckDouble,
      color: "text-teal-500",
      bgColor: "bg-teal-100",
    },
    9: {
      text: "Đã hủy",
      icon: faTimesCircle,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
    },
    15: {
      text: "Đã đánh giá",
      icon: faCheckDouble,
      color: "text-teal-500",
      bgColor: "bg-teal-100",
    },
  };
  return (
    statusMap[status] || {
      text: "Không xác định",
      icon: faQuestionCircle,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
    }
  );
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderProducts, setOrderProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalRating, setIsModalRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [userId, setUserId] = useState("");
  const [orderDetailID, setorderDetailId] = useState("");
  const [productID, setProductID] = useState(null);

  console.log(productID);

  // Hàm lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem("UserId");
      if (!userId) throw new Error("Không tìm thấy UserId trong localStorage");
      const ordersData = await OrderService.getOrdersByUserId(userId);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API cleanupUnpaidOrders
  const cleanupUnpaidOrders = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/orders/cleanup-unpaid",
        {
            name: 'Trạng thái',
            cell: row => {
                const status = getStatusInfo(row.status);
                return (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bgColor}`}>
                        <FontAwesomeIcon icon={status.icon} className={`${status.color}`} />
                        <span className={`${status.color} font-medium`}>{status.text}</span>
                        {row.status === 2 && (
                            <span className="text-xs text-red-500 ml-2">
                                (Còn {getTimeRemaining(row.orderDate)})
                            </span>
                        )}
                    </div>
                );
            },
            sortable: true
        },
        {
            name: 'Tổng Tiền',
            selector: row => row.totalPrice,
            sortable: true,
            cell: row => <span className="text-red-500">{row.totalPrice.toLocaleString()} VNĐ</span>
        },
        {
            name: 'Ngày Đặt',
            selector: row => new Date(row.orderDate).toLocaleDateString(),
            sortable: true
        },
        {
            name: 'Địa Chỉ Giao Hàng',
            selector: row => row.fullAddress,
            wrap: true,
            sortable: true,
            cell: row => <div style={{ fontSize: '12px' }}>{row.fullAddress}</div>
        },
        {
            name: 'Trạng thái thanh toán',
            selector: row => row.paymentStatus,
            cell: row => (
                <span className={`font-medium ${row.paymentStatus ? 'text-green-500' : 'text-blue-500'}`}>
                    {row.paymentStatus ? 'Online' : 'COD'}
                </span>
            ),
            sortable: true
        },
        {
            name: 'Hành Động',
            cell: row => (
                <div className="flex flex-col gap-2 p-4">
                    <Button
                        onClick={() => openModal(row)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 text-xs"
                    >
                        Xem Chi Tiết
                    </Button>
                    {row.paymentStatus && (row.status === 1 || row.status === 2) && (
                        <Button
                            onClick={() => handlePayment(row.id)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 text-xs"
                        >
                            Thanh Toán
                        </Button>
                    )}
                    {[1, 2, 3].includes(row.status) && (
                        <Button
                            onClick={() => handleCancelOrder(row.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 text-xs"
                        >
                            Hủy đơn hàng
                        </Button>
                    )}
                    {/* {row.status === 7 && (
                        <Button
                            onClick={() => handleConfirmReceived(row.id)}
                            className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-1 px-2 text-xs"
                        >
                            Đã nhận hàng
                        </Button>
                    )} */}
                </div>
            ),
        }
      );
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        // Sau khi xóa thành công, cập nhật lại danh sách đơn hàng
        await fetchOrders();
      } else {
        console.error("Lỗi khi xóa đơn hàng:", result.error);
      }
    } catch (err) {
      console.error("Không thể kết nối đến server:", err);
    }
  };

  useEffect(() => {
    // Gọi cleanupUnpaidOrders ngay lập tức khi vào trang
    cleanupUnpaidOrders();

    // Gọi fetchOrders lần đầu sau khi cleanup
    fetchOrders();

    // Thiết lập interval để tự động gọi cleanupUnpaidOrders mỗi 5 phút
    const cleanupInterval = setInterval(() => {
      cleanupUnpaidOrders();
    }, 5 * 60 * 1000); // 5 phút

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(cleanupInterval);
  }, []);

  const openModal = async (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    try {
      const products = await OrderService.getProductsByOrderId(order.id);
      setOrderProducts(products);
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
      setOrderProducts([]);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setOrderProducts([]);
  };

  //   Start Đánh gía sản phẩm
  const openModalRating = async (order) => {
    setSelectedOrder(order);
    setIsModalRating(true);
    try {
      const products = await OrderService.getProductsByOrderId(order.id);
      const productsID = await OrderService.getOrderById(order.id);
      setorderDetailId(productsID);
      setOrderProducts(products);
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
      setOrderProducts([]);
    }
  };

  const closeModalRating = () => {
    setIsModalRating(false);
    setSelectedOrder(null);
    setOrderProducts([]);
  };

  // Hàm lấy thông tin người dùng từ token
  const getUserFromToken = () => {
    const token = Cookies.get("token");
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      console.log("Token giải mã:", decodedToken);
      return {
        userId: decodedToken.userId, // Giả định token có userId
      };
    } catch (err) {
      console.error("Token không hợp lệ:", err);
      return null;
    }
  };

  const forbiddenWords = [
    "đ*t",
    "l*n",
    "c*c",
    "b*i",
    "mẹ mày",
    "đụ",
    "đéo",
    "chó",
    "đĩ",
    "thằng khốn",
    "con khốn",
    "đồ ngu",
    "mặt l*n",
    "đầu buồi",
    "buồi",
    "đít",
    "đờ mờ",
    "đm",
    "đcm",
    "đkm",
    "vl",
    "vcl",
    "vkl",
    "đệch",
    "mẹ kiếp",
    "con mẹ nó",
    "mày",
    "mẹ cha mày",
    "đồ chó",
    "con chó",
    "đồ đĩ",
    "con đĩ",
    "thằng điên",
    "con điên",
    "đồ khốn nạn",
    "khốn nạn",
    "khốn kiếp",
    "đồ đểu",
    "đểu",
    "đồ súc vật",
    "súc vật",
    "đồ chết tiệt",
    "chết tiệt",
    "đồ khốn khổ",
    "đồ thối tha",
    "thối tha",
    "mẹ mày chết",
    "cha mày chết",
    "đồ mặt dày",
    "mặt dày",
    "đồ mặt thớt",
    "mặt thớt",
    "đồ hèn",
    "hèn hạ",
    "đồ bẩn",
    "bẩn thỉu",
    "đồ rác",
    "rác rưởi",
    "đồ thối",
    "đồ bựa",
    "bựa",
    "đồ láo",
    "láo toét",
    "đồ hỗn",
    "hỗn láo",
    "đồ mất dạy",
    "mất dạy",
    "đồ vô học",
    "vô học",
    "sex",
    "dâm",
    "làm tình",
    "địt nhau",
    "phim heo",
    "con đĩ",
    "đĩ đực",
    "cave",
    "gái gọi",
    "trai bao",
    "hiếp",
    "cưỡng",
    "đụ nhau",
    "bú",
    "liếm",
    "mút",
    "sục",
    "thủ dâm",
    "đút",
    "chịch",
    "nện",
    "phang",
    "đâm",
    "xoa",
    "sờ",
    "móc",
    "ngực",
    "vú",
    "mông",
    "lỗ đít",
    "hậu môn",
    "âm đạo",
    "dương vật",
    "tinh trùng",
    "đồ chơi tình dục",
    "sex toy",
    "địt mẹ",
    "đụ mẹ",
    "địt cha",
    "đụ cha",
    "địt con",
    "đụ con",
    "gái điếm",
    "trai điếm",
    "bán dâm",
    "mua dâm",
    "phò",
    "đĩ thõa",
    "đĩ rạc",
    "đĩ thúi",
    "đĩ bẩn",
    "lồn",
    "cu",
    "cặc",
    "buồi to",
    "lồn to",
    "mọi",
    "thổ dân",
    "đen",
    "tàu",
    "tây",
    "đạo hồi khùng",
    "công giáo ngu",
    "phật giáo dởm",
    "giáo đồ điên",
    "mít đặc",
    "khựa",
    "ngoại lai",
    "thằng tàu",
    "con tàu",
    "thằng tây",
    "con tây",
    "đen thui",
    "đen sì",
    "đen nhẻm",
    "đen thùi lùi",
    "mọi rợ",
    "mọi đen",
    "thằng mọi",
    "con mọi",
    "người rừng",
    "đồ rừng rú",
    "thằng khựa",
    "con khựa",
    "tàu khựa",
    "đồ tàu",
    "đồ tây",
    "tây đế",
    "đạo hồi dơ",
    "công giáo bẩn",
    "phật giáo giả",
    "đạo dỏm",
    "đạo đểu",
    "thằng giáo đồ",
    "con giáo đồ",
    "mít ướt",
    "mít khô",
    "đồ mít",
    "người mít",
    "đồ ngoại",
    "ngoại bang",
    "đồ lai căng",
    "lai căng",
    "ngu",
    "điên",
    "khùng",
    "thần kinh",
    "đồ bỏ",
    "vô dụng",
    "đi chết đi",
    "tự tử",
    "giết",
    "đâm",
    "chém",
    "bắn",
    "cút",
    "biến",
    "hãm",
    "thối",
    "ghê tởm",
    "kinh tởm",
    "đồ điên",
    "đồ khùng",
    "đồ thần kinh",
    "đồ rác rưởi",
    "rác rưởi",
    "đồ thất bại",
    "thất bại",
    "đồ kém",
    "kém cỏi",
    "đồ vô tích sự",
    "vô tích sự",
    "đồ chết dẫm",
    "chết dẫm",
    "đồ chết toi",
    "chết toi",
    "đồ ngu si",
    "ngu si",
    "đồ đần",
    "đần độn",
    "đồ chậm chạp",
    "chậm chạp",
    "đồ hèn nhát",
    "hèn nhát",
    "đồ yếu đuối",
    "yếu đuối",
    "đồ vô liêm sỉ",
    "vô liêm sỉ",
    "đồ xấu xa",
    "xấu xa",
    "đồ bỉ ổi",
    "bỉ ổi",
    "đồ đê tiện",
    "đê tiện",
    "đồ ác",
    "ác độc",
    "đồ ác ôn",
    "ác ôn",
    "đồ sát nhân",
    "sát nhân",
    "đồ giết người",
    "giết người",
    "đồ khủng bố",
    "khủng bố",
    "đồ phá hoại",
    "phá hoại",
    "đồ ăn hại",
    "ăn hại",
    "đồ ăn bám",
    "ăn bám",
    "đồ ký sinh",
    "ký sinh",
    "đồ thừa thãi",
    "thừa thãi",
    "đmm",
    "đkmn",
    "vãi",
    "vãi l*n",
    "vãi đái",
    "vãi cứt",
    "cứt",
    "đái",
    "ỉa",
    "tè",
    "són",
    "xạo",
    "xạo l*n",
    "nói láo",
    "nói phét",
    "phét lác",
    "chém gió",
    "ba xạo",
    "ba láp",
    "ba lăng nhăng",
    "đồ ba láp",
    "đồ xàm",
    "xàm",
    "xàm l*n",
    "đồ nhảm",
    "nhảm nhí",
    "đồ vớ vẩn",
    "vớ vẩn",
    "đồ tầm bậy",
    "tầm bậy",
    "đồ tầm phào",
    "tầm phào",
    "đồ dơ",
    "dơ dáy",
    "đồ hôi",
    "hôi thối",
    "đồ bốc mùi",
    "bốc mùi"
  ];

  const containsForbiddenWords = (text) => {
    const lowerText = text.toLowerCase();
    const regex = new RegExp(`\\b(${forbiddenWords.join("|")})\\b`, "i");
    return regex.test(lowerText);
  };

  const handleSubmitRating = async () => {
    const result = await Swal.fire({
      title: "Xác nhận gửi đánh giá",
      text: "Bạn có chắc muốn gửi đánh giá này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Gửi",
      cancelButtonText: "Hủy",
    });
  
    if (!result.isConfirmed) return;
    const userId = getUserFromToken();
    // if (containsForbiddenWords(feedback)) {
    //   Swal.fire(
    //     "Lỗi!",
    //     "Phản hồi của bạn chứa từ ngữ không phù hợp. Vui lòng kiểm tra lại!",
    //     "error"
    //   );
    //   return;
    // }

    if (!userId) {
      Swal.fire(
        "Không tìm thấy thông tin người dùng!",
        "Vui lòng đăng nhập lại",
        "error"
      );
      return;
    }

    if (rating === 0 || !feedback.trim()) {
      Swal.fire("Vui lòng chọn số sao và nhập phản hồi!", "", "error");
      return;
    }

    if (!productID) {
      Swal.fire("Lỗi!", "Không tìm thấy sản phẩm để đánh giá", "error");
      return;
    }

    const reviewData = {
      user: { userId: userId.userId },
      orderDetail: { id: orderProducts[0]?.OrderDetailId },
      rating: rating,
      comment: feedback,
      createAt: new Date().toISOString(),
    };

    try {
      await RatingService.createReview(reviewData);
      await OrderService.updateOrderStatus(productID, 15);
      const userId = localStorage.getItem("UserId");
      const ordersData = await OrderService.getOrdersByUserId(userId);
      setOrders(ordersData);
      Swal.fire("Gửi đánh giá thành công!", "", "success");
      setRating(0);
      setFeedback("");
      closeModalRating();
      console.log("Đánh giá:", reviewData);
    } catch (error) {
      console.error("Lỗi khi thêm review:", error);
      Swal.fire("Không thể thêm đánh giá. Vui lòng thử lại sau!", "", "error");
    }
  };

  //   End Đánh gía sản phẩm

  const handlePayment = async (orderId) => {
    const userId = getUserFromToken();
    console.log("UserID:", userId);

    const selectedOrder = orders.find((order) => order.id === orderId);
    if (!selectedOrder) {
      alert("Không tìm thấy thông tin đơn hàng!");
      console.error("Order not found for ID:", orderId);
      return;
    }

    if (!userId) {
      alert("Không thể xác định người dùng. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      const response = await OrderService.placeOrderNosave(
        selectedOrder,
        userId,
        orderId
      );
      console.log("URL thanh toán nhận được:", response);
      if (response) {
        window.location.href = response;
      } else {
        alert("Không nhận được URL thanh toán. Vui lòng thử lại.");
      }
    } catch (error) {
      console.log("userId:", userId, "orderId:", orderId);
      alert("Thanh toán thất bại, vui lòng thử lại.");
      console.error(
        "Lỗi khi thanh toán:",
        error.response?.data || error.message
      );
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn hủy đơn hàng này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Hủy đơn hàng",
      cancelButtonText: "Quay lại",
    });

    if (result.isConfirmed) {
      try {
        await OrderService.updateOrderStatus(orderId, 9);
        const userId = localStorage.getItem("UserId");
        const ordersData = await OrderService.getOrdersByUserId(userId);
        setOrders(ordersData);
        Swal.fire(
          "Hủy thành công!",
          "Đơn hàng của bạn đã được hủy.",
          "success"
        );
      } catch (err) {
        console.error("Lỗi hủy đơn hàng:", err);
        Swal.fire(
          "Lỗi!",
          "Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại.",
          "error"
        );
      }
    }
  };

  const getTimeRemaining = (orderDate) => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const diffInMs = currentTime - orderTime;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const remainingMs = oneDayInMs - diffInMs;

    if (remainingMs <= 0) return "Đã hết hạn";
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} giờ ${minutes} phút hết hạng thanh toán`;
  };

  const orderColumns = [
    { name: "Mã Đơn Hàng", selector: (row) => row.orderNum, sortable: true },
    {
      name: "Trạng thái",
      cell: (row) => {
        const status = getStatusInfo(row.status);
        return (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bgColor}`}>
            <FontAwesomeIcon icon={status.icon} className={`${status.color}`} />
            <span className={`${status.color} font-medium`}>{status.text}</span>
            {row.status === 2 && (
              <span className="text-xs text-red-500 ml-2">
                (Còn {getTimeRemaining(row.orderDate)})
              </span>
            )}
          </div>
        );
      },
      sortable: true,
    },
    {
      name: "Tổng Tiền",
      selector: (row) => row.totalPrice,
      sortable: true,
      cell: (row) => (
        <span className="text-red-500">
          {row.totalPrice.toLocaleString()} VNĐ
        </span>
      ),
    },
    {
      name: "Ngày Đặt",
      selector: (row) => new Date(row.orderDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Địa Chỉ Giao Hàng",
      selector: (row) => row.fullAddress,
      wrap: true,
      sortable: true,
      cell: (row) => <div style={{ fontSize: "12px" }}>{row.fullAddress}</div>,
    },
    {
      name: "Trạng thái thanh toán",
      selector: (row) => row.paymentStatus,
      cell: (row) => (
        <span
          className={`font-medium ${
            row.paymentStatus ? "text-green-500" : "text-blue-500"
          }`}>
          {row.paymentStatus ? "Thanh toán online" : "Thanh toán khi nhận hàng"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Hành Động",
      cell: (row) => (
        <div className="flex flex-col gap-2 p-4">
          <Button
            onClick={() => openModal(row)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 text-xs">
            Xem Chi Tiết
          </Button>
          {row.paymentStatus && (row.status === 1 || row.status === 2) && (
            <Button
              onClick={() => handlePayment(row.id)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 text-xs">
              Thanh Toán
            </Button>
          )}
          { row.status === 6 && row.status !== 15 && (
            <Button
              onClick={() => {
                openModalRating(row);
                setProductID(row.id);
              }}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 text-xs">
              Đánh giá
            </Button>
          )}

          {[1, 2, 3].includes(row.status) && (
            <Button
              onClick={() => handleCancelOrder(row.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 text-xs">
              Hủy đơn hàng
            </Button>
          )}
        </div>
      ),
    },
  ];

  const productColumns = [
    {
      name: "Ảnh",
      cell: (row) => (
        <img
          src={row.imageUrl}
          alt={row.name}
          className="w-16 h-16 object-cover rounded-md"
        />
      ),
    },
    { name: "Tên Sản Phẩm", selector: (row) => row.name, sortable: true },
    { name: "Số Lượng", selector: (row) => row.quantity, sortable: true },
    {
      name: "Giá",
      selector: (row) => row.price,
      sortable: true,
      format: (row) => `${row.price.toLocaleString()} VNĐ`,
    },
  ];

  const OrderProcessTimeline = ({ currentStatus }) => {
    const statuses = [
      { id: 1, icon: faClipboardCheck, text: "Đã đặt hàng" },
      { id: 4, icon: faCheckCircle, text: "Đã xác nhận" },
      { id: 5, icon: faTruck, text: "Đang vận chuyển" },
      { id: 8, icon: faBoxOpen, text: "Đã giao hàng" },
      { id: 7, icon: faHandshake, text: "Đã nhận hàng" },
      { id: 15, icon: faHandshake, text: "Đã đánh giá" },
    ];
    
    return (
      <div className="w-full py-8">
        <div className="flex justify-between relative">
          <div className="absolute top-6 left-0 w-full h-1 bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${
                  (Math.max(
                    0,
                    statuses.findIndex((s) => s.id === currentStatus)
                  ) /
                    (statuses.length - 1)) *
                  100
                }%`,
              }}
            />
          </div>
          {statuses.map((status) => (
            <div
              key={status.id}
              className="flex flex-col items-center relative z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                                    ${
                                      currentStatus >= status.id
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-400"
                                    }
                                    transition-all duration-300`}>
                <FontAwesomeIcon icon={status.icon} className="text-xl" />
              </div>
              <span
                className={`text-sm font-medium text-center w-24
                                ${
                                  currentStatus >= status.id
                                    ? "text-blue-500"
                                    : "text-gray-400"
                                }
                                transition-all duration-300`}>
                {status.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-6">Danh Sách Đơn Hàng</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <DataTable
        columns={orderColumns}
        data={orders}
        progressPending={loading}
        customStyles={{
          rows: { style: { fontSize: "17px", minHeight: "60px" } },
          headRow: {
            style: { backgroundColor: "#f3f4f6", fontWeight: "bold" },
          },
        }}
        noDataComponent="Không có đơn hàng nào."
        persistTableHead
      />
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="4xl">
        <ModalContent>
          <ModalHeader className="text-xl font-bold">
            Chi Tiết Đơn Hàng
          </ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="mb-2">
                      <strong>Mã Đơn Hàng:</strong> {selectedOrder.orderNum}
                    </p>
                    <p className="mb-2">
                      <strong className="pr-2">Trạng Thái:</strong>
                      <span
                        className={`ml-2 ${
                          getStatusInfo(selectedOrder.status).color
                        }`}>
                        {getStatusInfo(selectedOrder.status).text}
                      </span>
                    </p>
                    <p className="mb-2">
                      <strong className="pr-2">Tổng Tiền:</strong>
                      <span className="ml-2 text-red-500 font-medium">
                        {selectedOrder.totalPrice.toLocaleString()} VNĐ
                      </span>
                    </p>
                    <p className="mb-2">
                      <strong className="pr-2">Trạng thái thanh toán:</strong>
                      <span
                        className={`ml-2 ${
                          selectedOrder.paymentStatus
                            ? "text-green-500"
                            : "text-red-500"
                        }`}>
                        {selectedOrder.paymentStatus
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <strong className="pr-2">Ngày Đặt:</strong>
                      {new Date(selectedOrder.orderDate).toLocaleDateString()}
                    </p>
                    <p className="mb-2">
                      <strong className="pr-2">Địa Chỉ:</strong>
                      {selectedOrder.fullAddress}
                    </p>
                  </div>
                </div>
                <div className="mb-8">
                  <h3 className="font-bold mb-4">Tiến Độ Đơn Hàng:</h3>
                  <OrderProcessTimeline currentStatus={selectedOrder.status} />
                </div>
                <div>
                  <h3 className="font-bold mb-4">Sản phẩm trong đơn hàng:</h3>
                  <DataTable
                    columns={productColumns}
                    data={orderProducts}
                    noDataComponent="Không có sản phẩm nào trong đơn hàng này."
                    customStyles={{
                      rows: { style: { fontSize: "16px", minHeight: "50px" } },
                      headRow: {
                        style: {
                          backgroundColor: "#f3f4f6",
                          fontWeight: "bold",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={closeModal}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Modal đánh giá sản phẩm */}
      <Modal isOpen={isModalRating} onOpenChange={setIsModalRating} size="4xl">
        <ModalContent>
          <ModalHeader className="text-xl font-bold">
            Đánh giá sản phẩm
          </ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <div className="p-2">
                <div>
                  <h3 className="font-bold mb-3">Sản phẩm trong đơn hàng:</h3>
                  <DataTable
                    columns={productColumns}
                    data={orderProducts}
                    noDataComponent="Không có sản phẩm nào trong đơn hàng này."
                    customStyles={{
                      rows: { style: { fontSize: "16px", minHeight: "50px" } },
                      headRow: {
                        style: {
                          backgroundColor: "#f3f4f6",
                          fontWeight: "bold",
                        },
                      },
                    }}
                  />
                </div>

                <h3 className="font-bold mb-2 mt-1">Đánh giá sản phẩm</h3>
                <div className="mx-auto bg-gray-100 border-1 rounded-lg shadow-lg">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full mx-auto bg-white p-4 rounded-lg shadow">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đánh giá của bạn
                        </label>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                              <button
                                key={index}
                                className="bg-transparent border-none outline-none cursor-pointer"
                                onClick={() => setRating(ratingValue)}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(0)}
                                aria-label={`Rate ${ratingValue} out of 5 stars`}>
                                <FaStar
                                  className="text-2xl"
                                  color={
                                    ratingValue <= (hover || rating)
                                      ? "#ffc107"
                                      : "#e4e5e9"
                                  }
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mb-2">
                        <label
                          htmlFor="feedback"
                          className="block text-sm font-medium text-gray-700 mb-2">
                          Phản hồi của bạn
                        </label>
                        <textarea
                          id="feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Nhập phản hồi của bạn"
                          aria-label="Your Feedback"></textarea>
                      </div>
                      <button
                        onClick={handleSubmitRating}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                        Gửi đánh giá
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={closeModalRating}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default OrderList;
