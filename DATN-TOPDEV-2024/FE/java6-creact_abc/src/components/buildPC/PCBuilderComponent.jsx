import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
} from "@nextui-org/react";
import ComponentSelectionModal from "./ComponentSelectionModal";
import CategoryService from "../../services/CategoryService";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api/products";

const PCBuilderComponent = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState(() => {
    const savedComponents = localStorage.getItem("selectedComponents");
    return savedComponents ? JSON.parse(savedComponents) : {};
  });
  const [quantities, setQuantities] = useState(() => {
    const savedQuantities = localStorage.getItem("componentQuantities");
    return savedQuantities ? JSON.parse(savedQuantities) : {};
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [stockQuantities, setStockQuantities] = useState({});

  const navigate = useNavigate();

  // Hàm kiểm tra số lượng hiện tại từ API
  const checkVariantQuantity = async (variantId) => {
    try {
      const response = await axios.get(`${BASE_URL}/check-quantity/${variantId}`);
      return response.data; // Giả định response.data là số lượng hiện tại trong db
    } catch (error) {
      console.error(`Error checking quantity for variant ID ${variantId}:`, error);
      throw error;
    }
  };

  // Lấy số lượng trong kho từ API
  const fetchStockQuantity = async (variantId) => {
    try {
      const response = await axios.get(`${BASE_URL}/variants/${variantId}`);
      return response.data.quantity; // Giả định response.data.quantity là số lượng trong kho
    } catch (error) {
      console.error(`Error fetching stock for variant ID ${variantId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getAllCategories();
        const filteredCategories = data.filter(
          (category) => category.id_build === 2
        );
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedComponents", JSON.stringify(selectedComponents));
    localStorage.setItem("componentQuantities", JSON.stringify(quantities));

    let total = 0;
    const fetchAllStockQuantities = async () => {
      const newStockQuantities = {};
      for (const [categoryId, component] of Object.entries(selectedComponents)) {
        const stockQty = await fetchStockQuantity(component.id);
        newStockQuantities[categoryId] = stockQty !== null ? stockQty : component.quantity || 0;
        console.log(
          `${component.nameVariants}: Trong db = ${newStockQuantities[categoryId]}, Hiện tại = ${quantities[categoryId] || 1}`
        );
        if (component && component.price) {
          total += component.price * (quantities[categoryId] || 1);
        }
      }
      setStockQuantities(newStockQuantities);
      setTotalPrice(total);
    };

    fetchAllStockQuantities();
  }, [selectedComponents, quantities]);

  const openModal = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleComponentSelect = (component) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [selectedCategory]: component,
    }));
    setQuantities((prev) => ({
      ...prev,
      [selectedCategory]: 1,
    }));
    closeModal();
  };

  // Xử lý thay đổi số lượng với thông báo khi vượt quá
  const handleQuantityChange = (categoryId, change) => {
    setQuantities((prev) => {
      const currentQty = prev[categoryId] || 1;
      const newQty = currentQty + change;
      const stockQty = stockQuantities[categoryId];

      if (stockQty === undefined || stockQty === null) {
        console.warn(`Stock data for ${categoryId} is not loaded yet.`);
        return prev;
      }

      // Kiểm tra khi cộng vượt quá số lượng trong kho
      if (change > 0 && newQty > stockQty) {
        Swal.fire({
          icon: "warning",
          title: "Số lượng vượt quá giới hạn!",
          text: `Chỉ còn ${stockQty} sản phẩm trong kho.`,
          confirmButtonText: "Đóng",
        });
        return prev; // Không thay đổi số lượng nếu vượt quá
      }

      // Kiểm tra số lượng tối thiểu
      if (newQty < 1) {
        Swal.fire({
          icon: "warning",
          title: "Số lượng không hợp lệ!",
          text: "Số lượng tối thiểu là 1.",
          confirmButtonText: "Đóng",
        });
        return prev;
      }

      return {
        ...prev,
        [categoryId]: newQty, // Cập nhật số lượng nếu hợp lệ
      };
    });
  };

  const handleDeleteComponent = (categoryId) => {
    setSelectedComponents((prev) => {
      const newComponents = { ...prev };
      delete newComponents[categoryId];
      return newComponents;
    });
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[categoryId];
      return newQuantities;
    });
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleProceedToCheckout = async () => {
    if (Object.keys(selectedComponents).length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Chưa chọn sản phẩm",
        text: "Vui lòng chọn ít nhất một linh kiện để tiến hành thanh toán.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const quantityChecks = await Promise.all(
        Object.entries(selectedComponents).map(async ([categoryId, component]) => {
          const currentQty = quantities[categoryId] || 1;
          const latestQty = await checkVariantQuantity(component.id);
          return { categoryId, component, currentQty, latestQty };
        })
      );

      const invalidItems = quantityChecks.filter(
        (item) => item.currentQty > item.latestQty
      );

      if (invalidItems.length > 0) {
        const errorMessage = invalidItems
          .map(
            (item) =>
              `${item.component.nameVariants}: Yêu cầu (${item.currentQty}) vượt quá kho (${item.latestQty})`
          )
          .join("\n");

        Swal.fire({
          icon: "error",
          title: "Số lượng không hợp lệ",
          text: errorMessage,
          confirmButtonText: "OK",
        });

        setQuantities((prev) => {
          const updatedQuantities = { ...prev };
          invalidItems.forEach((item) => {
            updatedQuantities[item.categoryId] = item.latestQty;
          });
          return updatedQuantities;
        });
        return;
      }

      const buildCartItems = Object.entries(selectedComponents).map(
        ([categoryId, component]) => ({
          product_variant_id: component.id,
          productPrice: component.price,
          quantity: quantities[categoryId] || 1,
          nameVariants: component.nameVariants || "Không có tên",
          image: component.image,
        })
      );

      navigate("/orders", { state: { cartItems: buildCartItems } });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi khi kiểm tra số lượng",
        text: "Không thể kiểm tra số lượng sản phẩm. Vui lòng thử lại sau.",
        confirmButtonText: "OK",
      });
    }
  };

  const getComponentDetails = (component, categoryId) => {
    if (!component) return "Vui lòng chọn linh kiện";
    const qty = quantities[categoryId] || 1;
    const stockQty = stockQuantities[categoryId] !== undefined ? stockQuantities[categoryId] : component.quantity || 0;

    return (
      <Card className="rounded-none shadow-none border p-3 w-full md:w-3/4 lg:w-4/5">
        <CardBody className="flex flex-row items-center">
          <div className="w-20 h-20 mr-4 flex-shrink-0">
            <img
              src={component.image || "/api/placeholder/80/80"}
              alt={component.nameVariants}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">{component.nameVariants}</h3>
            <p className="text-xs text-gray-500">
              Tình trạng: {component.status || "Available"}
            </p>
            <p className="text-xs text-gray-500">
              Số Lượng Trong Kho: {stockQty}
            </p>
          </div>
          <div className="text-right min-w-32 flex items-center gap-2">
            <div>
              <div className="text-primary font-medium">
                {formatPrice(component.price * qty)} ₫
              </div>
              <div className="text-xs text-gray-500">
                Đơn giá: {formatPrice(component.price)} ₫
              </div>
            </div>
            <div className="flex items-center border rounded p-1">
              <Button
                isIconOnly
                color="primary"
                size="sm"
                onClick={() =>
                  qty === 1
                    ? handleDeleteComponent(categoryId)
                    : handleQuantityChange(categoryId, -1)
                }
                className="rounded-none p-1"
              >
                {qty === 1 ? <FaTrash size={14} /> : "-"}
              </Button>
              <span className="px-2 text-sm">{qty}</span>
              <Button
                isIconOnly
                color="primary"
                size="sm"
                onClick={() => handleQuantityChange(categoryId, 1)}
                className="rounded-none p-1"
                // Không cần disabled để thông báo luôn xuất hiện khi vượt quá
              >
                +
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">
        Build PC - Xây dựng cấu hình máy tính
      </h1>

      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <Button color="primary" variant="solid" className="font-medium rounded-none">
          Cấu hình 1
        </Button>
        <Button color="default" variant="flat" className="font-medium rounded-none">
          Cấu hình 2
        </Button>
        <Button color="default" variant="flat" className="font-medium rounded-none">
          Cấu hình 3
        </Button>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500">Tổng tiền tạm tính:</span>
            <span className="text-lg font-bold text-red-600">
              {formatPrice(totalPrice)} ₫
            </span>
          </div>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" className="font-medium rounded-none">
                Tải cấu hình
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Tùy chọn tải" className="rounded-none">
              <DropdownItem key="export">Xuất file</DropdownItem>
              <DropdownItem key="save">Lưu cấu hình</DropdownItem>
              <DropdownItem key="share">Chia sẻ</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <Card className="p-6 mb-4 shadow-md rounded-none">
        <div className="flex">
          <Button
            className="rounded-none"
            color="secondary"
            onClick={handleProceedToCheckout}
          >
            Thêm vào trang thanh toán
          </Button>
          <div className="pl-4">
            <Button className="rounded-none" color="success">
              Nhận tư vấn từ AI
            </Button>
          </div>
        </div>
        <div className="relative">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border-b border-gray-200 py-6 flex flex-wrap md:flex-nowrap items-center"
            >
              <div className="w-full md:w-1/4 font-medium text-gray-700 mb-2 md:mb-0">
                {category.name}
              </div>
              <div className="w-full md:w-3/4 text-gray-500 mb-2 md:mb-0">
                {getComponentDetails(selectedComponents[category.id], category.id)}
              </div>
              <div className="w-full md:w-1/6 flex justify-end">
                <Button
                  color="primary"
                  className="font-medium rounded-none"
                  onClick={() => openModal(category.id)}
                >
                  {selectedComponents[category.id] ? "Thay đổi" : "Chọn"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ComponentSelectionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedCategory={selectedCategory}
        categories={categories}
        onSelectComponent={handleComponentSelect}
        selectedid={selectedComponents[selectedCategory]?.id}
      />
    </div>
  );
};

export default PCBuilderComponent;