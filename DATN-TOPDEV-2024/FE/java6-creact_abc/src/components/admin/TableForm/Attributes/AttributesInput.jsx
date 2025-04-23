import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { addAttribute, updateAttribute } from "../../../../services/AttributeService";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Validation schema
const schema = yup.object().shape({
  name: yup
    .string()
    .required("Tên thuộc tính là bắt buộc")
    .min(2, "Tên thuộc tính phải có ít nhất 2 ký tự"),
  value: yup
    .string()
    .required("Giá trị thuộc tính là bắt buộc")
    .min(1, "Giá trị thuộc tính không được để trống")
});

const AttributesInput = ({ selectedAttribute, onAddAttribute }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      value: ""
    }
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  useEffect(() => {
    // Nếu có selectedAttribute mới khác với đang chỉnh sửa hiện tại, reset form với dữ liệu mới
    if (selectedAttribute && selectedAttribute.id !== (editingAttribute && editingAttribute.id)) {
      reset({
        name: selectedAttribute.name,
        value: selectedAttribute.value
      });
      clearErrors();
      setEditingAttribute(selectedAttribute);
      setIsEditing(true);
    } else if (!selectedAttribute) {
      // Nếu không có selectedAttribute (ví dụ sau khi thêm thành công), reset form về mặc định
      reset({
        name: "",
        value: ""
      });
      clearErrors();
      setEditingAttribute(null);
      setIsEditing(false);
    }
  }, [selectedAttribute, reset, clearErrors, editingAttribute]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const newAttribute = {
        id: editingAttribute?.id,
        name: data.name,
        value: data.value
      };

      let result;
      if (isEditing && editingAttribute?.id) {
        result = await updateAttribute(newAttribute);
      } else {
        result = await addAttribute(newAttribute);
      }

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: isEditing
          ? "Cập nhật thuộc tính thành công!"
          : "Thêm thuộc tính thành công!"
      });

      if (typeof onAddAttribute === "function") {
        onAddAttribute(result);
      }

      // Reset lại form và trạng thái sau khi thành công
      reset({
        name: "",
        value: ""
      });
      clearErrors();
      setEditingAttribute(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi lưu thuộc tính:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể lưu thuộc tính."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="p-6 bg-white rounded-lg w-80">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Thuộc Tính</label>
            <input
              {...register("name")}
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên thuộc tính"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá Trị Thuộc Tính</label>
            <input
              {...register("value")}
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập giá trị thuộc tính"
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
            )}
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            endContent={isEditing ? <FaEdit size={18} /> : <FaPlus size={18} />}
            isLoading={loading}
          >
            {loading
              ? "Đang lưu..."
              : isEditing
              ? "Cập nhật Thuộc tính"
              : "Thêm Thuộc tính"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AttributesInput;
