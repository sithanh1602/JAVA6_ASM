import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { FaStar } from 'react-icons/fa';
import Swal from 'sweetalert2';
import RatingService from '../../services/RatingService';
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const ReviewComponent = ({ orderId, orderProducts, onReviewSubmitted }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (typeof orderProducts === 'function') {
                const fetchedProducts = await orderProducts();
                setProducts(fetchedProducts);
            } else {
                setProducts(orderProducts);
            }
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

        const userId = getUserIdFromToken();
        if (!userId) {
            Swal.fire("Lỗi!", "Vui lòng đăng nhập lại.", "error");
            return;
        }

        if (rating === 0 || !feedback.trim()) {
            Swal.fire("Lỗi!", "Vui lòng chọn số sao và nhập phản hồi.", "error");
            return;
        }

        if (!products.length) {
            Swal.fire("Lỗi!", "Không tìm thấy sản phẩm để đánh giá.", "error");
            return;
        }

        const reviewData = {
            user: { userId: userId },
            orderDetail: { id: products[0]?.OrderDetailId }, // Giả định có OrderDetailId
            rating: rating,
            comment: feedback,
            createAt: new Date().toISOString(),
        };

        try {
            await RatingService.createReview(reviewData);
            Swal.fire("Thành công!", "Đánh giá đã được gửi.", "success");
            setRating(0);
            setFeedback("");
            setIsModalOpen(false);
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            Swal.fire("Lỗi!", "Không thể gửi đánh giá. Vui lòng thử lại.", "error");
        }
    };

    return (
        <>
            <Button
                size="sm"
                color="warning"
                onClick={() => setIsModalOpen(true)}
                className="rounded-none"
            >
                Đánh giá sản phẩm
            </Button>

            <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="4xl" className="rounded-none">
                <ModalContent>
                    <ModalHeader className="text-lg font-bold">Đánh giá đơn hàng</ModalHeader>
                    <ModalBody className="rounded-none">
                        {/* Danh sách sản phẩm */}
                        <div className="mb-4">
                            <h3 className="font-bold text-sm mb-2">Sản phẩm trong đơn hàng</h3>
                            <Table aria-label="Order products table" >
                                <TableHeader>
                                    <TableColumn>Ảnh</TableColumn>
                                    <TableColumn>Tên sản phẩm</TableColumn>
                                    <TableColumn>Số lượng</TableColumn>
                                    <TableColumn>Giá</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {products.length > 0 ? (
                                        products.map((product, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                                                </TableCell>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell>{product.quantity}</TableCell>
                                                <TableCell>{product.price.toLocaleString()} VNĐ</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell>-</TableCell>
                                            <TableCell>Không có sản phẩm nào</TableCell>
                                            <TableCell>-</TableCell>
                                            <TableCell>-</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Đánh giá sao */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đánh giá của bạn
                            </label>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, index) => {
                                    const ratingValue = index + 1;
                                    return (
                                        <button
                                            key={index}
                                            className="bg-transparent border-none outline-none cursor-pointer"
                                            onClick={() => setRating(ratingValue)}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(0)}
                                        >
                                            <FaStar
                                                className="text-xl"
                                                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Phản hồi */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phản hồi của bạn
                            </label>
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Nhập phản hồi của bạn"
                                rows={4}
                                className="w-full"
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" size="sm" className="rounded-none" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button color="primary" size="sm"  className="rounded-none" onClick={handleSubmitRating}>
                            Gửi đánh giá
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ReviewComponent;