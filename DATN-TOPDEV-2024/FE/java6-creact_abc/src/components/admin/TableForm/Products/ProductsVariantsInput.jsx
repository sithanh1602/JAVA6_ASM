import React, { useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Image,
  ScrollShadow,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { FaPlus, FaTrash, FaImage } from "react-icons/fa";

const ProductVariantsInput = ({ variant, onSave }) => {
  const [formData, setFormData] = useState({
    name_variant: variant?.name || "",
    quantity: variant?.quantity || 1,
    images: variant?.images || [],
    status: variant?.status || "",
    price: variant?.price || 0,
    attributes: variant?.attributes || [],
  });

  const availableAttributes = [
    { id: "color", label: "Màu sắc", values: ["Đỏ", "Xanh", "Vàng", "Trắng"] },
    { id: "size", label: "Kích thước", values: ["S", "M", "L", "XL"] },
    { id: "material", label: "Chất liệu", values: ["Cotton", "Jean", "Len"] },
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => {
      return {
        file,
        preview: URL.createObjectURL(file),
      };
    });
    setFormData({ ...formData, images: [...formData.images, ...newImages] });
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...formData.attributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    setFormData({ ...formData, attributes: updatedAttributes });
  };

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [
        ...formData.attributes,
        { name: "", value: "", quantity: 1 },
      ],
    });
  };

  const removeAttribute = (index) => {
    const updatedAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData({ ...formData, attributes: updatedAttributes });
  };

  const clearAttributes = () => {
    setFormData({ ...formData, attributes: [] });
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardBody className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Image Upload */}
          <div className="space-y-4">
            <p className="text-sm font-medium">Ảnh Biến Thể</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="variant-image-upload"
            />
            <label
              htmlFor="variant-image-upload"
              className="cursor-pointer block w-full"
            >
              <div className="w-full flex flex-wrap gap-2">
                {formData.images.length > 0 ? (
                  formData.images.map((img, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <Image
                        src={img.preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                        radius="lg"
                      />
                      {/* Nút xóa luôn hiển thị trên ảnh */}
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full z-10"
                        onClick={() => removeImage(index)}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  // Khi chưa có ảnh, hiển thị FaImage
                  <label
                    htmlFor="variant-image-upload"
                    className="cursor-pointer block w-full"
                  >
                    <div className="w-full h-24 flex flex-col items-center justify-center bg-default-100 rounded-lg border-2 border-dashed border-default-300">
                      <FaImage className="w-8 h-8 text-default-400" />
                      <span className="mt-2 text-sm text-default-400">
                        Click to upload
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </label>
          </div>
          {/* Right Column - Form Fields */}
          <div className="space-y-4">
            <Input
              label="Tên Biến Thể"
              name="name_variant"
              value={formData.name_variant}
              onChange={handleChange}
              variant="bordered"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số Lượng"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                variant="bordered"
              />
              <Input
                label="Giá"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                variant="bordered"
              />
            </div>

            <Input
              label="Trạng Thái"
              name="status"
              value={formData.status}
              onChange={handleChange}
              variant="bordered"
            />

            {/* Attributes Section with Scroll */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Thuộc Tính Biến Thể</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<FaPlus className="w-4 h-4" />}
                    onClick={addAttribute}
                  >
                    Thêm
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<FaTrash className="w-4 h-4" />}
                    onClick={clearAttributes}
                  >
                    Xóa hết
                  </Button>
                </div>
              </div>

              <ScrollShadow className="h-48">
                <div className="space-y-2 p-2">
                  {formData.attributes.map((attr, index) => {
                    const selectedAttribute = availableAttributes.find(
                      (a) => a.id === attr.name
                    );
                    const valueOptions = selectedAttribute
                      ? selectedAttribute.values
                      : [];

                    return (
                      <div key={index} className="flex gap-2 items-center">
                        {/* Chọn thuộc tính từ danh sách có sẵn */}
                        <Select
                          label="Thuộc tính"
                          selectedKeys={[attr.name]}
                          onChange={(e) =>
                            handleAttributeChange(index, "name", e.target.value)
                          }
                          variant="bordered"
                          size="sm"
                        >
                          {availableAttributes.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>

                        {/* Chọn giá trị từ danh sách có sẵn */}
                        <Select
                          label="Giá trị"
                          selectedKeys={[attr.value]}
                          onChange={(e) =>
                            handleAttributeChange(
                              index,
                              "value",
                              e.target.value
                            )
                          }
                          variant="bordered"
                          size="sm"
                          isDisabled={!selectedAttribute} // Vô hiệu hóa nếu chưa chọn thuộc tính
                        >
                          {valueOptions.map((val) => (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          ))}
                        </Select>

                        <Button
                          isIconOnly
                          color="danger"
                          variant="flat"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                        >
                          <FaTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollShadow>
            </div>

            <Button color="primary" className="w-full mt-6" type="submit">
              Lưu Biến Thể
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProductVariantsInput;
