import React, { useState, useEffect } from "react";
import { Input, Button } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import {
  addAttribute,
  updateAttribute,
} from "../../../../services/AttributeService";
import Swal from "sweetalert2";

const AttributesInput = ({ selectedAttribute, onAddAttribute }) => {
  const [attributeName, setAttributeName] = useState("");
  const [attributeValue, setAttributeValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedAttribute) {
      setAttributeName(selectedAttribute.name);
      setAttributeValue(selectedAttribute.value);
      setIsEditing(true);
    }
  }, [selectedAttribute]);

  const handleSaveAttribute = async () => {
    if (!attributeName || !attributeValue) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng nhập đầy đủ tên và giá trị thuộc tính.",
      });
      return;
    }
  
    const newAttribute = {
      id: selectedAttribute?.id, // Đảm bảo lấy đúng ID
      name: attributeName,
      value: attributeValue,
    };
  
    setLoading(true);
  
    try {
      let data;
      if (isEditing) {
        if (!newAttribute.id) {
          throw new Error("ID không hợp lệ khi cập nhật thuộc tính!");
        }
        data = await updateAttribute(newAttribute); // Gọi API update với ID đúng
      } else {
        data = await addAttribute(newAttribute); // Gọi API add nếu là mới
      }
  
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: isEditing
          ? "Cập nhật thuộc tính thành công!"
          : "Thêm thuộc tính thành công!",
      });
  
      if (typeof onAddAttribute === "function") {
        onAddAttribute(data);
      }
  
      // Reset form
      setAttributeName("");
      setAttributeValue("");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi lưu thuộc tính:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể lưu thuộc tính.",
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-80">
      <div className="mb-3">
        <Input
          type="text"
          label="Tên Thuộc Tính"
          value={attributeName}
          onChange={(e) => setAttributeName(e.target.value)}
          placeholder="Nhập tên thuộc tính..."
          className="w-full"
          variant="bordered"
        />
      </div>

      <div className="mb-4">
        <Input
          type="text"
          label="Giá Trị Thuộc Tính"
          value={attributeValue}
          onChange={(e) => setAttributeValue(e.target.value)}
          placeholder="Nhập giá trị thuộc tính..."
          className="w-full"
          variant="bordered"
        />
      </div>

      <Button
        color="primary"
        className="w-full"
        onClick={handleSaveAttribute}
        endContent={<FaPlus size={18} />}
        isLoading={loading}
      >
        {loading
          ? "Đang lưu..."
          : isEditing
          ? "Cập nhật Thuộc tính"
          : "Thêm Thuộc tính"}
      </Button>
    </div>
  );
};

export default AttributesInput;
