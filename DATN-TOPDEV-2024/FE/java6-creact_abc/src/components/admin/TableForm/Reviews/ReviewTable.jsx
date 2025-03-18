import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";

const ReviewsTable = ({ Reviews = [], onEditReviews, onDeleteReviews }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const filteredReviews = Reviews.filter((review) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const fullName = review.user?.fullName
      ? review.user.fullName.toLowerCase()
      : "";
    const productName = review.orderDetail?.product_variant_id?.nameVariants
      ? review.orderDetail.product_variant_id.nameVariants.toLowerCase()
      : "";
    const comment = review.comment ? review.comment.toLowerCase() : "";
    const status = review.user?.status ? review.user.status.toLowerCase() : "";
    const rating = review.rating;

    return (
      (fullName.includes(lowercasedSearchTerm) ||
        productName.includes(lowercasedSearchTerm) ||
        comment.includes(lowercasedSearchTerm)) &&
      (statusFilter ? status === statusFilter.toLowerCase() : true) &&
      (ratingFilter ? rating === parseInt(ratingFilter) : true)
    );
  });

  const columns = [
    {
      name: "Ảnh đại diện",
      selector: (row) => row.user?.image,
      cell: (row) => (
        <div className="w-10 h-10">
          <img
            src={row.user?.image || "https://via.placeholder.com/150"}
            alt={`${row.user?.fullName || "User"} image`}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
        </div>
      ),
    },
    {
      name: "Họ và tên",
      selector: (row) => row.user?.fullName,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.user?.email,
      sortable: true,
    },
    {
      name: "Sản phẩm",
      selector: (row) => row.orderDetail?.product_variant_id?.nameVariants,
      sortable: true,
    },
    {
      name: "Điểm đánh giá",
      selector: (row) => row.rating,
      cell: (row) => (
        <div>
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={i < row.rating ? "text-yellow-500" : "text-gray-300"}>
              ★
            </span>
          ))}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Bình luận",
      selector: (row) => row.comment,
      sortable: true,
    },
    {
      name: "Ngày tạo",
      selector: (row) => new Date(row.createAt).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Hành động",
      cell: (row) => (
        <div className="flex justify-center">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => onDeleteReviews(row.id)}>
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const exportToExcel = async () => {
    try {
      const excelData = filteredReviews.map((review) => ({
        "Họ và tên": review.user?.fullName || "",
        Email: review.user?.email || "",
        "Sản phẩm": review.orderDetail?.product_variant_id?.nameVariants || "",
        "Điểm đánh giá": review.rating || 0,
        "Bình luận": review.comment || "",
        "Ngày tạo": new Date(review.createAt).toLocaleDateString(),
        "Trạng thái": review.user?.status || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      const formData = new FormData();
      formData.append("file", new File([blob], "Reviews.xlsx"));

      await axios.post("http://localhost:8080/api/templates/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Để tải vui lòng vào mục Drive Excel!",
      });
    } catch (error) {
      console.error("Lỗi khi lưu file:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể lưu file vào cơ sở dữ liệu!",
      });
    }
  };

  return (
    <div className="p-4 bg-white">
      <div className="mb-4 flex space-x-2">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={exportToExcel}>
          Xuất Excel
        </button>
        <input
          type="text"
          className="border border-gray-300 px-4 py-2 rounded"
          placeholder="Tìm kiếm họ tên, sản phẩm, bình luận..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-gray-300 px-4 py-2 rounded"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}>
          <option value="">Số sao</option>
          <option value="1">1 Sao</option>
          <option value="2">2 Sao</option>
          <option value="3">3 Sao</option>
          <option value="4">4 Sao</option>
          <option value="5">5 Sao</option>
        </select>
      </div>

      <DataTable
        title="Danh sách đánh giá"
        columns={columns}
        data={filteredReviews}
        pagination
        highlightOnHover
        responsive
      />
    </div>
  );
};

export default ReviewsTable;
