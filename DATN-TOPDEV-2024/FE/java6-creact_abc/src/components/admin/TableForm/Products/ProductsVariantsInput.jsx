import React, { useState, useEffect } from "react";
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
import { getAllAttributes } from "../../../../services/AttributeService";
import ProductVariantService from "../../../../services/ProductVariantService";

const ProductVariantsInput = ({ variant, onSave }) => {
  const [formData, setFormData] = useState({
    quantity: variant?.quantity || 1,
    images: variant?.images || [],
    status: variant?.status || "Available",
    price: variant?.price || 0,
    attributes: variant?.attributes || [],
  });

  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});

  useEffect(() => {
    const fetchAttributes = async () => {
      const attributes = await getAllAttributes();
      const attributeMap = {};
      attributes.forEach((attr) => {
        if (!attributeMap[attr.name]) {
          attributeMap[attr.name] = [];
        }
        attributeMap[attr.name].push(attr.value);
      });
      setAvailableAttributes(
        Object.keys(attributeMap).map((name) => ({ name }))
      );
      setAttributeValues(attributeMap);
    };
    fetchAttributes();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
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
    setFormData((prev) => {
      const updatedAttributes = [...prev.attributes];
      updatedAttributes[index] = {
        ...updatedAttributes[index],
        [field]: value,
      };
  
      if (field === "name") {
        // Lấy ID của thuộc tính từ availableAttributes
        const selectedAttribute = availableAttributes.find(
          (attr) => attr.name === value
        );
        console.log("Selected Attribute ID:", selectedAttribute?.id);
      }
  
      if (field === "value") {
        // Lấy ID của giá trị thuộc tính từ attributeValues
        const selectedValue = attributeValues[updatedAttributes[index].name]?.find(
          (val) => val === value
        );
        console.log("Selected Value:", selectedValue);
      }
  
      return { ...prev, attributes: updatedAttributes };
    });
  };
  

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { name: "", value: "" }],
    });
  };

  const removeAttribute = (index) => {
    const updatedAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData({ ...formData, attributes: updatedAttributes });
  };

  const handleSubmit = async () => {
    const result = await ProductVariantService.addProductVariant(formData);
    console.log(result);
    if (result) {
      onSave(result);
    }
  };

  return (
    <div className="w-[900px] max-w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="w-full h-24 flex flex-col items-center justify-center bg-default-100 rounded-lg border-2 border-dashed border-default-300">
                <FaImage className="w-8 h-8 text-default-400" />
                <span className="mt-2 text-sm text-default-400">
                  Click to upload
                </span>
              </div>
            )}
          </div>
        </label>
      </div>
      <div className="space-y-4">
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
        <Select
          label="Trạng Thái"
          selectedKeys={[formData.status]}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          variant="bordered"
        >
          <SelectItem key="Available" value="Available">
            Còn Hoạt Động
          </SelectItem>
          <SelectItem key="Unavailable" value="Unavailable">
            Hết Hoạt Động
          </SelectItem>
        </Select>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Thuộc Tính Biến Thể</p>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<FaPlus />}
              onClick={addAttribute}
            >
              Thêm
            </Button>
          </div>
          <ScrollShadow className="h-48">
            <div className="space-y-2 p-2">
              {formData.attributes.map((attr, index) => (
                <div key={index} className="flex gap-2 items-center">
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
                      <SelectItem key={option.name} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Giá trị"
                    selectedKeys={[attr.value]}
                    onChange={(e) =>
                      handleAttributeChange(index, "value", e.target.value)
                    }
                    variant="bordered"
                    size="sm"
                  >
                    {attributeValues[attr.name]?.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
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
              ))}
            </div>
          </ScrollShadow>
        </div>
        <Button color="primary" className="w-full mt-6" onClick={handleSubmit}>
          Lưu Biến Thể
        </Button>
      </div>
    </div>
  );
};

export default ProductVariantsInput;
