import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import PostInput from "./PostInput";
import PostService from "../../../../services/PostService";
import Swal from "sweetalert2";
import { FaEdit  } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

const PostsTable = forwardRef((_, ref) => {
  const [posts, setPosts] = useState([]);
  const [filteredPost, setFilteredPost] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  useImperativeHandle(ref, () => ({
    fetchPosts,
  }));
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const allPosts = await PostService.getAllPosts();
      console.log("Fetched posts:", allPosts); // Debug
      
      let validPosts = [];
      if (Array.isArray(allPosts)) {
        validPosts = allPosts;
      } else if (allPosts && Array.isArray(allPosts.content)) {
        validPosts = allPosts.content;
      }
      setPosts(validPosts);
      setFilteredPost(validPosts);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch posts!",
      });
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchPosts();
  };

  const handleAddPosts = () => {
    setSelectedPost();
    setIsModalOpen(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, currentPostDetails) => {
    try {
      const updatedPost = await PostService.togglePostStatus(id);
  
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Post status updated to ${updatedPost.status ? "true" : "false"}!`,
      });
  
      fetchPosts(); // Cập nhật danh sách bài viết
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update post status! ${error.message}`,
      });
      console.error("Error updating post status:", error);
    }
  };

  const filterPost = () => {
    const filtered = posts.filter((post) => {
      const nameMatch =
        post.title &&
        post.title.toLowerCase().includes(searchName.toLowerCase());
      const statusMatch =
        statusFilter !== "" ? post.status === (statusFilter === "true") : true;

      return nameMatch && statusMatch;
    });

    setFilteredPost(filtered);
  };


  useEffect(() => {
    filterPost();
  }, [statusFilter, searchName, posts]);

  const columns = [
    {
      name: "Tiêu đề bài viết",
      selector: (row) => row.title || "",
      sortable: true,
    },
    {
      name: "Nội dung",
      selector: (row) => row.content || "",
      sortable: true,
      cell: (row) => {
        const maxLength = 100;
        const content = row.content || "";
        const displayContent =
          content.length > maxLength
            ? content.substring(0, maxLength) + "..."
            : content;
    
        return (
          <div className="markdown-content line-clamp-4 max-w-xs overflow-hidden">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
        );
      },
    },

    {
      name: "Danh mục",
      selector: (row) => row.postCategories?.name || "Không có",
    },
    {
      name: "Tags",
      selector: (row) => row.tags.id,
      cell: (row) =>
        row.tags && row.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 rounded">
                {tag.tag.tagName}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">Không có tag</span>
        ),
    },    
    {
      name: "Ảnh",
      selector: (row) => row.images,
      cell: (row) =>
        row.images && row.images.length > 0 ? (
          <div className="flex space-x-2">
            {row.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image.imageUrl}
                className="h-12 w-14 object-cover rounded"
              />
            ))}
            {row.images.length > 3 && <span>+{row.images.length - 3} ảnh</span>}
          </div>
        ) : (
          <span className="text-gray-500">Không có ảnh</span>
        ),
    },
    {
      name: "Trạng Thái",
      selector: (row) => row.status,
      cell: (row) => {
        const isActive = row.status;
        const statusDisplay = isActive ? "Còn hoạt động" : "Hết hoạt động";
        return (
          <span
            className={`px-2 py-1 rounded text-white ${
              isActive ? "bg-green-500" : "bg-yellow-500"
            }`}>
            {statusDisplay}
          </span>
        );
      },
    },
    {
      name: "Hành động",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => handleEditPost(row)}>
            <FaEdit />
          </button>
          <button
            className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
            onClick={() => handleUpdateStatus(row.id, row.status)}>
            <FiRefreshCw />
          </button>
        </div>
      ),
    },   
  ];

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Bạn có chắc muốn xoá?",
        text: "Thao tác này không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xoá",
        cancelButtonText: "Huỷ"
      });
  
      if (result.isConfirmed) {
        await PostService.deletePost(id);
        Swal.fire("Đã xoá!", "Bài viết đã được xoá.", "success");
        // Gọi hàm reload danh sách bài viết nếu có
      }
    } catch (error) {
      Swal.fire("Lỗi", "Xoá bài viết thất bại", "error");
    }
  }

  return (
    <div className="p-4 bg-white">
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        ariaHideApp={false}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl transition-opacity duration-300 ease-out"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="h-full w-full bg-white p-6 rounded-lg flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedPost ? "Cập nhật bài viết" : "Thêm bài viết mới"}
            </h2>
            <button
              onClick={handleModalClose}
              className="text-gray-500 hover:text-gray-700">
              <span className="text-xl">×</span>
            </button>
          </div>
          <PostInput post={selectedPost} onClose={handleModalClose} />
          </div>
      </Modal>

      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={handleAddPosts}>
            + Thêm bài viết
          </button>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          className="border border-gray-300 px-4 py-2 rounded"
          placeholder="Tìm kiếm theo tên..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyUp={filterPost}
        />
        <select
          className="border border-gray-300 px-4 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Trạng thái</option>
          <option value="true">Còn Hoạt Động</option>
          <option value="false">Hết Hoạt Động</option>
        </select>
      </div>

      <DataTable
        title="Danh sách bài viết"
        columns={columns}
        data={filteredPost}
        pagination
        highlightOnHover
        responsive
        progressPending={loading} // Hiển thị trạng thái loading
      />
    </div>
  );
});

export default PostsTable;
