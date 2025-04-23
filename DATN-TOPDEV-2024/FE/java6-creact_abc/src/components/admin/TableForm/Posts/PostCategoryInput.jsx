// components/PostCategoryInput.js
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PostCateService from "../../../../services/PostCateService";
import * as yup from "yup";

// Schema validation
const schema = yup.object().shape({
  name: yup.string().required("Tên danh mục không được để trống"),
  description: yup.string().required("Mô tả không được để trống"),
});

const PostCategoryInput = ({ category, onClose, onCategoryAdded }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: category || { name: "", description: "" },
  });

  useEffect(() => {
    if (category) {
      reset(category); // Đặt giá trị mặc định khi chỉnh sửa
    } else {
      reset({ name: "", description: "" });
    }
  }, [category, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (category) {
        await PostCateService.updatePostCategories(category.id, data); // Thêm phương thức update nếu chưa có
        Swal.fire("Thành công!", "Danh mục đã được cập nhật.", "success");
      } else {
        await PostCateService.addPostCategories(data);
        Swal.fire("Thành công!", "Danh mục đã được thêm.", "success");
      }
      reset();
      if (onCategoryAdded) onCategoryAdded();
      onClose();
    } catch (error) {
      Swal.fire("Lỗi!", `Có lỗi xảy ra: ${error.message}`, "error");
      console.error("Lỗi khi xử lý danh mục:", error);
      if (error.response) {
        console.log("Chi tiết lỗi từ server:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg w-[400px]">
      <h2 className="text-xl font-semibold mb-4">
        {category ? "Cập nhật danh mục" : "Thêm danh mục mới"}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tên danh mục
          </label>
          <input
            {...register("name")}
            placeholder="Nhập tên danh mục"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            {...register("description")}
            placeholder="Nhập mô tả danh mục"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
          {errors.description && (
            <span className="text-red-500 text-sm">{errors.description.message}</span>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : category ? "Cập nhật" : "Thêm danh mục"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCategoryInput;