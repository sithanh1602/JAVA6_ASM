import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
} from "@nextui-org/react";
import { FaStar } from "react-icons/fa";
import Swal from "sweetalert2";
import RatingService from "../../services/RatingService";
import OrderService from "../../services/OrderSevice";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const ReviewComponent = ({ orderId, orderProducts, onReviewSubmitted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productReviews, setProductReviews] = useState({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      let fetchedProducts;
      if (typeof orderProducts === "function") {
        fetchedProducts = await orderProducts();
      } else {
        fetchedProducts = orderProducts;
      }

      setProducts(fetchedProducts);

      // Khởi tạo đánh giá cho từng sản phẩm với ID duy nhất
      const initialReviews = {};
      fetchedProducts.forEach((product) => {
        // Sử dụng OrderDetailId làm key duy nhất cho mỗi đánh giá
        initialReviews[product.OrderDetailId] = {
          rating: 0,
          hover: 0,
          feedback: "",
          productId: product.id, // Lưu thêm productId để reference
        };
      });
      setProductReviews(initialReviews);
    };

    if (isModalOpen) fetchProducts();
  }, [isModalOpen, orderProducts]);

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

  const handleRatingChange = (orderDetailId, value) => {
    setProductReviews((prev) => ({
      ...prev,
      [orderDetailId]: {
        ...prev[orderDetailId],
        rating: value,
      },
    }));
  };

  const handleHoverChange = (orderDetailId, value) => {
    setProductReviews((prev) => ({
      ...prev,
      [orderDetailId]: {
        ...prev[orderDetailId],
        hover: value,
      },
    }));
  };

  const handleFeedbackChange = (orderDetailId, value) => {
    setProductReviews((prev) => ({
      ...prev,
      [orderDetailId]: {
        ...prev[orderDetailId],
        feedback: value,
      },
    }));
  };

  const validateAllReviews = () => {
    const invalidProducts = products.filter((product) => {
      const review = productReviews[product.OrderDetailId];
      return !review || review.rating === 0 || !review.feedback.trim();
    });

    return invalidProducts.length === 0 ? true : invalidProducts;
  };

  const handleSubmitRatings = async () => {
    const validationResult = validateAllReviews();

    if (validationResult !== true) {
      const missingReviews = validationResult.map((p) => p.name).join(", ");
      Swal.fire({
        title: "Chưa hoàn thành đánh giá",
        html: `Vui lòng đánh giá đầy đủ (số sao và phản hồi) cho các sản phẩm: <br><strong>${missingReviews}</strong>`,
        icon: "warning",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Xác nhận gửi đánh giá",
      text: "Bạn có chắc muốn gửi đánh giá cho tất cả sản phẩm?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Gửi",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      Swal.fire("Lỗi!", "Vui lòng đăng nhập lại.", "error");
      return;
    }

    try {
      // Gửi đánh giá cho từng sản phẩm
      const reviewPromises = products.map((product) => {
        const review = productReviews[product.OrderDetailId];
        const reviewData = {
          user: { userId: userId },
          orderDetail: { id: product.OrderDetailId },
          rating: review.rating,
          comment: review.feedback,
          createAt: new Date().toISOString(),
        };

        return RatingService.createReview(reviewData);
      });

      await Promise.all(reviewPromises);

      // Cập nhật trạng thái đơn hàng
      await OrderService.updateOrderStatus(orderId, 10);
      const localUserId = localStorage.getItem("UserId");
      const ordersData = await OrderService.getOrdersByUserId(localUserId);
      setOrders(ordersData);

      Swal.fire(
        "Thành công!",
        "Đánh giá đã được gửi cho tất cả sản phẩm.",
        "success"
      );
      setIsModalOpen(false);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      Swal.fire("Lỗi!", "Không thể gửi đánh giá. Vui lòng thử lại.", "error");
    }
  };

  const renderStarRating = (orderDetailId) => {
    const review = productReviews[orderDetailId] || { rating: 0, hover: 0 };

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <button
                key={index}
                className="bg-transparent border-none outline-none cursor-pointer p-1"
                onClick={() => handleRatingChange(orderDetailId, ratingValue)}
                onMouseEnter={() =>
                  handleHoverChange(orderDetailId, ratingValue)
                }
                onMouseLeave={() => handleHoverChange(orderDetailId, 0)}>
                <FaStar
                  className="text-2xl transition-colors duration-200"
                  color={
                    ratingValue <= (review.hover || review.rating)
                      ? "#ffc107"
                      : "#e4e5e9"
                  }
                />
              </button>
            );
          })}
        </div>
        <span className="text-sm text-gray-600">
          {review.rating > 0
            ? `Đã chọn: ${review.rating} sao`
            : "Chưa đánh giá"}
        </span>
      </div>
    );
  };

  return (
    <>
      <Button
        size="sm"
        color="warning"
        onClick={() => setIsModalOpen(true)}
        className="rounded-none">
        Đánh giá sản phẩm
      </Button>

      <Modal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        size="5xl"
        scrollBehavior="inside"
        className="rounded-none">
        <ModalContent>
          <ModalHeader className="text-xl font-bold border-b">
            Đánh giá sản phẩm trong đơn hàng
          </ModalHeader>
          <ModalBody className="p-4">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {products.map((product, index) => (
                  <Card key={product.OrderDetailId} className="shadow-md">
                    <CardHeader className="flex justify-between items-center bg-gray-50 p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                        />
                        <div>
                          <h3 className="text-lg font-semibold">
                            {product.name}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <p>Số lượng: {product.quantity}</p>
                            <p>Giá: {product.price.toLocaleString()} VNĐ</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardBody className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đánh giá sản phẩm {product.name}
                          </label>
                          {renderStarRating(product.OrderDetailId)}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhận xét về sản phẩm
                          </label>
                          <Textarea
                            value={
                              productReviews[product.OrderDetailId]?.feedback ||
                              ""
                            }
                            onChange={(e) =>
                              handleFeedbackChange(
                                product.OrderDetailId,
                                e.target.value
                              )
                            }
                            placeholder={`Chia sẻ trải nghiệm của bạn về ${product.name}...`}
                            rows={3}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {productReviews[product.OrderDetailId]?.feedback
                              ? `Số ký tự: ${
                                  productReviews[product.OrderDetailId].feedback
                                    .length
                                }`
                              : "Hãy chia sẻ ý kiến của bạn"}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Không có sản phẩm nào để đánh giá
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="border-t">
            <Button
              color="danger"
              size="md"
              className="rounded-md"
              onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button
              color="primary"
              size="md"
              className="rounded-md"
              onClick={handleSubmitRatings}>
              Gửi tất cả đánh giá
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReviewComponent;
