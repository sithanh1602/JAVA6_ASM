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
import { FaEdit } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Collapse } from "react-collapse";

const ContentCell = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;
  const displayContent =
    content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;

  return (
    <div className="relative">
      <div
        className="markdown-content line-clamp-2 max-w-xs overflow-hidden cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <ReactMarkdown>{displayContent}</ReactMarkdown>
      </div>
      {isExpanded && (
        <div className="absolute z-10 mt-2 p-4 bg-white border rounded-lg shadow-lg max-w-2xl">
          <div className="markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          <button
            className="mt-2 text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}>
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

const PostsTable = forwardRef((_, ref) => {
  const [posts, setPosts] = useState([]);
  const [filteredPost, setFilteredPost] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // Change from object to single expanded row ID
  const [expandedRowId, setExpandedRowId] = useState(null);

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
        text: `Post status updated to ${
          updatedPost.status ? "true" : "false"
        }!`,
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

  // Modified to handle single row expansion
  const handleRowExpand = (row) => {
    setExpandedRowId(expandedRowId === row.id ? null : row.id);
  };
  const columns = [
    {
      name: "Tiêu đề",
      selector: (row) => row.title || "",
      sortable: true,
      width: "180px",
      cell: (row) => (
        <div className="truncate max-w-[140px]" title={row.title}>
          {row.title || ""}
        </div>
      ),
    },
    {
      name: "Nội dung",
      selector: (row) => row.content || "",
      sortable: true,
      width: "200px",
      cell: (row) => (
        <div className="max-w-[170px]">
          <ContentCell content={row.content || ""} />
        </div>
      ),
    },
    {
      name: "Danh mục",
      selector: (row) => row.postCategories?.name || "Không có",
      width: "180px",
      cell: (row) => (
        <div className="truncate max-w-[110px]" title={row.postCategories?.name}>
          {row.postCategories?.name || "Không có"}
        </div>
      ),
    },
    {
      name: "Tags",
      selector: (row) => row.tags?.id,
      width: "120px",
      cell: (row) =>
        row.tags && row.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[110px]">
            {row.tags.slice(0, 1).map((tag, index) => (
              <span key={index} className="px-1 py-0.5 text-xs bg-blue-100 rounded truncate">
                {tag.tag.tagName}
              </span>
            ))}
            {row.tags.length > 1 && (
              <span className="text-xs text-gray-500">+{row.tags.length - 1}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-500 text-xs">Không có tag</span>
        ),
    },
    {
      name: "Ảnh",
      selector: (row) => row.images,
      width: "100px",
      cell: (row) =>
        row.images && row.images.length > 0 ? (
          <div className="flex space-x-1">
            <img
              src={row.images[0].imageUrl}
              className="h-8 w-8 object-cover rounded"
              alt="Thumbnail"
            />
            {row.images.length > 1 && (
              <span className="text-xs flex items-center">+{row.images.length - 1}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-500 text-xs">Không có ảnh</span>
        ),
    },
    {
      name: "Trạng Thái",
      selector: (row) => row.status,
      width: "150px",
      cell: (row) => {
        const isActive = row.status;
        return (
          <span
            className={`px-1.5 py-0.5 rounded text-xs text-white ${
              isActive ? "bg-green-500" : "bg-yellow-500"
            }`}>
            {isActive ? "Hoạt động" : "Không hoạt động"}
          </span>
        );
      },
    },
    {
      name: "Hành động",
      width: "100px",
      cell: (row) => (
        <div className="flex space-x-1">
          <button
            className="bg-blue-500 text-white p-1 text-xs rounded hover:bg-blue-600"
            onClick={() => handleEditPost(row)}>
            <FaEdit size={14} />
          </button>
          <button
            className="p-1 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600"
            onClick={() => handleUpdateStatus(row.id, row.status)}>
            <FiRefreshCw size={14} />
          </button>
        </div>
      ),
    },
  ];


  return (
    <div className="p-2 bg-white">
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        ariaHideApp={false}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl transition-opacity duration-300 ease-out"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="h-full w-full bg-white p-4 rounded-lg flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">
              {selectedPost ? "Cập nhật bài viết" : "Thêm bài viết mới"}
            </h2>
            <button
              onClick={handleModalClose}
              className="text-gray-500 hover:text-gray-700">
              <span className="text-lg">×</span>
            </button>
          </div>
          <PostInput post={selectedPost} onClose={handleModalClose} />
        </div>
      </Modal>

      <div className="flex flex-col space-y-2 mb-4 sticky top-0 bg-white z-10 shadow-sm">
        <div className="flex items-center">
          <div className="space-x-2">
            <button
              className="bg-purple-600 text-white px-3 py-1.5 text-sm rounded hover:bg-purple-700"
              onClick={handleAddPosts}>
              + Thêm bài viết
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            className="border border-gray-300 px-3 py-1.5 text-sm rounded w-64"
            placeholder="Tìm kiếm theo tên..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyUp={filterPost}
          />
          <select
            className="border border-gray-300 px-3 py-1.5 text-sm rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Trạng thái</option>
            <option value="true">Còn Hoạt Động</option>
            <option value="false">Hết Hoạt Động</option>
          </select>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
      <h2 className="text-lg font-semibold"></h2>

        <DataTable
        title="Danh sách bài viết"
          columns={columns}
          data={filteredPost}
          pagination
          highlightOnHover
          responsive
          progressPending={loading}
          expandableRows
          expandableRowExpanded={(row) => row.id === expandedRowId}
          onRowExpandToggled={(expanded, row) => handleRowExpand(row)}
          expandableRowsComponent={({ data }) => (
            <Collapse isOpened={data.id === expandedRowId}>
              <div className="p-2 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold mb-1 text-sm">
                        Thông tin chi tiết
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Tiêu đề:</span>{" "}
                          {data.title}
                        </p>
                        <p>
                          <span className="font-medium">Danh mục:</span>{" "}
                          {data.postCategories?.name || "Không có"}
                        </p>
                        <p>
                          <span className="font-medium">Trạng thái:</span>{" "}
                          {data.status ? "Còn hoạt động" : "Hết hoạt động"}
                        </p>
                        {data.images && data.images.length > 0 && (
                          <div className="mt-2">
                            <h3 className="font-semibold mb-1 text-sm">
                              Hình ảnh
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {data.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image.imageUrl}
                                  className="h-12 w-12 object-cover rounded"
                                  alt={`Hình ảnh ${index + 1}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {data.tags && data.tags.length > 0 && (
                          <div className="mt-2">
                            <h3 className="font-semibold mb-1 text-sm">Tags</h3>
                            <div className="flex flex-wrap gap-1">
                              {data.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {tag.tag.tagName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm">
                        Nội dung đầy đủ
                      </h3>
                      <div className="markdown-content text-sm overflow-auto max-h-64">
                        <ReactMarkdown>{data.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Collapse>
          )}
        />
      </div>
    </div>
  );
});

export default PostsTable;
