import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Card,
  CardBody,
  Image,
  Pagination,
  Chip,
} from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";
import ProductVariantService from "../../services/ProductVariantService"; 

const ComponentSelectionModal = ({
  isOpen,
  onClose,
  selectedCategory,
  categories,
  onSelectComponent,
}) => {
  const [products, setProducts] = useState([]);
  const [selectedCPU, setSelectedCPU] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("bestseller");
  const selectedCategoryObj = categories?.find(
    (c) => c.id === selectedCategory
  );

  useEffect(() => {
    if (selectedCategory && isOpen) {
      fetchProductVariants(selectedCategory);
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
    } catch (error) {
      setProducts([]);
    }
  };

  const handleCPUSelect = (id) => {
    const selectedProduct = products.find((product) => product.id === id);
    if (selectedProduct) {
      console.log("Selected CPU:", selectedProduct);
      onSelectComponent(selectedProduct); // Truyền toàn bộ sản phẩm
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const filteredProducts = products.filter((product) =>
    product.nameVariants?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter selectors data
  const filterOptions = {
    brands: ["Tất cả", "Intel", "AMD", "NVIDIA"],
    cpuBrands: ["Tất cả", "Intel", "AMD"],
    needs: ["Tất cả", "Gaming", "Văn phòng", "Đồ họa"],
    cpuSeries: [
      "Tất cả",
      "Core i3",
      "Core i5",
      "Core i7",
      "Core i9",
      "Ryzen 3",
      "Ryzen 5",
      "Ryzen 7",
      "Ryzen 9",
    ],
    generations: ["Tất cả", "Gen 10", "Gen 11", "Gen 12", "Gen 13", "Gen 14"],
    cores: ["Tất cả", "2", "4", "6", "8", "10", "12", "16"],
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "rounded-none",
        header: "border-b",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <div>Bộ lọc</div>
        </ModalHeader>
        <ModalBody>
          {/* Filter dropdowns */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Select
              label="Thương hiệu"
              variant="bordered"
              className="rounded-none"
              size="sm"
            >
              {filterOptions.brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Thương hiệu CPU"
              variant="bordered"
              className="rounded-none"
              size="sm"
            >
              {filterOptions.cpuBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Nhu cầu"
              variant="bordered"
              className="rounded-none"
              size="sm"
            >
              {filterOptions.needs.map((need) => (
                <SelectItem key={need} value={need}>
                  {need}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Series CPU"
              variant="bordered"
              className="rounded-none"
              size="sm"
            >
              {filterOptions.cpuSeries.map((series) => (
                <SelectItem key={series} value={series}>
                  {series}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Thế hệ"
              variant="bordered"
              className="rounded-none"
              size="sm"
            >
              {filterOptions.generations.map((gen) => (
                <SelectItem key={gen} value={gen}>
                  {gen}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Số nhân thực"
              variant="bordered"
              className="rounded-none"
              size="sm"
            >
              {filterOptions.cores.map((core) => (
                <SelectItem key={core} value={core}>
                  {core}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Sort buttons and search */}
          <div className="mb-4 flex items-center flex-wrap gap-2">
            <span className="text-sm">Sắp xếp theo</span>
            <Button
              size="sm"
              className="rounded-none"
              color={sortOption === "bestseller" ? "primary" : "default"}
              variant={sortOption === "bestseller" ? "solid" : "bordered"}
              onClick={() => setSortOption("bestseller")}
            >
              Bán chạy
            </Button>
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
                onValueChange={handleSearch}
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
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
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
                      <div className="text-primary font-medium">
                        {formatPrice(product.price)}
                      </div>
                      {product.originalPrice &&
                        product.originalPrice !== product.price && (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
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
          <div className="flex justify-center mt-4">
            <Pagination
              total={1}
              initialPage={1}
              showControls
              classNames={{
                item: "rounded-none",
              }}
            />
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ComponentSelectionModal;
