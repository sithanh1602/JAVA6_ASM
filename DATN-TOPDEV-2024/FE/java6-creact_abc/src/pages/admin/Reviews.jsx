import React, { useState, useEffect } from "react";
import ReviewsTable from "../../components/admin/TableForm/Reviews/ReviewTable";
import Reviewservice from "../../services/ReviewsService";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Swal from "sweetalert2"; 

const AdminReviewsPage = () => {
  const [Reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await Reviewservice.getAllReviews();
      setReviews(data);
      setError(null);
    } catch (error) {
      setError("Không thể tải danh sách đánh giá. Vui lòng thử lại sau.");
      console.error("Error fetching Reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleEditReviews = (review) => {
    console.log("Edit review:", review);
  };

  const handleDeleteReviews = async (id) => {
    // Hiển thị thông báo xác nhận trước khi xóa
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể khôi phục lại đánh giá này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await Reviewservice.deleteReview(id); 
        Swal.fire("Đã xóa!", "Đánh giá đã được xóa thành công.", "success");
        fetchReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
        Swal.fire("Lỗi!", "Không thể xóa đánh giá. Vui lòng thử lại.", "error");
      }
    }
  };

  if (error) {
    return (
      <Box className="p-4">
        <Typography color="error" className="text-center">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={fetchReviews}
          className="mt-4 mx-auto block"
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box className="p-6 bg-white rounded-lg shadow-md">
      <Typography variant="h4" className="mb-4">
        Quản lý đánh giá
      </Typography>

      {isLoading ? (
        <Box className="flex justify-center items-center min-h-[200px]">
          <CircularProgress />
        </Box>
      ) : (
        <ReviewsTable
          Reviews={Reviews}
          onEditReviews={handleEditReviews}
          onDeleteReviews={handleDeleteReviews}
        />
      )}
    </Box>
  );
};

export default AdminReviewsPage;