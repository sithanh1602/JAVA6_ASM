// components/TagTable.js
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import TagInput from "./TagInput";
import TagService from "../../../../services/TagPostService"; // Import TagService instance
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";

const TagTable = forwardRef((_, ref) => {
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  useImperativeHandle(ref, () => ({
    fetchTags,
  }));

  const fetchTags = async () => {
    try {
      const allTags = await TagService.getAllTags();      
      if (!Array.isArray(allTags)) {
        console.error("Dữ liệu trả về không phải mảng:", allTags);
        throw new Error("Dữ liệu từ server không đúng định dạng!");
      }
      const validTags = allTags.filter((tag) => tag && tag.tagName); // Lọc bằng tagName
      setTags(validTags);
      setFilteredTags(validTags);
      if (validTags.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Thông báo",
          text: "Chưa có tag nào trong database!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.message || "Không thể tải danh sách tag! Vui lòng kiểm tra kết nối server.",
      });
      console.error("Error fetching tags:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTag(null);
    fetchTags();
  };

  const handleAddTag = () => {
    setSelectedTag(null);
    setIsModalOpen(true);
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const handleDeleteTag = async (id) => {
    try {
      const success = await TagService.deleteTag(id);
      if (success) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Tag đã được xóa!",
        });
        fetchTags();
      } else {
        throw new Error("Xóa tag thất bại!");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.message || "Không thể xóa tag!",
      });
      console.error("Error deleting tag:", error);
    }
  };

  const filterTags = () => {
    const filtered = tags.filter((tag) => {
      const nameMatch =
        tag.tagName && // Sửa từ tag.name thành tag.tagName
        tag.tagName.toLowerCase().includes(searchName.toLowerCase());
      return nameMatch;
    });
    setFilteredTags(filtered);
  };

  useEffect(() => {
    filterTags();
  }, [searchName, tags]);

  const columns = [
    {
      name: "Tên tag",
      selector: (row) => row.tagName || "", // Sửa từ row.name thành row.tagName
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
            onClick={() => handleEditTag(row)}
          >
            <FaEdit />
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => handleDeleteTag(row.id)}
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
              {selectedTag ? "Cập nhật tag" : "Thêm tag mới"}
            </h2>
            <button
              onClick={handleModalClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
          <TagInput
            tag={selectedTag}
            onClose={handleModalClose}
            onTagAdded={fetchTags}
          />
        </div>
      </Modal>

      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={handleAddTag}
          >
            + Thêm tag
          </button>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          className="border border-gray-300 px-4 py-2 rounded w-1/3"
          placeholder="Tìm kiếm theo tên tag..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      <DataTable
        title="Danh sách tag"
        columns={columns}
        data={filteredTags}
        pagination
        highlightOnHover
        responsive
        noDataComponent="Không có tag nào để hiển thị"
      />
    </div>
  );
});

export default TagTable;