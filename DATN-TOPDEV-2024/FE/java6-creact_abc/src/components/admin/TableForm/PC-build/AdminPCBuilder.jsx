import React, { useState, useEffect } from "react";
import { Card, CardBody, Button, Spinner } from "@nextui-org/react";
import { FaTrash } from "react-icons/fa";
// Thay thế react-toastify bằng sonner
import { toast } from "sonner";
import ComponentSelectionModal from "../../../buildPC/ComponentSelectionModal";
import CategoryService from "../../../../services/CategoryService";

const AdminPCBuilder = ({
  initialComponents = {},
  onSave,
  buildPCData = null,
}) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState({});
  const [quantities, setQuantities] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await CategoryService.getAllCategories();
        const data = response.data || response;
        // Filter categories for PC building (id_build === 2)
        // Exclude Monitor, Keyboard, Mouse categories
        const excludedCategories = [
          "Monitor",
          "Keyboard",
          "Mouse",
          "Bàn phím",
          "Chuột",
          "Màn hình",
        ];

        const filteredCategories = data.filter(
          (category) =>
            category.id_build === 2 &&
            !excludedCategories.some((excluded) =>
              category.name.toLowerCase().includes(excluded.toLowerCase())
            )
        );
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Không thể tải danh mục linh kiện", {
          description: "Vui lòng thử lại sau.",
          duration: 3000
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Thêm vào trong useEffect để kiểm tra dữ liệu được truyền vào
  useEffect(() => {
    console.log("initialComponents received:", initialComponents);
    if (initialComponents && Object.keys(initialComponents).length > 0) {
      setSelectedComponents(initialComponents);
  
      // Extract quantities from initialComponents, sử dụng variantQuantity
      const initialQuantities = {};
      Object.entries(initialComponents).forEach(([categoryId, component]) => {
        // Sử dụng variantQuantity thay vì quantity
        initialQuantities[categoryId] = component.variantQuantity || 1;
      });
      setQuantities(initialQuantities);
    }
  }, [initialComponents]);

  // Calculate total price
  useEffect(() => {
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

    // Initialize quantity to 1 for new component
    setQuantities((prev) => ({
      ...prev,
      [selectedCategory]: 1,
    }));

    closeModal();
  };

  const handleDeleteComponent = (categoryId) => {
    setSelectedComponents((prev) => {
      const newComponents = { ...prev };
      delete newComponents[categoryId];
      return newComponents;
    });

    // Also delete quantity when component is removed
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[categoryId];
      return newQuantities;
    });
  };

  const handleQuantityChange = (categoryId, change) => {
    const currentQty = quantities[categoryId] || 1;
    const newQty = currentQty + change;
    const stockQty = selectedComponents[categoryId]?.quantity || 0;
  
    console.log(`Checking quantity: currentQty=${currentQty}, newQty=${newQty}, stockQty=${stockQty}`);
  
    if (newQty < 1) {
      console.log("Warning: Số lượng không hợp lệ");
      toast.warning("Số lượng không hợp lệ", {
        description: "Số lượng tối thiểu là 1.",
        duration: 2000
      });
      return;
    }
  
    if (newQty > stockQty) {
      console.log(`Warning: Vượt quá giới hạn kho (${stockQty})`);
      toast.warning("Số lượng vượt quá giới hạn", {
        description: `Chỉ còn ${stockQty} sản phẩm trong kho.`,
        duration: 2000
      });
      return;
    }
  
    console.log(`Updating quantity to ${newQty}`);
    setQuantities((prev) => ({
      ...prev,
      [categoryId]: newQty,
    }));
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
  };

  // Truyền dữ liệu linh kiện được chọn lên component cha
  const handleSave = () => {
    // Kiểm tra xem đã chọn linh kiện nào chưa
    if (Object.keys(selectedComponents).length === 0) {
      toast.error("Vui lòng chọn ít nhất một linh kiện cho cấu hình PC", {
        duration: 3000
      });
      return;
    }

    setIsSaving(true);

    // Chuẩn bị dữ liệu để trả về cho component cha - tập trung vào ID của variant
    const buildPCProductVariants = Object.entries(selectedComponents).map(
      ([categoryId, component]) => ({
        productVariantId: component.id,
        variantQuantity: quantities[categoryId] || 1,
      })
    );

    try {
      // Gọi callback onSave và truyền dữ liệu cần thiết
      if (onSave && typeof onSave === "function") {
        onSave({
          buildPCProductVariants: buildPCProductVariants,
          totalPrice: totalPrice,
          selectedComponentsRaw: selectedComponents,
          quantities: quantities,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu cấu hình PC:", error);
      toast.error("Lỗi khi lưu cấu hình PC", {
        description: error.message,
        duration: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getComponentDetails = (component, categoryId) => {
    if (!component) return "Vui lòng chọn linh kiện";
  
    // Lấy số lượng linh kiện (số lượng đã chọn cho bộ PC)
    const selectedQty = quantities[categoryId] || 1;
    
    // Lấy số lượng trong kho
    const stockQty = component.quantity || 0;

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
            <h3 className="text-sm font-medium">
              {component.nameVariants || "Linh kiện không xác định"}
            </h3>
            <p className="text-xs text-gray-500">
              Tình trạng: {component.status || "Còn hàng"}
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Số lượng trong kho:</span> {stockQty}
            </p>
          </div>
          <div className="text-right min-w-36 flex flex-col items-end">
            <div className="mb-2">
              <div className="text-primary font-medium">
                {formatPrice(component.price * selectedQty || 0)}
              </div>
              <div className="text-xs text-gray-500">
                Đơn giá: {formatPrice(component.price || 0)}
              </div>
              {component.originalPrice &&
                component.originalPrice > component.price && (
                  <div className="text-xs text-gray-500 line-through">
                    {formatPrice(component.originalPrice)}
                  </div>
                )}
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 mb-1 font-medium">Số linh kiện:</span>
              <div className="flex items-center border rounded p-1">
                <Button
                  isIconOnly
                  color="primary"
                  size="sm"
                  onClick={() =>
                    selectedQty === 1
                      ? handleDeleteComponent(categoryId)
                      : handleQuantityChange(categoryId, -1)
                  }
                  className="rounded-none p-1"
                >
                  {selectedQty === 1 ? <FaTrash size={14} /> : "-"}
                </Button>
                <span className="px-2 text-sm">{selectedQty}</span>
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
          </div>
        </CardBody>
      </Card>
    );
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
              onClick={handleSave}
              isLoading={isSaving}
            >
              Lưu danh sách linh kiện
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
                  ? getComponentDetails(
                      selectedComponents[category.id],
                      category.id
                    )
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

      {/* Modal chọn component */}
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
