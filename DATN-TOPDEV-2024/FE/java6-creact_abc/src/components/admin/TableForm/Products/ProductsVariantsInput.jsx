import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Image,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { FaPlus, FaTrash, FaImage } from "react-icons/fa";
import { getAllAttributes } from "../../../../services/AttributeService";
import ProductVariantService from "../../../../services/ProductVariantService";
import ProductVariantsTable from "./ProductVariantsTable";
import { storage } from "../../../../firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from "sweetalert2";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const schema = yup.object().shape({
  quantity: yup
    .number()
    .required("Số lượng là bắt buộc")
    .min(1, "Số lượng phải lớn hơn 0"),
  price: yup
    .number()
    .required("Giá là bắt buộc")
    .min(0, "Giá phải lớn hơn hoặc bằng 0"),
  status: yup.string().required("Trạng thái là bắt buộc"),
  images: yup.array().min(1, "Phải thêm ít nhất một hình ảnh"),
  attributes: yup.array().min(1, "Phải thêm ít nhất một thuộc tính"),
  discountPercentage: yup
    .number()
    .nullable()
    .min(5, "Phần trăm giảm giá phải từ 5% đến 15%")
    .max(15, "Phần trăm giảm giá phải từ 5% đến 15%"),
});

const ProductVariantsInput = ({ variant, onSave, productId }) => {
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    quantity: variant?.quantity || 1,
    images: variant?.images || [],
    status: variant?.status || "Available",
    price: variant?.price || 0,
    attributes: variant?.attributes || [],
    description: variant?.description || "",
    discountPercentage: variant?.discountPercentage || null,
  });

  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      quantity: 1,
      images: [],
      status: "Available",
      price: 0,
      attributes: [],
      description: "",
      discountPercentage: null,
    },
  });

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
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
      } catch (error) {
        console.error("Lỗi khi lấy thuộc tính:", error);
      }
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
        description: editingVariant.description || "",
        discountPercentage: editingVariant.discountPercentage || null,
      };

      setFormData(updatedFormData);
      setSelectedIds(editingVariant.attributes?.map((attr) => attr.id) || []);
      reset(updatedFormData);
      setValue("description", editingVariant.description || "");
      setValue("discountPercentage", editingVariant.discountPercentage || null);
    }
  }, [editingVariant, reset, setValue]);

  const handleEditVariant = (variant) => {
    setEditingVariant({
      ...variant,
      stock: variant.stock,
      price: variant.price,
      status: variant.status,
      attributes: variant.attributes || [],
      images: variant.images || [],
      description: variant.description || "",
      discountPercentage: variant.discountPercentage || null,
    });

    const updatedFormData = {
      quantity: variant.stock,
      images: variant.images,
      status: variant.status,
      price: variant.price,
      attributes: variant.attributes || [],
      description: variant.description || "",
      discountPercentage: variant.discountPercentage || null,
    };

    setFormData(updatedFormData);
    setSelectedIds(variant.attributes?.map((attr) => attr.id) || []);
    reset(updatedFormData);
    setValue("description", variant.description || "");
    setValue("discountPercentage", variant.discountPercentage || null);
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

    const newImages = [...formData.images, ...uploadedImages];
    setFormData((prevData) => ({
      ...prevData,
      images: newImages,
    }));
    setValue("images", newImages);
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
    setValue("images", updatedImages);
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

      setValue("attributes", updatedAttributes);
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
      setValue("attributes", newAttributes);
      return {
        ...prevFormData,
        attributes: newAttributes,
      };
    });
  };

  const removeAttribute = (index) => {
    const updatedAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData({ ...formData, attributes: updatedAttributes });
    setValue("attributes", updatedAttributes);
  };

  const onSubmit = async (data) => {
    try {
      const newSelectedIds = formData.attributes
        .filter((attr) => attr.id)
        .map((attr) => attr.id);

      // Định dạng discountPercentage thành số thực với 1 chữ số thập phân
      const formattedDiscountPercentage = data.discountPercentage
        ? parseFloat(data.discountPercentage.toFixed(1))
        : null;

      const submitData = {
        productId: productId,
        quantity: parseInt(data.quantity),
        price: parseFloat(data.price),
        status: data.status,
        attributeIds: newSelectedIds,
        imageUrls: formData.images.map((img) => img.preview),
        description: data.description,
        discountPercentage: formattedDiscountPercentage,
      };
      // Thêm log để kiểm tra dữ liệu trước khi gửi
      console.log("Dữ liệu gửi đi:", JSON.stringify(submitData, null, 2));
      let result;
      if (editingVariant && editingVariant.idVariants) {
        result = await ProductVariantService.updateProductVariant(
          editingVariant.idVariants,
          submitData
        );
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
        description: "",
        discountPercentage: null,
      });
      setEditingVariant(null);
      setSelectedIds([]);

      await Swal.fire({
        icon: "success",
        title: editingVariant?.idVariants
          ? "Cập nhật thành công!"
          : "Thêm mới thành công!",
        text: editingVariant?.idVariants
          ? "Biến thể đã được cập nhật."
          : "Biến thể mới đã được thêm.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });

      try {
        const newVariants =
          await ProductVariantService.getProductVariantsByProductId(productId);
        await ProductVariantService.addVariant(newVariants);
      } catch (error) {
        console.error("Lỗi khi cập nhật danh sách biến thể:", error);
      }
    } catch (error) {
      console.error("Lỗi trong handleSubmit:", error);
      await Swal.fire({
        icon: "error",
        title: "Có lỗi xảy ra!",
        text: error.message || "Vui lòng thử lại sau.",
        confirmButtonColor: "#d33",
        confirmButtonText: "Đóng",
      });
    }
  };

  const submitButtonText =
    editingVariant && editingVariant.idVariants
      ? "Cập nhật biến thể"
      : "Thêm biến thể mới";

  return (
      <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
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
                      <div
                          key={index}
                          className="relative w-32 h-32 flex items-center justify-center bg-gray-100 border rounded-lg overflow-hidden"
                      >
                        <Image
                            src={img.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            radius="lg"
                        />
                        <button
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full z-10"
                            onClick={() => removeImage(index)}
                        >
                          <FaTrash className="w-4 h-4"/>
                        </button>
                      </div>
                  ))
              ) : (
                  <div
                      className="w-full h-32 flex flex-col items-center justify-center bg-default-100 rounded-lg border-2 border-dashed border-default-300">
                    <FaImage className="w-8 h-8 text-default-400"/>
                    <span className="mt-2 text-sm text-default-400">
                  Click to upload
                </span>
                  </div>
              )}
            </div>
          </label>
          {errors.images && (
              <p className="text-red-500 text-sm">{errors.images.message}</p>
          )}

          <div className="mt-4 w-full ">
            <ProductVariantsTable
                productId={productId}
                onEditVariant={handleEditVariant}
            />
          </div>
          <Button
              color="primary"
              className="w-full mt-6"
              onClick={handleSubmit(onSubmit)}
          >
            {submitButtonText}
          </Button>
        </div>

        <div className="flex justify-end">
          <div className="space-y-4 max-w-xl">
            <Controller
                name="quantity"
                control={control}
                render={({field}) => (
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
                render={({field}) => (
                    <Input
                        {...field}
                        label="Giá"
                        type="number"
                        variant="bordered"
                        error={errors.price?.message}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const value =
                              inputValue === "" ? "" : parseFloat(inputValue) || 0;
                          field.onChange(value);
                          setFormData((prev) => ({...prev, price: value}));
                        }}
                    />
                )}
            />

            <Controller
                name="discountPercentage"
                control={control}
                render={({field}) => (
                    <Select
                        label="Phần trăm giảm giá (%)"
                        variant="bordered"
                        selectedKeys={
                          field.value ? new Set([field.value.toString()]) : new Set()
                        }
                        onSelectionChange={(keys) => {
                          const value = keys.size > 0 ? parseFloat([...keys][0]) : null;
                          field.onChange(value);
                          setFormData((prev) => ({...prev, discountPercentage: value}));
                        }}
                        classNames={{
                          trigger: "min-h-12",
                          value: "text-left",
                        }}
                    >
                      <SelectItem key="5" value={5}>
                        5%
                      </SelectItem>
                      <SelectItem key="10" value={10}>
                        10%
                      </SelectItem>
                      <SelectItem key="15" value={15}>
                        15%
                      </SelectItem>
                    </Select>
                )}
            />
            {errors.discountPercentage && (
                <p className="text-red-500 text-sm">
                  {errors.discountPercentage.message}
                </p>
            )}

            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Giá đã giảm
              </label>
              <Input
                  value={
                    formData.discountPercentage && formData.price
                        ? (
                        formData.price -
                        (formData.price * formData.discountPercentage) / 100
                    ).toLocaleString("vi-VN") + " đ"
                        : "Không có giảm giá"
                  }
                  readOnly
                  disabled
                  className="bg-gray-100"
              />
            </div>

            <Controller
                name="status"
                control={control}
                render={({field}) => (
                    <Select
                        {...field}
                        label="Trạng Thái"
                        variant="bordered"
                        error={errors.status?.message}
                        selectedKeys={[field.value]}
                        onChange={(e) => field.onChange(e.target.value)}
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

            <div className="w-full border p-2">
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Mô Tả
              </label>
              <Controller
                  name="description"
                  control={control}
                  render={({field}) => (
                      <CKEditor
                          editor={ClassicEditor}
                          data={field.value || formData.description || ""}
                          config={{
                            toolbar: [
                              "heading",
                              "|",
                              "bold",
                              "italic",
                              "link",
                              "bulletedList",
                              "numberedList",
                              "|",
                              "insertTable",
                              "tableColumn",
                              "tableRow",
                              "mergeTableCells",
                              "|",
                              "alignment:left",
                              "alignment:center",
                              "alignment:right",
                              "alignment:justify",
                              "|",
                              "insertImage",
                              "mediaEmbed",
                              "undo",
                              "redo",
                            ],
                          }}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            field.onChange(data);
                            setFormData((prev) => ({...prev, description: data}));
                          }}
                      />
                  )}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Thuộc Tính Biến Thể</p>
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<FaPlus/>}
                    onClick={addAttribute}
                >
                  Thêm
                </Button>
              </div>

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
                          classNames={{
                            listboxWrapper: "max-h-[200px]",
                          }}
                          listboxProps={{
                            className: "overflow-auto",
                            style: {maxHeight: "200px"},
                          }}
                      >
                        {availableAttributes.map((option) => (
                            <SelectItem key={option.name} value={option.name}>
                              {option.name}
                            </SelectItem>
                        ))}
                      </Select>
                      <Select
                          label="Giá trị"
                          selectedKeys={attr.value ? new Set([attr.value]) : new Set()}
                          onChange={(e) =>
                              handleAttributeChange(index, "value", e.target.value)
                          }
                          variant="bordered"
                          size="sm"
                          classNames={{
                            listboxWrapper: "max-h-[200px]",
                          }}
                          listboxProps={{
                            className: "overflow-auto",
                            style: {maxHeight: "200px"},
                          }}
                      >
                        {attributeValues[attr.name]?.map((attribute) => (
                            <SelectItem key={attribute.value} value={attribute.value}>
                              {attribute.value}
                            </SelectItem>
                        )) || []}
                      </Select>
                      <Button
                          isIconOnly
                          color="danger"
                          variant="flat"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                      >
                        <FaTrash className="w-4 h-4"/>
                      </Button>
                    </div>
                ))}
              </div>
              {errors.attributes && (
                  <p className="text-red-500 text-sm">{errors.attributes.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProductVariantsInput;
