import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import ComponentSelectionModal from "./ComponentSelectionModal";
import CategoryService from "../../services/CategoryService";
import ProductService from "../../services/ProductService";
import { FaTrash } from "react-icons/fa";
import logo from '../../assets/images/cpu2.png';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AIRecommendationService from "../../services/AIRecommendationService";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const PCBuilderComponent = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Kiểm tra nếu người dùng là admin
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const token = Cookies.get('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          console.log("Decoded token:", decodedToken);
          
          // Kiểm tra cấu trúc roles trong token
          const userRoles = decodedToken.roles || [];
          
          // Kiểm tra nếu người dùng có vai trò ADMIN
          if (Array.isArray(userRoles) && userRoles.includes("ADMIN")) {
            setIsAdmin(true);
          } else if (userRoles === "ADMIN") {
            // Trường hợp roles là string
            setIsAdmin(true);
          } else if (decodedToken.sub === "admin") {
            // Kiểm tra thêm trường sub nếu có
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };
    
    checkUserRole();
  }, []);

  // State cho nhiều cấu hình
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [configurations, setConfigurations] = useState(() => {
    const savedConfigurations = localStorage.getItem("pcConfigurations");
    if (savedConfigurations) {
      return JSON.parse(savedConfigurations);
    }
    // Mặc định tạo 3 cấu hình trống
    return [
      { components: {}, quantities: {}, name: "Cấu hình 1" },
      { components: {}, quantities: {}, name: "Cấu hình 2" },
      { components: {}, quantities: {}, name: "Cấu hình 3" }
    ];
  });

  // Lấy cấu hình hiện tại
  const currentConfig = configurations[currentConfigIndex];
  const [selectedComponents, setSelectedComponents] = useState(currentConfig.components || {});
  const [quantities, setQuantities] = useState(currentConfig.quantities || {});

  const [totalPrice, setTotalPrice] = useState(0);
  const [stockQuantities, setStockQuantities] = useState({});
  const printRef = useRef(null);

  const navigate = useNavigate();

  // Cập nhật localStorage khi configurations thay đổi
  useEffect(() => {
    localStorage.setItem("pcConfigurations", JSON.stringify(configurations));
    localStorage.setItem("currentConfigIndex", currentConfigIndex.toString());
  }, [configurations, currentConfigIndex]);

  // Cập nhật cấu hình khi người dùng chuyển đổi giữa các cấu hình
  useEffect(() => {
    // Lưu cấu hình hiện tại trước khi chuyển
    if (currentConfigIndex >= 0 && currentConfigIndex < configurations.length) {
      setSelectedComponents(configurations[currentConfigIndex].components || {});
      setQuantities(configurations[currentConfigIndex].quantities || {});
    }
  }, [currentConfigIndex, configurations]);

  // Hàm xử lý khi chuyển đổi giữa các cấu hình
  const switchConfiguration = (index) => {
    // Lưu cấu hình hiện tại trước khi chuyển đổi
    saveCurrentConfiguration();

    // Chuyển đến cấu hình mới
    setCurrentConfigIndex(index);
  };

  // Hàm lưu cấu hình hiện tại
  const saveCurrentConfiguration = () => {
    const updatedConfigurations = [...configurations];
    updatedConfigurations[currentConfigIndex] = {
      ...updatedConfigurations[currentConfigIndex],
      components: selectedComponents,
      quantities: quantities
    };
    setConfigurations(updatedConfigurations);
  };

  // Hàm xóa cấu hình hiện tại
  const clearCurrentConfiguration = () => {
    Swal.fire({
      title: "Xóa cấu hình?",
      text: `Bạn có chắc muốn xóa ${configurations[currentConfigIndex].name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedConfigurations = [...configurations];
        updatedConfigurations[currentConfigIndex] = {
          ...updatedConfigurations[currentConfigIndex],
          components: {},
          quantities: {}
        };
        setConfigurations(updatedConfigurations);
        setSelectedComponents({});
        setQuantities({});
        Swal.fire("Đã xóa!", "Cấu hình đã được xóa thành công.", "success");
      }
    });
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

  // Cập nhật tổng giá và số lượng trong kho
  useEffect(() => {
    // Lưu cấu hình hiện tại sau mỗi thay đổi
    saveCurrentConfiguration();

    let total = 0;
    const fetchAllStockQuantities = async () => {
      const newStockQuantities = {};
      for (const [categoryId, component] of Object.entries(selectedComponents)) {
        const stockQty = await ProductService.getVariantById(component.id);
        newStockQuantities[categoryId] = stockQty !== null ? stockQty.quantity : component.quantity || 0;
        console.log(
            `${component.nameVariants}: Trong db = ${newStockQuantities[categoryId]}, Hiện tại = ${quantities[categoryId] || 1}`
        );
        if (component) {
          // Sử dụng discountPrice nếu có, ngược lại dùng price
          const priceToUse = component.discountPrice && component.discountPrice > 0
            ? component.discountPrice
            : component.price;
          total += priceToUse * (quantities[categoryId] || 1);
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

  // Trong component PCBuilderComponent, thêm các state mới:
  const [aiRecommendations, setAiRecommendations] = useState({});
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Cập nhật hàm handleComponentSelect để gọi AI sau khi chọn linh kiện
  const handleComponentSelect = async (component) => {
    // Lưu component đã chọn như trước
    setSelectedComponents((prev) => ({
      ...prev,
      [selectedCategory]: component,
    }));
    setQuantities((prev) => ({
      ...prev,
      [selectedCategory]: 1,
    }));
    
    // Đóng modal trước
    closeModal();
    
    // Hiển thị trạng thái loading
    setIsLoadingRecommendations(true);
    
    try {
      // Tìm phần còn thiếu trong cấu hình
      const missingCategories = categories.filter(
        (cat) => !Object.keys(selectedComponents).includes(cat.id.toString())
      );
      
      // Nếu còn thiếu linh kiện, gọi AI để gợi ý
      if (missingCategories.length > 0) {
        // Gọi AI để lấy gợi ý
        const recommendations = await AIRecommendationService.getCompatibleComponents(
          component, 
          selectedComponents
        );
        
        // Lưu kết quả gợi ý
        setAiRecommendations(recommendations);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy gợi ý:", error);
      Swal.fire({
        icon: "error",
        title: "Không thể lấy gợi ý",
        text: "Đã xảy ra lỗi khi tìm linh kiện tương thích. Vui lòng thử lại sau.",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Xử lý thay đổi số lượng
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
    // Kiểm tra đã chọn sản phẩm chưa
    if (Object.keys(selectedComponents).length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Chưa chọn sản phẩm",
        text: "Vui lòng chọn ít nhất một linh kiện để tiến hành thanh toán.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Kiểm tra quyền USER trước khi chuyển đến trang thanh toán
    try {
      const token = Cookies.get('token');
      if (!token) {
        // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
        Swal.fire({
          icon: "info",
          title: "Yêu cầu đăng nhập",
          text: "Vui lòng đăng nhập để tiến hành thanh toán.",
          confirmButtonText: "Đăng nhập ngay",
          showCancelButton: true,
          cancelButtonText: "Hủy",
        }).then((result) => {
          if (result.isConfirmed) {
            // Lưu cấu hình hiện tại vào localStorage trước khi chuyển trang
            saveCurrentConfiguration();
            navigate("/loginn", { 
              state: { 
                returnUrl: "/pcbuilder",
                message: "Vui lòng đăng nhập để tiếp tục thanh toán" 
              } 
            });
          }
        });
        return;
      }

      // Giải mã token để kiểm tra quyền
      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);
      
      // Kiểm tra nếu người dùng có role USER
      const userRoles = decodedToken.roles || [];
      const isUser = Array.isArray(userRoles) && userRoles.includes("USER") || 
                    userRoles === "USER" || 
                    decodedToken.sub === "user";
                    
      if (!isUser) {
        Swal.fire({
          icon: "error",
          title: "Không có quyền truy cập",
          text: "Bạn cần tài khoản người dùng để thực hiện thanh toán.",
          confirmButtonText: "OK",
        });
        return;
      }

      // Tiếp tục kiểm tra số lượng sản phẩm
      const quantityChecks = await Promise.all(
        Object.entries(selectedComponents).map(async ([categoryId, component]) => {
          const currentQty = quantities[categoryId] || 1;
          const latestQty = await ProductService.checkVariantQuantity(component.id);
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

      // Chuẩn bị dữ liệu giỏ hàng
      const buildCartItems = Object.entries(selectedComponents).map(
        ([categoryId, component]) => ({
          product_variant_id: component.id,
          productPrice: component.discountPrice && component.discountPrice > 0 
            ? component.discountPrice 
            : component.price,
          quantity: quantities[categoryId] || 1,
          nameVariants: component.nameVariants || "Không có tên",
          image: component.image,
        })
      );

      // Lưu cấu hình hiện tại trước khi chuyển trang
      saveCurrentConfiguration();
      
      // Chuyển đến trang đặt hàng
      navigate("/orders", { state: { cartItems: buildCartItems } });
    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền hoặc số lượng sản phẩm:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi xử lý",
        text: "Đã xảy ra lỗi khi kiểm tra thông tin. Vui lòng thử lại sau.",
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
                {component.discountPrice && component.discountPrice > 0 ? (
                  <>
                    <div className="text-primary font-medium">
                      {formatPrice(component.discountPrice * qty)} ₫
                    </div>
                    <div className="text-xs text-gray-500">
                      Đơn giá: <span className="line-through">{formatPrice(component.price)} ₫</span> {formatPrice(component.discountPrice)} ₫
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-primary font-medium">
                      {formatPrice(component.price * qty)} ₫
                    </div>
                    <div className="text-xs text-gray-500">
                      Đơn giá: {formatPrice(component.price)} ₫
                    </div>
                  </>
                )}
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

  // Hàm xuất file PDF
  const handleExportPDF = () => {
    if (Object.keys(selectedComponents).length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Chưa chọn sản phẩm",
        text: "Vui lòng chọn ít nhất một linh kiện để xuất file.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Chuẩn bị trang in
    const printContent = document.createElement('div');
    printContent.className = 'print-content';

    // Tạo CSS cho bản in
    const printStyles = document.createElement('style');
    printStyles.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .total-row {
          font-weight: bold;
        }
        .header {
          margin-bottom: 20px;
          font-weight: bold;
        }
        .header .h5 {
          margin-bottom: 20px;
          font-weight: bold;
          font-size: 50px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-style: italic;
        }
        .product-image {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .component-cell {
          display: flex;
          align-items: center;
        }
        .component-info {
          margin-left: 10px;
        }
      }
    `;
    document.head.appendChild(printStyles);

    // Tạo nội dung cho bản in
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
       <h4 style="font-size: x-large; display: flex; align-items: center;"> 
            <img src="${logo}" alt="TechMart Logo" style="width: 30px; height: auto; margin-right: 8px;">
            TECHMART.VN
       </h4>

      <h1>Chi tiết cấu hình PC</h1>
      <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
    `;
    printContent.appendChild(header);

    // Tạo bảng linh kiện có kèm hình ảnh
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>STT</th>
          <th>Loại linh kiện</th>
          <th>Hình ảnh & Thông tin sản phẩm</th>
          <th>Số lượng</th>
          <th>Đơn giá</th>
          <th>Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(selectedComponents).map(([categoryId, component], index) => {
      const category = categories.find(cat => cat.id === parseInt(categoryId));
      const qty = quantities[categoryId] || 1;
      return `
            <tr>
              <td>${index + 1}</td>
              <td>${category ? category.name : 'Không xác định'}</td>
              <td>
                <div class="component-cell">
                  <img class="product-image" src="${component.image || "/api/placeholder/80/80"}" alt="${component.nameVariants}">
                  <div class="component-info">
                    <div>${component.nameVariants}</div>
                  </div>
                </div>
              </td>
              <td>${qty}</td>
              <td style="color: red;">${formatPrice(component.price)} VNĐ</td>
              <td style="color: purple;">${formatPrice(component.price * qty)} VNĐ</td>
            </tr>
          `;
    }).join('')}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="5" style="text-align: right;">Tổng tiền:</td>
          <td style="color: green">${formatPrice(totalPrice)} VND</td>
        </tr>
      </tfoot>
    `;
    printContent.appendChild(table);

    // Thêm footer
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
      <p>Cảm ơn bạn đã sử dụng dịch vụ xây dựng cấu hình PC của chúng tôi!</p>
    `;
    printContent.appendChild(footer);

    // Thêm vào document để in
    document.body.appendChild(printContent);

    // Chờ đợi để đảm bảo hình ảnh đã được tải
    setTimeout(() => {
      // Thực hiện in
      window.print();

      // Xóa nội dung in và styles sau khi đã in xong
      setTimeout(() => {
        document.body.removeChild(printContent);
        document.head.removeChild(printStyles);
      }, 1000);
    }, 300);
  };

  return (
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">
          Build PC - Xây dựng cấu hình máy tính
        </h1>

        <div className="flex flex-wrap gap-2 mb-6 items-center">
          {configurations.map((config, index) => (
              <Button
                  key={index}
                  color={currentConfigIndex === index ? "primary" : "default"}
                  variant={currentConfigIndex === index ? "solid" : "flat"}
                  className="font-medium rounded-none"
                  onClick={() => switchConfiguration(index)}
              >
                {config.name}
              </Button>
          ))}

          <div className="ml-auto flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Tổng tiền tạm tính:</span>
              <span className="text-lg font-bold text-red-600">
              {formatPrice(totalPrice)}VNĐ
            </span>
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="font-medium rounded-none">
                  Tùy chọn
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
                <DropdownItem key="clear" onClick={clearCurrentConfiguration}>Xóa cấu hình hiện tại</DropdownItem>
                <DropdownItem key="export" onClick={handleExportPDF}>Xuất file PDF</DropdownItem>
                <DropdownItem key="share">Chia sẻ</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <Card className="p-6 mb-4 shadow-md rounded-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">{configurations[currentConfigIndex].name}</h2>
            <div className="flex gap-2">
              <Button
                  className="rounded-none"
                  color="secondary"
                  onClick={handleProceedToCheckout}
              >
                Thêm vào trang thanh toán
              </Button>
            </div>
          </div>
          <div className="relative" ref={printRef}>
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
            selectedComponents={selectedComponents}
            isAdmin={isAdmin} // Truyền thông tin isAdmin sang modal
        />
      </div>
  );
};

export default PCBuilderComponent;