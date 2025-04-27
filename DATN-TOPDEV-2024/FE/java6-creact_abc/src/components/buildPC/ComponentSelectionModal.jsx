import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Image,
  Pagination,
  Spinner,
} from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";
import ProductVariantService from "../../services/ProductVariantService";
import AIRecommendationService from "../../services/AIRecommendationService";

const ComponentSelectionModal = ({
  isOpen,
  onClose,
  selectedCategory,
  categories,
  onSelectComponent,
  selectedComponents,
  isAdmin, // Nhận prop isAdmin để xác định quyền truy cập
}) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("priceAsc");
  const selectedCategoryObj = categories?.find(
    (c) => c.id === selectedCategory
  );

  // State cho AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  // Số sản phẩm mỗi trang
  const itemsPerPage = 3;

  useEffect(() => {
    if (selectedCategory && isOpen) {
      fetchProductVariants(selectedCategory);
      // Reset AI recommendations khi mở modal mới
      setAiRecommendations(null);
      setShowAIRecommendations(false);
    }
  }, [selectedCategory, isOpen]);

  const fetchProductVariants = async (categoryId) => {
    try {
      const data = await ProductVariantService.getVariantsByCategory(
        categoryId
      );
      // Filter out products with status "Unavailable"
      const filteredProducts = data.filter(
        (product) => product.status !== "Unavailable"
      );
      setProducts(filteredProducts);
      // Reset về trang 1 khi load sản phẩm mới
      setCurrentPage(1);
    } catch (error) {
      setProducts([]);
    }
  };

  const handleCPUSelect = (id) => {
    const selectedProduct = products.find((product) => product.id === id);
    if (selectedProduct) {
      console.log("Selected product:", selectedProduct);
      onSelectComponent(selectedProduct);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Lọc sản phẩm theo từ khóa tìm kiếm
  const filteredProducts = products.filter((product) =>
    product.nameVariants?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sắp xếp sản phẩm theo giá
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA =
      a.discountPrice && a.discountPrice > 0 ? a.discountPrice : a.price;
    const priceB =
      b.discountPrice && b.discountPrice > 0 ? b.discountPrice : b.price;

    if (sortOption === "priceAsc") {
      return priceA - priceB;
    } else if (sortOption === "priceDesc") {
      return priceB - priceA;
    }
    return 0;
  });

  // Tính toán số trang
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Lấy sản phẩm cho trang hiện tại
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Hàm xử lý tư vấn AI
  const handleAIConsultation = async () => {
    setIsLoadingAI(true);
    setShowAIRecommendations(true);

    try {
      // Lấy cấu hình hiện tại từ localStorage
      const savedConfigurations = localStorage.getItem("pcConfigurations");
      let currentBuild = {};

      if (savedConfigurations) {
        const configurations = JSON.parse(savedConfigurations);
        // Tìm cấu hình đang active
        const currentConfigIndex =
          localStorage.getItem("currentConfigIndex") || 0;
        currentBuild = configurations[currentConfigIndex]?.components || {};
      }

      // Kiểm tra nếu cấu hình hiện tại trống rỗng
      if (Object.keys(currentBuild).length === 0) {
        setAiRecommendations({
          status: "error",
          recommendations: [],
          errorMessage:
            "Bạn chưa chọn bất kỳ linh kiện nào cho cấu hình PC. Vui lòng chọn ít nhất một linh kiện trước khi dùng tư vấn AI.",
        });
        setIsLoadingAI(false);
        return;
      }

      // Kiểm tra nếu không có sản phẩm nào trong modal
      if (products.length === 0) {
        setAiRecommendations({
          status: "error",
          recommendations: [],
          errorMessage: `Không có sản phẩm ${
            selectedCategoryObj?.name || ""
          } nào trong danh mục này để gợi ý.`,
        });
        setIsLoadingAI(false);
        return;
      }

      // Chuẩn bị dữ liệu để gửi đến AI
      const targetCategoryName = selectedCategoryObj?.name || "Unknown";

      console.log("Current build from localStorage:", currentBuild);
      console.log("Available products in modal:", products.length);

      // Tạo metadata chứa thông tin category để gửi cho AI
      const metadata = {
        targetCategory: {
          id: selectedCategory,
          name: targetCategoryName,
        },
      };

      // Chọn linh kiện đã có trong cấu hình để làm tham chiếu
      const referenceComponent = Object.values(currentBuild)[0];

      // Gọi API AI với sản phẩm tham chiếu, cấu hình hiện tại, metadata và danh sách sản phẩm trong modal
      const response = await AIRecommendationService.getCompatibleComponents(
        referenceComponent,
        currentBuild,
        metadata,
        products // Truyền toàn bộ danh sách sản phẩm trong modal
      );

      setAiRecommendations(response);
    } catch (error) {
      console.error("Lỗi khi lấy gợi ý từ AI:", error);
      setAiRecommendations({
        status: "error",
        recommendations: [],
        errorMessage:
          "Đã xảy ra lỗi khi lấy gợi ý từ AI. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Thêm hàm xử lý khi bấm vào sản phẩm gợi ý
  const handleRecommendationClick = (nameVariants) => {
    console.log("Selected recommended product:", nameVariants);
    setSearchTerm(nameVariants);
    setCurrentPage(1);
  };

  // Hàm reset searchTerm khi đóng modal
  const handleCloseModal = () => {
    setSearchTerm(""); // Xóa text đã nhập vào ô tìm kiếm
    onClose(); // Gọi hàm đóng modal được truyền từ props
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal} // Thay thế onClose bằng handleCloseModal
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "rounded-none",
        header: "border-b",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center pr-12">
          <div>Bộ lọc</div>
          {!isAdmin && (
            <Button
              color="secondary"
              size="sm"
              className="rounded-none"
              onClick={handleAIConsultation}
              isLoading={isLoadingAI}
              endContent={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4V20M20 12H4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              Tư vấn AI
            </Button>
          )}
        </ModalHeader>

        {/* Hiển thị AI Recommendations Panel ở ngoài vùng scroll */}
        {showAIRecommendations && (
          <div className="px-6 border-b">
            <Card className="w-full my-3 rounded-none shadow-none border-none">
              <CardBody className="p-4">
                {isLoadingAI ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Spinner color="primary" size="lg" />
                    <p className="mt-4 text-gray-600">
                      Đang phân tích các lựa chọn phù hợp...
                    </p>
                  </div>
                ) : aiRecommendations ? (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">Gợi ý từ AI</h3>
                      <Button
                        size="sm"
                        isIconOnly
                        variant="light"
                        onClick={() => setShowAIRecommendations(false)}
                      >
                        ×
                      </Button>
                    </div>

                    {aiRecommendations.status === "error" ? (
                      <div className="text-danger">
                        {aiRecommendations.errorMessage ||
                          "Đã xảy ra lỗi khi lấy gợi ý."}
                      </div>
                    ) : aiRecommendations.recommendations &&
                      aiRecommendations.recommendations.length > 0 ? (
                      <div>
                        <p className="mb-3 text-sm text-gray-700">
                          Dựa trên cấu hình hiện tại của bạn, đây là những{" "}
                          {selectedCategoryObj?.name || "linh kiện"} phù hợp
                          nhất:
                        </p>
                        <p className="mb-3 text-sm text-gray-700">
                          Lưu ý: Đây chỉ là gợi ý của AI dựa trên các sản phẩm
                          có sẵn. Để có tư vấn chính xác và phù hợp nhất với nhu
                          cầu của bạn, vui lòng liên hệ với chúng tôi trực tiếp
                          tại (+84) 0313-728-397.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {aiRecommendations.recommendations.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="cursor-pointer"
                                onClick={() => {
                                  console.log(
                                    "Card wrapper clicked, nameVariants:",
                                    item.nameVariants
                                  );
                                  handleRecommendationClick(item.nameVariants);
                                }}
                              >
                                <Card className="rounded-none">
                                  <CardBody className="p-3">
                                    <div className="flex flex-col items-center">
                                      <div className="w-16 h-16 mb-2">
                                        <img
                                          src={
                                            item.imageUrl ||
                                            "/api/placeholder/80/80"
                                          }
                                          alt={item.nameVariants || "Product"}
                                          className="object-contain w-full h-full"
                                        />
                                      </div>
                                      <p className="text-sm font-medium text-center">
                                        {item.nameVariants || "Unknown Product"}
                                      </p>
                                      <p className="text-primary text-sm">
                                        {new Intl.NumberFormat("vi-VN").format(
                                          item.price || 0
                                        )}{" "}
                                        VND
                                      </p>
                                    </div>
                                  </CardBody>
                                </Card>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <p>Không tìm được gợi ý phù hợp. Vui lòng thử lại sau.</p>
                    )}
                  </>
                ) : (
                  <p>Không thể tải gợi ý. Vui lòng thử lại.</p>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        <ModalBody>
          {/* Sort buttons and search */}
          <div className="mb-4 flex items-center flex-wrap gap-2">
            <span className="text-sm">Sắp xếp theo</span>
            <Button
              size="sm"
              className="rounded-none"
              color={sortOption === "priceAsc" ? "primary" : "default"}
              variant={sortOption === "priceAsc" ? "solid" : "bordered"}
              onClick={() => setSortOption("priceAsc")}
            >
              Giá tăng dần
            </Button>
            <Button
              size="sm"
              className="rounded-none"
              color={sortOption === "priceDesc" ? "primary" : "default"}
              variant={sortOption === "priceDesc" ? "solid" : "bordered"}
              onClick={() => setSortOption("priceDesc")}
            >
              Giá giảm dần
            </Button>
            <div className="ml-auto">
              <Input
                size="sm"
                placeholder="Tìm linh kiện"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                startContent={<FaSearch size={18} />}
                className="rounded-none w-full min-w-64"
              />
            </div>
          </div>

          {/* Product List */}
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p>
                  Hiện tại chưa có sản phẩm nào trong danh mục "
                  {selectedCategoryObj?.name}".
                </p>
                <p>Vui lòng thử lại sau hoặc chọn danh mục khác.</p>
              </div>
            ) : currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <Card
                  key={product.id}
                  className="rounded-none shadow-none border"
                >
                  <CardBody className="p-3 flex flex-row items-center">
                    <div className="w-20 h-20 mr-4 flex-shrink-0">
                      <Image
                        src={product.image || "/api/placeholder/80/80"}
                        alt={product.nameVariants}
                        className="object-contain"
                        width={80}
                        height={80}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">
                        {product.nameVariants}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Loại: {product.categoryName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Số Lượng: {product.quantity || "Không có thông tin"}
                      </p>
                    </div>
                    <div className="text-right min-w-32">
                      {product.discountPrice && product.discountPrice > 0 ? (
                        <>
                          <div className="text-primary font-medium">
                            {formatPrice(product.discountPrice)}
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-primary font-medium">
                          {formatPrice(product.price)}
                        </div>
                      )}
                    </div>
                    <Button
                      color="primary"
                      className="ml-4 rounded-none"
                      size="sm"
                      onClick={() => handleCPUSelect(product.id)}
                    >
                      Chọn
                    </Button>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p>
                  Không tìm thấy sản phẩm phù hợp với từ khóa "{searchTerm}".
                </p>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          {/* Pagination */}
          <div className="flex justify-center w-full mt-4">
            {totalPages > 1 && (
              <Pagination
                total={totalPages}
                initialPage={1}
                page={currentPage}
                onChange={handlePageChange}
                showControls
                classNames={{
                  item: "rounded-none",
                }}
              />
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ComponentSelectionModal;
