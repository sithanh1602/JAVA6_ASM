import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Select, SelectItem
} from "@nextui-org/react";
import ComponentSelectionModal from "./ComponentSelectionModal";
import CategoryService from "../../services/CategoryService";
import { FaTrash, FaFilePdf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../assets/images/cpu2.png";

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

  const navigate = useNavigate();
  const buildConfigRef = useRef(null);

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
      const newQty = Math.max(1, currentQty + change);
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

    const buildCartItems = Object.entries(selectedComponents).map(
        ([categoryId, component]) => {
          console.log("Component being processed:", component);
          return {
            product_variant_id: component.id,
            productPrice: component.price,
            quantity: quantities[categoryId] || 1,
            nameVariants: component.nameVariants || "Không có tên",
            image: component.image,
          };
        }
    );

    console.log("Build Cart Items:", buildCartItems);
    navigate("/orders", { state: { cartItems: buildCartItems } });
  };

  const handleSelectionChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "export") {
      handlePDFExport(); // Assuming handlePDFExport is defined elsewhere
    } else if (selectedValue === "share") {
      // Add your share logic here
      console.log("Share option selected");
    }
  };

  // New function to handle PDF export
  const handlePDFExport = () => {
    // Create a temporary style element for print-specific styles
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-container, #print-container * {
          visibility: visible;
        }
        #print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
        @page {
          size: A4;
          margin: 1cm;
        }
        .product-img {
          max-width: 80px;
          max-height: 80px;
        }
      }
    `;
    document.head.appendChild(style);

    // Create a temporary print-specific container
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';

    // Generate date string for the header
    const today = new Date();
    const dateString = today.toLocaleDateString('vi-VN');

    let printHTML = `
  <div class="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
    <div class="flex flex-col items-center mb-6">
      <span class="text-3xl font-bold text-blue-700 tracking-tight">TECHSMART.VN</span>
      <span class="text-gray-500 text-sm uppercase tracking-wider">Tech Electronics</span>
      <img src="${logo}" alt="" class="w-16 h-16 object-contain" />
    </div>

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-extrabold text-gray-800">Chi tiết cấu hình PC</h1>
      <p class="text-gray-600">Ngày tạo: ${dateString}</p>
    </div>

    <table class="w-full border-collapse shadow-lg rounded-lg overflow-hidden">
      <thead>
        <tr class="bg-blue-600 text-white">
          <th class="p-3 text-left text-black text-xl">Loại linh kiện</th>
          <th class="p-3 text-left text-black text-xl">Hình ảnh</th>
          <th class="p-3 text-left text-black text-xl">Tên sản phẩm</th>
          <th class="p-3 text-left text-black text-xl">Số lượng</th>
          <th class="p-3 text-left text-black text-xl">Đơn giá</th>
          <th class="p-3 text-left text-black text-xl">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
`;

// Add each selected component to the table
    categories.forEach(category => {
      const component = selectedComponents[category.id];
      if (!component) return;

      const qty = quantities[category.id] || 1;
      const imgSrc = component.image || "/api/placeholder/80/80";

      printHTML += `
    <tr class="hover:bg-gray-100 transition-colors duration-200">
      <td class="border border-gray-200 p-3 text-gray-700">${category.name}</td>
      <td class="border border-gray-200 p-3 text-center">
        <img src="${imgSrc}" alt="${component.nameVariants || 'Sản phẩm'}" 
          class="max-w-[80px] max-h-[80px] object-contain mx-auto rounded-md shadow-sm">
      </td>
      <td class="border border-gray-200 p-3 text-gray-800">${component.nameVariants || 'Không có tên'}</td>
      <td class="border border-gray-200 p-3 text-center text-gray-700">${qty}</td>
      <td class="border border-gray-200 p-3 text-right text-blue-600">${formatPrice(component.price)} ₫</td>
      <td class="border border-gray-200 p-3 text-right text-blue-600">${formatPrice(component.price * qty)} ₫</td>
    </tr>
  `;
    });

// Add the footer with total price
    printHTML += `
      </tbody>
      <tfoot>
        <tr class="bg-gray-50">
          <td colspan="5" class="border border-gray-200 p-3 text-right font-bold text-gray-800">Tổng tiền:</td>
          <td class="border border-gray-200 p-3 text-right font-bold text-red-600">${formatPrice(totalPrice)} ₫</td>
        </tr>
      </tfoot>
    </table>

    <div class="mt-10 text-center text-gray-500 text-xs">
      <p>Báo giá này có hiệu lực trong vòng 7 ngày kể từ ngày tạo</p>
      <p>Liên hệ: <span class="text-blue-500">support@yourcompany.com</span> | Hotline: <span class="text-blue-500">1900 xxxx xxx</span></p>
    </div>
  </div>
`;

    printContainer.innerHTML = printHTML;
    document.body.appendChild(printContainer);

    // Force images to load before printing by creating a promise
    const loadImages = Array.from(printContainer.querySelectorAll('img'))
        .map(img => {
          if (img.complete) {
            return Promise.resolve();
          } else {
            return new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve; // Continue even if an image fails to load
            });
          }
        });

    // Wait for all images to load before printing
    Promise.all(loadImages)
        .then(() => {
          window.print();
          // Clean up after printing
          document.body.removeChild(printContainer);
          document.head.removeChild(style);
        });
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
          Xây dựng cấu hình máy tính
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
            <Select
                aria-label="Tùy chọn tải"
                placeholder="Tải cấu hình"
                onChange={handleSelectionChange}
                className="w-[150px]" /* Kích thước hợp lý */
                variant="bordered"
                radius="sm"
                classNames={{
                  trigger: "font-medium flex items-center justify-between h-6 px-2 rounded-md border-gray-300 shadow-sm hover:border-gray-400 transition-colors",
                  value: "text-gray-800",
                  popoverContent: "rounded-md border border-gray-300 shadow-lg min-w-[100px]",
                }}
                endContent={
                  <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                  </svg>
                }
            >
              <SelectItem
                  key="export"
                  value="export"
                  startContent={<FaFilePdf className="w-5 h-5 text-red-500"/>}
                  className="flex items-center gap-3 hover:bg-gray-100 rounded-md p-1"
              >
                PDF
              </SelectItem>
              <SelectItem
                  key="share"
                  value="share"
                  className="flex items-center gap-3 hover:bg-gray-100 rounded-md p-2"
              >
                Chia sẻ
              </SelectItem>
            </Select>
          </div>
        </div>

        <Card className="p-6 mb-4 shadow-md rounded-none" ref={buildConfigRef}>
          <div className="flex justify-between items-center no-print w-full">
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

            <div className="flex flex-col items-end ml-auto">
              <span className="text-sm text-gray-500">Tổng tiền tạm tính:</span>
              <span className="text-lg font-bold text-red-600">
                {formatPrice(totalPrice)} ₫
              </span>
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
                  <div className="w-full md:w-1/6 flex justify-end no-print">
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