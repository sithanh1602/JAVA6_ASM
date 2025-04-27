import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import ProductInput from "./ProductInput"; // Ensure this path points to your ProductInput component
import ProductVariantsInput from "./ProductsVariantsInput";
import AttributesInput from "../Attributes/AttributesInput";
import AttributesTable from "../Attributes/AttributesTable";
import ProductService from "../../../../services/ProductService";
import ProductVariantService from "../../../../services/ProductVariantService";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaAsterisk } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import * as XLSX from "xlsx";
import axios from "axios";

const ProductTable = forwardRef((_, ref) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenVariants, setIsModalOpenVariants] = useState(false);
  const [isModalOpenAttributes, setIsModalOpenAttributes] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null); // Added this
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [variantCounts, setVariantCounts] = useState({});

  // Trigger filtering whenever the filters change
  useEffect(() => {
    filterProducts();
  }, [statusFilter, searchName, products]);

  useEffect(() => {
    const initialize = async () => {
      const fetchedProducts = await fetchProducts();
      if (fetchedProducts.length > 0) {
        await fetchVariantCounts(fetchedProducts);
      }
    };
    initialize();
  }, []);
  
  useImperativeHandle(ref, () => ({
    fetchProducts,
  }));

  // Fetch products from the service
  const fetchProducts = async () => {
    try {
      const allProducts = await ProductService.getAllProducts();
      const validProducts = allProducts.filter((product) => product.name);
      setProducts(validProducts);
      setFilteredProducts(validProducts);
      return validProducts; // Return the products for use in fetchVariantCounts
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch products!",
      });
      console.error("Error fetching products:", error);
      return [];
    }
  };

  // Sửa lại hàm fetchVariantCounts để kiểm tra tham số đầu vào
  const fetchVariantCounts = async (productsToCount = products) => {
    try {
      if (!productsToCount || productsToCount.length === 0) {
        console.log("No products to count variants for");
        return;
      }
      
      const counts = {};
      for (const product of productsToCount) {
        const variants = await ProductVariantService.getProductVariantsByProductId(product.id);
        counts[product.id] = variants.length;
      }
      setVariantCounts(counts);
    } catch (error) {
      console.error("Error fetching variant counts:", error);
    }
  };

  // Open modal for adding a product
  const handleAddProduct = () => {
    //setSelectedProduct(null); // Clear selection for new product - Removed
    setSelectedProductId(null); // Reset selectedProductId
    setIsModalOpen(true); // Open modal
  };

  const handleAddProductVariants = (productId) => {
    // setSelectedProduct(null); // Clear selection for new product - Removed
    setSelectedProductId(productId); // Set the selected product ID
    setIsModalOpenVariants(true); // Open modal
    console.log("Opening variant modal for product ID:", productId); // Debugging
  };
  const handleAddAttribute = () => {
    setIsModalOpenAttributes(true); // Open modal
  };

  // Open modal for editing an existing product
  const handleEditProduct = (product) => {
    //setSelectedProduct(product);
    setSelectedProductId(product); // Set the selected product ID
    setIsModalOpen(true); // Open modal
  };

  // Toggle product status between Available and Unavailable
  const handleDelete = async (id, currentProductDetails) => {
    try {
      const updatedProductDetails = {
        ...currentProductDetails,
        stock: currentProductDetails.stock, // Dữ liệu stock hiện tại
        status:
          currentProductDetails.stock === 0
            ? "Out of Stock"
            : currentProductDetails.status === "Unavailable"
            ? "Available"
            : "Unavailable",
      };

      await ProductService.updateProduct(id, updatedProductDetails);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Trạng thái sản phẩm được cập nhật thành ${updatedProductDetails.status}!`,
      });

      fetchProducts(); // Refresh product list
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update product status!",
      });
      console.error("Lỗi cập nhật trạng thái sản phẩm:", error);
    }
  };

  // Close modal after save and refresh product list
  const handleModalClose = () => {
    setIsModalOpen(false); // Close modal
    fetchProducts(); // Refresh product list after save
  };

  // Sửa lại hàm handleModalCloseVariants
  const handleModalCloseVariants = async () => {
    setIsModalOpenVariants(false);
    const updatedProducts = await fetchProducts(); // Lấy danh sách products mới nhất
    if (updatedProducts && updatedProducts.length > 0) {
      await fetchVariantCounts(updatedProducts);
    }
  };

  const handleModalCloseAttribute = () => {
    setIsModalOpenAttributes(false); // Close modal
    setSelectedAttribute(null);
    fetchProducts(); // Refresh product list after save
  };

  const handleEditAttribute = (attribute) => {
    setSelectedAttribute(attribute);
    setIsModalOpenAttributes(true);
  };

  // Filter products based on search criteria
  const filterProducts = () => {
    const filtered = products.filter((product) => {
      const nameMatch =
        product.name &&
        product.name.toLowerCase().includes(searchName.toLowerCase());
      const statusMatch = statusFilter ? product.status === statusFilter : true;
      const priceMatch =
        minPrice && maxPrice
          ? product.price >= minPrice && product.price <= maxPrice
          : true;

      return nameMatch && statusMatch && priceMatch;
    });

    setFilteredProducts(filtered);
  };


  const columns = [
    {
      name: "Tên sản phẩm",
      selector: (row) => row.name || "", // Fallback to empty string if product.name is null
      sortable: true,
    },
    {
      name: "Mô tả",
      selector: (row) => row.description || "", // Fallback to empty string if product.description is null
      sortable: true,
    },
    {
      name: "Tồn kho",
      selector: (row) => row.stock,
      sortable: true,
      width: "100px",

    },
    {
      name: "Trạng Thái",
      selector: (row) => row.status,
      cell: (row) => {
        const isOutOfStock = row.stock === 0;
        const statusDisplay = isOutOfStock
          ? "Hết hàng"
          : row.status === "Available"
          ? "Còn hoạt động"
          : "Hết hoạt động";
        return (
          <span
            className={`px-2 py-1 rounded text-white ${
              isOutOfStock
                ? "bg-red-500"
                : row.status === "Available"
                ? "bg-green-500"
                : "bg-yellow-500"
            }`}
          >
            {statusDisplay}
          </span>
        );
      },
    },

    {
      name: "Ảnh",
      selector: (row) => row.imageUrl,
      width: "100px",
      cell: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.name}
            className="h-12 w-12 object-cover rounded"
          />
        ) : (
          <span className="text-gray-500">No image</span>
        ),
    },
    {
      name: "Số biến thể",
      selector: (row) => variantCounts[row.id] || 0,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded ${
            variantCounts[row.id] === 0
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {variantCounts[row.id] || 0}
        </span>
      ),
    },
    {
      name: "Hành động",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => handleEditProduct(row)}
          >
            <FaEdit />
          </button>
          <button
            className={`px-2 py-1 rounded ${
              row.stock === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            onClick={() => row.stock !== 0 && handleDelete(row.id, row)}
            disabled={row.stock === 0}
          >
            <FiRefreshCw />
          </button>
          <button
            className="px-2 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-1"
            onClick={() => handleAddProductVariants(row.id)}
          >
            <FaAsterisk className="w-4 h-4" />
            <span>Quản Lý biến thể</span>
          </button>
        </div>
      ),
      width: "270px",

    },
  ];

  const exportToExcel = () => {
    try {
      // Create worksheet from table data
      const worksheet = XLSX.utils.json_to_sheet(filteredProducts);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, "products.xlsx");

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "File Excel đã được tải xuống!",
      });
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể xuất file Excel!",
      });
    }
  };

  return (
    <div className="p-4 bg-white">
      {/* Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        ariaHideApp={false}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl transition-opacity duration-300 ease-out"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="h-full w-full bg-white p-6 rounded-lg flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedProductId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
            <button
              onClick={handleModalClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
          <ProductInput
            product={selectedProductId}
            onSave={handleModalClose}
          />
        </div>
      </Modal>

      {/* Modal Component */}
      <Modal
        isOpen={isModalOpenVariants}
        onRequestClose={handleModalClose}
        ariaHideApp={false}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl transition-opacity duration-300 ease-out max-w-[95vw] w-[95%]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="h-full w-full bg-white p-6 rounded-lg flex flex-col max-h-[95vh] min-h-[800px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quản Lý Biến thể</h2>
            <button
              onClick={handleModalCloseVariants}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
          <ProductVariantsInput
            productId={selectedProductId}
            onSave={handleModalCloseVariants}
          />
        </div>
      </Modal>

      {/* Modal Component */}
      <Modal
        isOpen={isModalOpenAttributes}
        onRequestClose={handleModalCloseAttribute}
        ariaHideApp={false}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl transition-opacity duration-300 ease-out max-w-3xl w-full"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="h-full w-full bg-white p-6 rounded-lg flex flex-col max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quản Lý Thuộc tính</h2>
            <button
              onClick={handleModalCloseAttribute}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Attributes Input - Now centered */}
          <div className="flex justify-center items-center mb-4">
            <div className="w-2/3">
              <AttributesInput
                selectedAttribute={selectedAttribute}
                onAddAttribute={() => handleModalCloseAttribute()}
              />
            </div>
          </div>

          {/* Attributes Table */}
          <div className="border-t pt-4">
            <AttributesTable onEditAttribute={handleEditAttribute} />
          </div>
        </div>
      </Modal>

      <div className="flex items-center mb-4 gap-4">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={handleAddProduct}
        >
          + Thêm sản phẩm
        </button>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAddAttribute}
        >
          + Quản Lý Thuộc tính
        </button>

        {/* Nút Xuất Excel */}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={exportToExcel}
        >
          Xuất Excel
        </button>
      </div>

      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          className="border border-gray-300 px-4 py-2 rounded"
          placeholder="Tìm kiếm theo tên..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyUp={filterProducts}
        />
        <select
          className="border border-gray-300 px-4 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Trạng thái</option>
          <option value="Available">Còn Hoạt Động</option>
          <option value="Unavailable">Hết Hoạt Động</option>
          <option value="Out of Stock">Hết hàng</option>
        </select>
      </div>

      <DataTable
        title="Danh sách sản phẩm"
        columns={columns}
        data={filteredProducts} // Render filtered data
        pagination
        highlightOnHover
        responsive
      />
    </div>
  );
});

export default ProductTable;
