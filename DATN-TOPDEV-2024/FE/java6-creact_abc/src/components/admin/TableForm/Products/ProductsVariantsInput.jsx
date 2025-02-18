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
import ProductVariantsTable from "./ProductVariantsTable";
import { storage } from "../../../../firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from 'sweetalert2';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  quantity: yup.number().required("Số lượng là bắt buộc").min(1, "Số lượng phải lớn hơn 0"),
  price: yup.number().required("Giá là bắt buộc").min(0, "Giá phải lớn hơn hoặc bằng 0"),
  status: yup.string().required("Trạng thái là bắt buộc"),
  images: yup.array().min(1, "Phải thêm ít nhất một hình ảnh"),
  attributes: yup.array().min(1, "Phải thêm ít nhất một thuộc tính"),
});

const ProductVariantsInput = ({ variant, onSave, productId }) => {
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    quantity: variant?.quantity || 1,
    images: variant?.images || [],
    status: variant?.status || "Available",
    price: variant?.price || 0,
    attributes: variant?.attributes || [],
  });

  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData,
  });

  useEffect(() => {
    const fetchAttributes = async () => {
      const attributes = await getAllAttributes();
      const attributeMap = {};
      attributes.forEach((attr) => {
        if (!attributeMap[attr.name]) {
          attributeMap[attr.name] = [];
        }
        attributeMap[attr.name].push({
          id: attr.id,
          name: attr.name,
          value: attr.value,
        });
      });

      setAvailableAttributes(
        Object.keys(attributeMap).map((name) => ({ name }))
      );
      setAttributeValues(attributeMap);
    };

    fetchAttributes();
  }, []);

  useEffect(() => {
    if (editingVariant) {
      const updatedFormData = {
        quantity: editingVariant.stock || 1,
        images: editingVariant.images || [],
        status: editingVariant.status || "Available",
        price: editingVariant.price || 0,
        attributes: editingVariant.attributes || [],
      };
      setFormData(updatedFormData);
      setSelectedIds(editingVariant.attributes?.map((attr) => attr.id) || []);
      reset(updatedFormData);
    }
  }, [editingVariant, reset]);

  const handleEditVariant = (variant) => {
    setEditingVariant({
      ...variant,
      stock: variant.stock,
      price: variant.price,
      status: variant.status,
      attributes: variant.attributes || [],
      images: variant.images || []
    });

    const updatedFormData = {
      quantity: variant.stock,
      images: variant.images,
      status: variant.status,
      price: variant.price,
      attributes: variant.attributes || []
    };

    setFormData(updatedFormData);
    const attributeIds = variant.attributes?.map(attr => attr.id) || [];
    setSelectedIds(attributeIds);
    reset(updatedFormData);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = [];

    for (const file of files) {
      const storageRef = ref(
        storage,
        `product_variants/${file.name}-${Date.now()}`
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      uploadedImages.push({ preview: downloadURL });
    }

    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...uploadedImages],
    }));
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleAttributeChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedAttributes = [...prev.attributes];

      if (field === "name") {
        updatedAttributes[index] = {
          name: value,
          value: "",
          id: null,
        };
      } else if (field === "value") {
        const selectedAttribute = attributeValues[
          updatedAttributes[index].name
        ]?.find((attr) => attr.value === value);

        if (selectedAttribute) {
          updatedAttributes[index] = {
            ...updatedAttributes[index],
            id: selectedAttribute.id,
            value: selectedAttribute.value,
          };
        } else {
          updatedAttributes[index] = {
            ...updatedAttributes[index],
            id: null,
            value: "",
          };
        }
      }
      return { ...prev, attributes: updatedAttributes };
    });

    const newSelectedIds = formData.attributes
      .filter((attr) => attr.id)
      .map((attr) => attr.id);
    setSelectedIds(newSelectedIds);
  };

  const addAttribute = () => {
    setFormData((prevFormData) => {
      const newAttributes = [
        ...prevFormData.attributes,
        { name: "", value: "" },
      ];
      return {
        ...prevFormData,
        attributes: newAttributes,
      };
    });
  };

  const removeAttribute = (index) => {
    const updatedAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData({ ...formData, attributes: updatedAttributes });
  };

  const onSubmit = async (data) => {
    try {
      const newSelectedIds = formData.attributes
        .filter((attr) => attr.id)
        .map((attr) => attr.id);

      const submitData = {
        productId: productId,
        quantity: parseInt(data.quantity),
        price: parseFloat(data.price),
        status: data.status,
        attributeIds: newSelectedIds,
        imageUrls: formData.images.map((img) => img.preview),
      };

      let result;

      if (editingVariant && editingVariant.idVariants) {
        result = await ProductVariantService.updateProductVariant(editingVariant.idVariants, submitData);
      } else {
        result = await ProductVariantService.addProductVariant(submitData);
      }

      if (onSave) {
        onSave(result);
      }

      setFormData({
        quantity: 1,
        images: [],
        status: "Available",
        price: 0,
        attributes: [],
      });
      setEditingVariant(null);
      setSelectedIds([]);

      await Swal.fire({
        icon: 'success',
        title: editingVariant?.idVariants ? 'Cập nhật thành công!' : 'Thêm mới thành công!',
        text: editingVariant?.idVariants ? 'Biến thể đã được cập nhật.' : 'Biến thể mới đã được thêm.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });

    } catch (error) {
      console.error("Error in handleSubmit:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra!',
        text: 'Vui lòng thử lại sau.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Đóng'
      });
    }
  };

  const submitButtonText =
    editingVariant && editingVariant.idVariants
      ? "Cập nhật biến thể"
      : "Thêm biến thể mới";

  return (
    <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="w-full h-24 flex flex-col items-center justify-center bg-default-100 rounded-lg border-2 border-dashed border-default-300">
                <FaImage className="w-8 h-8 text-default-400" />
                <span className="mt-2 text-sm text-default-400">
                  Click to upload
                </span>
              </div>
            )}
          </div>
        </label>
        {errors.images && <p className="text-red-500 text-sm">{errors.images.message}</p>}

        <div className="mt-4">
          <ProductVariantsTable
            productId={productId}
            onEditVariant={handleEditVariant}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Số Lượng"
              type="number"
              variant="bordered"
              error={errors.quantity?.message}
            />
          )}
        />
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Giá"
              type="number"
              variant="bordered"
              error={errors.price?.message}
            />
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Trạng Thái"
              variant="bordered"
              error={errors.status?.message}
              selectedKeys={[field.value]} // Ensure the selected value is set correctly
              onChange={(e) => field.onChange(e.target.value)} // Handle the change event
            >
              <SelectItem key="Available" value="Available">
                Còn Hoạt Động
              </SelectItem>
              <SelectItem key="Unavailable" value="Unavailable">
                Hết Hoạt Động
              </SelectItem>
            </Select>
          )}
        />
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
                    selectedKeys={
                      attr.value ? new Set([attr.value]) : new Set()
                    }
                    onChange={(e) =>
                      handleAttributeChange(index, "value", e.target.value)
                    }
                    variant="bordered"
                    size="sm"
                  >
                    {attributeValues[attr.name]?.map((attribute) => (
                      <SelectItem key={attribute.value} value={attribute.value}>
                        {attribute.value}
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
          {errors.attributes && <p className="text-red-500 text-sm">{errors.attributes.message}</p>}
        </div>
        <Button color="primary" className="w-full mt-6" onClick={handleSubmit(onSubmit)}>
          {submitButtonText}
        </Button>
      </div>
    </div>
  );
};

export default ProductVariantsInput;
