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
import { FaTrash } from "react-icons/fa"; // Import trash icon from react-icons
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Swal from "sweetalert2"; // Import Swal for alerts (like in CartPage)

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

  const navigate = useNavigate(); // Initialize useNavigate for navigation

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
    localStorage.setItem(
      "selectedComponents",
      JSON.stringify(selectedComponents)
    );
    localStorage.setItem("componentQuantities", JSON.stringify(quantities));

    let total = 0;
    Object.entries(selectedComponents).forEach(([categoryId, component]) => {
      if (component && component.price) {
        const qty = quantities[categoryId] || 1;
        total += component.price * qty;
      }
    });
    setTotalPrice(total);
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
      [selectedCategory]: prev[selectedCategory] || 1,
    }));
    closeModal();
  };

  const handleQuantityChange = (categoryId, change) => {
    setQuantities((prev) => {
      const currentQty = prev[categoryId] || 1;
      const newQty = Math.max(1, currentQty + change); // Ensure minimum quantity is 1
      return {
        ...prev,
        [categoryId]: newQty,
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

  const handleProceedToCheckout = () => {
    if (Object.keys(selectedComponents).length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Chưa chọn sản phẩm",
        text: "Vui lòng chọn ít nhất một linh kiện để tiến hành thanh toán.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Prepare cart items from selectedComponents and quantities
    const buildCartItems = Object.entries(selectedComponents).map(
      ([categoryId, component]) => {
        console.log("Component being processed:", component); // Debug log to check component structure
        return {
          product_variant_id: component.id, // Assuming component.id is the product_variant_id
          productPrice: component.price,
          quantity: quantities[categoryId] || 1,
          nameVariants: component.nameVariants || "Không có tên", // Fallback if nameVariants is missing
          image: component.image, // Include image for reference
        };
      }
    );

    console.log("Build Cart Items:", buildCartItems); // Debug log to check final cart items

    // Navigate to the checkout page with the build configuration
    navigate("/orders", { state: { cartItems: buildCartItems } });
  };

  const getComponentDetails = (component, categoryId) => {
    if (!component) return "Vui lòng chọn linh kiện";
    const qty = quantities[categoryId] || 1;

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
              Số Lượng: {component.quantity || "Không có thông tin"}
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
        <Button
          color="primary"
          variant="solid"
          className="font-medium rounded-none"
        >
          Cấu hình 1
        </Button>
        <Button
          color="default"
          variant="flat"
          className="font-medium rounded-none"
        >
          Cấu hình 2
        </Button>
        <Button
          color="default"
          variant="flat"
          className="font-medium rounded-none"
        >
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
                {getComponentDetails(
                  selectedComponents[category.id],
                  category.id
                )}
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
