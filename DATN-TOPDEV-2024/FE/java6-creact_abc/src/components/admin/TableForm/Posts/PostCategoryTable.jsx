import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import PostCategoryInput from "./PostCategoryInput";
import PostCateService from "../../../../services/PostCateService";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";

const PostsCategoryTable = forwardRef((_, ref) => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useImperativeHandle(ref, () => ({
    fetchCategories,
  }));

  const fetchCategories = async () => {
    try {
      const allCategories = await PostCateService.getAllPostCategories();
      if (!Array.isArray(allCategories)) {
        console.error("Dữ liệu trả về không phải mảng:", allCategories);
        throw new Error("Dữ liệu từ server không đúng định dạng!");
      }
      const validCategories = allCategories.filter((category) => category && category.name);
      console.log("Danh sách danh mục hợp lệ:", validCategories); // Debug
      setCategories(validCategories);
      setFilteredCategories(validCategories);
      if (validCategories.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Thông báo",
          text: "Chưa có danh mục nào trong database!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.message || "Không thể tải danh sách danh mục! Vui lòng kiểm tra kết nối server.",
      });
      console.error("Error fetching categories:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await PostCateService.deletePostCategories(id);
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Danh mục đã được xóa!",
      });
      fetchCategories();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.response?.data || "Không thể xóa danh mục!",
      });
      console.error("Error deleting category:", error);
    }
  };

  const filterCategories = () => {
    const filtered = categories.filter((category) => {
      const nameMatch =
        category.name &&
        category.name.toLowerCase().includes(searchName.toLowerCase());
      return nameMatch;
    });
    setFilteredCategories(filtered);
  };

  useEffect(() => {
    filterCategories();
  }, [searchName, categories]);

  const columns = [
    {
      name: "Tên danh mục",
      selector: (row) => row.name || "",
      sortable: true,
    },
    {
      name: "Mô tả",
      selector: (row) => row.description || "",
      sortable: true,
      cell: (row) => {
        const maxLength = 100;
        const description = row.description || "";
        const displayDescription =
          description.length > maxLength
            ? description.substring(0, maxLength) + "..."
            : description;
        return <span title={description}>{displayDescription}</span>;
      },
    },
    {
      name: "Hành động",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => handleEditCategory(row)}
          >
            <FaEdit />
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => handleDeleteCategory(row.id)}
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white">
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        ariaHideApp={false}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl transition-opacity duration-300 ease-out"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="w-full bg-white p-6 rounded-lg flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </h2>
            <button
              onClick={handleModalClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
          <PostCategoryInput
            category={selectedCategory}
            onClose={handleModalClose}
            onCategoryAdded={fetchCategories}
          />
        </div>
      </Modal>

      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={handleAddCategory}
          >
            + Thêm danh mục
          </button>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          className="border border-gray-300 px-4 py-2 rounded w-1/3"
          placeholder="Tìm kiếm theo tên danh mục..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      <DataTable
        title="Danh sách danh mục bài viết"
        columns={columns}
        data={filteredCategories}
        pagination
        highlightOnHover
        responsive
        noDataComponent="Không có danh mục nào để hiển thị"
      />
    </div>
  );
});

export default PostsCategoryTable;