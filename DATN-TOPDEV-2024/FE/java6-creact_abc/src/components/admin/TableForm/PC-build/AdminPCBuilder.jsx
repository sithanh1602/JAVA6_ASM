import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Spinner
} from "@nextui-org/react";
import { FaTrash } from "react-icons/fa";
import ComponentSelectionModal from "../../../buildPC/ComponentSelectionModal";
import CategoryService from "../../../../services/CategoryService";

const AdminPCBuilder = ({ initialComponents = {}, onSave }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await CategoryService.getAllCategories();
        // Filter categories for PC building (id_build === 2)
        // Exclude Monitor, Keyboard, Mouse categories
        const excludedCategories = ['Monitor', 'Keyboard', 'Mouse', 'Bàn phím', 'Chuột', 'Màn hình'];
        
        const filteredCategories = data.filter(
          (category) => 
            category.id_build === 2 && 
            !excludedCategories.some(excluded => 
              category.name.toLowerCase().includes(excluded.toLowerCase())
            )
        );
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Process initialComponents if provided
  useEffect(() => {
    if (initialComponents && initialComponents.length > 0) {
      const componentsMap = {};
      
      initialComponents.forEach(component => {
        componentsMap[component.categoryId] = {
          id: component.variantId,
          nameVariants: component.name || "PC Component",
          price: component.price || 0,
          image: component.image || "https://placehold.co/80x80?text=PC+Part",
          status: "Còn hàng"
        };
      });
      
      setSelectedComponents(componentsMap);
    }
  }, [initialComponents]);

  // Calculate total price
  useEffect(() => {
    let total = 0;
    Object.values(selectedComponents).forEach(component => {
      if (component && component.price) {
        total += component.price;
      }
    });
    setTotalPrice(total);
  }, [selectedComponents]);

  const openModal = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleComponentSelect = (component) => {
    setSelectedComponents(prev => ({
      ...prev,
      [selectedCategory]: component
    }));
    closeModal();
  };

  const handleDeleteComponent = (categoryId) => {
    setSelectedComponents(prev => {
      const newComponents = { ...prev };
      delete newComponents[categoryId];
      return newComponents;
    });
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
  };

  const getComponentDetails = (component, categoryId) => {
    if (!component) return "Vui lòng chọn linh kiện";

    return (
      <Card className="rounded-none shadow-none border p-3 w-full">
        <CardBody className="flex flex-row items-center">
          <div className="w-20 h-20 mr-4 flex-shrink-0">
            <img
              src={component.image || "https://placehold.co/80x80?text=PC+Part"}
              alt={component.nameVariants || "Component Image"}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">{component.nameVariants || "Linh kiện không xác định"}</h3>
            <p className="text-xs text-gray-500">
              Tình trạng: {component.status || "Còn hàng"}
            </p>
          </div>
          <div className="text-right min-w-32 flex items-center gap-2">
            <div>
              <div className="text-primary font-medium">
                {formatPrice(component.price || 0)}
              </div>
            </div>
            <Button
              isIconOnly
              color="danger"
              size="sm"
              onClick={() => handleDeleteComponent(categoryId)}
              className="rounded-none p-1"
            >
              <FaTrash size={14} />
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  };

  const handleSaveBuild = () => {
    onSave(selectedComponents);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Spinner label="Đang tải danh mục sản phẩm..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="p-6 mb-4 shadow-md rounded-none">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Chọn linh kiện</h3>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Tổng tiền tạm tính:</span>
              <span className="text-lg font-bold text-red-600">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Button
              color="primary"
              className="rounded-none"
              onClick={handleSaveBuild}
            >
              Lưu cấu hình PC
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
                {selectedComponents[category.id] 
                  ? getComponentDetails(selectedComponents[category.id], category.id)
                  : "Vui lòng chọn linh kiện"}
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

export default AdminPCBuilder;