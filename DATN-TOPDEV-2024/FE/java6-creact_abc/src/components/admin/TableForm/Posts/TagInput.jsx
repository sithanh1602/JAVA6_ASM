// components/TagInput.js
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import TagService from "../../../../services/TagPostService"; // Import TagService instance
import * as yup from "yup";
const schema = yup.object().shape({
    tagName: yup.string().required("Tên tag không được để trống"), // Sửa từ name thành tagName
    description: yup.string().required("Mô tả không được để trống"),
  });
  
  const TagInput = ({ tag, onClose, onTagAdded }) => {
    const [loading, setLoading] = useState(false);
  
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm({
      resolver: yupResolver(schema),
      defaultValues: tag || { tagName: "", description: "" }, // Sửa từ name thành tagName
    });
  
    useEffect(() => {
      if (tag) {
        reset(tag);
      } else {
        reset({ tagName: "", description: "" }); // Sửa từ name thành tagName
      }
    }, [tag, reset]);
  
    const onSubmit = async (data) => {
      setLoading(true);
      try {
        if (tag) {
          await TagService.updateTag(tag.id, data);
          Swal.fire("Thành công!", "Tag đã được cập nhật.", "success");
        } else {
          await TagService.addTag(data);
          Swal.fire("Thành công!", "Tag đã được thêm.", "success");
        }
        reset();
        if (onTagAdded) onTagAdded();
        onClose();
      } catch (error) {
        Swal.fire("Lỗi!", `Có lỗi xảy ra: ${error.message}`, "error");
        console.error("Lỗi khi xử lý tag:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="bg-white p-6 rounded-lg w-[400px]">
        <h2 className="text-xl font-semibold mb-4">
          {tag ? "Cập nhật tag" : "Thêm tag mới"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tên tag
            </label>
            <input
              {...register("tagName")} // Sửa từ name thành tagName
              placeholder="Nhập tên tag"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.tagName && (
              <span className="text-red-500 text-sm">{errors.tagName.message}</span>
            )}
          </div>
  
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              {...register("description")}
              placeholder="Nhập mô tả tag"
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
              {loading ? "Đang xử lý..." : tag ? "Cập nhật" : "Thêm tag"}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  export default TagInput;