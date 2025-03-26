import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  useDisclosure,
  Textarea,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSort,
  FaImage,
} from "react-icons/fa";
import AdminPCBuilder from "../../components/admin/TableForm/PC-build/AdminPCBuilder";
import Swal from "sweetalert2";
import BuildPCService from "../../services/BuildPcService";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// Import Sonner Toast
import { Toaster, toast } from "sonner";
// Import Firebase Storage
import { storage } from "../../firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const PCBuildsAdmin = () => {
  const [pcBuilds, setPcBuilds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [buildName, setBuildName] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [buildType, setBuildType] = useState("Gaming"); // Mục đích sử dụng
  const [buildStatus, setBuildStatus] = useState("Available"); // Status là Available/Unavailable
  const [buildImages, setBuildImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // Trạng thái đang tải ảnh
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editMode, setEditMode] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState(null);

  // Cập nhật hàm fetchPCBuilds để chuyển đổi dữ liệu đúng format cho AdminPCBuilder
  const fetchPCBuilds = async () => {
    setIsLoading(true);
    try {
      const response = await BuildPCService.getAllBuildPC();
      const apiData = response.data.map((build) => {
        // Chuyển đổi buildPCProductVariants thành đối tượng với key là categoryId
        const components = {};

        if (build.buildPCProductVariants) {
          build.buildPCProductVariants.forEach((variant) => {
            if (variant.categoryId) {
              components[variant.categoryId] = {
                id: variant.productVariantId,
                nameVariants: variant.nameVariants || "Unknown",
                price: variant.price || 0,
                image: variant.image || null,
                quantity: variant.quantity || 0,
                variantQuantity: variant.variantQuantity || 1,
                status: variant.status || "Available",
                categoryId: variant.categoryId,
              };
            }
          });
        }

        return {
          id: build.buildId,
          name: build.buildName,
          description: build.description,
          type: build.usagePurpose,
          status: build.status,
          totalPrice: build.totalPrice,
          // Lưu cả hai dạng dữ liệu của components
          components: components, // Đối tượng với key là categoryId
          componentsArray: build.buildPCProductVariants || [], // Mảng gốc từ API
          createdAt: build.createdDate,
          updatedAt: build.createdDate,
          image:
            build.image ||
            (build.imageUrls && build.imageUrls.length > 0
              ? build.imageUrls[0]
              : null),
          imageUrls: build.imageUrls || [],
          totalProducts: build.totalProducts,
        };
      });
      setPcBuilds(apiData);
      console.log("Processed API data:", apiData);
    } catch (error) {
      console.error("Failed to fetch PC builds:", error);
      toast.error("Không thể tải danh sách cấu hình PC", {
        description: "Vui lòng thử lại sau.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPCBuilds(); // Gọi API khi component mount
  }, []);

  useEffect(() => {
    if (editMode && selectedBuild) {
      setBuildName(selectedBuild.name);
      setBuildDescription(selectedBuild.description);
      setBuildType(selectedBuild.type || "Gaming");
      setBuildStatus(selectedBuild.status || "Available");

      // Xử lý imageUrls
      if (selectedBuild.imageUrls && selectedBuild.imageUrls.length > 0) {
        const imageObjects = selectedBuild.imageUrls.map((url) => ({
          preview: url,
        }));
        setBuildImages(imageObjects);
      } else if (selectedBuild.image) {
        setBuildImages([{ preview: selectedBuild.image }]);
      } else {
        setBuildImages([]);
      }
    }
  }, [editMode, selectedBuild]);

  const handleCreateBuild = () => {
    setEditMode(false);
    setSelectedBuild(null);
    setBuildName("");
    setBuildDescription("");
    setBuildType("Gaming");
    setBuildStatus("Available");
    setBuildImages([]);
    setSelectedComponents(null);
    onOpen();
  };

  const handleEditBuild = (build) => {
    setEditMode(true);
    setSelectedBuild(build);
    setBuildName(build.name);
    setBuildDescription(build.description);
    setBuildType(build.type || "Gaming");
    setBuildStatus(build.status || "Available");

    // Xử lý imageUrls
    if (build.imageUrls && build.imageUrls.length > 0) {
      const imageObjects = build.imageUrls.map((url) => ({
        preview: url,
      }));
      setBuildImages(imageObjects);
    } else if (build.image) {
      setBuildImages([{ preview: build.image }]);
    } else {
      setBuildImages([]);
    }

    // Check if components is actually an array instead of object
    if (build.components && Array.isArray(build.components)) {
      const componentsObj = {};

      // Convert components array to object structure required by AdminPCBuilder
      build.components.forEach((comp) => {
        if (comp.categoryId) {
          componentsObj[comp.categoryId] = {
            id: comp.variantId,
            nameVariants: comp.name || "Unknown",
            price: comp.price || 0,
            image: comp.image || null,
            quantity: comp.quantity || 1,
            status: comp.status || "Available",
          };
        }
      });

      setSelectedComponents(componentsObj);
      console.log("Converted components:", componentsObj);
    } else {
      // If it's already in the correct format
      setSelectedComponents(build.components);
      console.log("Using existing components format:", build.components);
    }

    onOpen();
  };


  const handleToggleStatus = async (buildId, currentStatus) => {
    const newStatus = currentStatus === "Available" ? "Unavailable" : "Available";
    try {
      // Gọi API chỉ cập nhật trạng thái
      await BuildPCService.updateBuildPCStatus(buildId, newStatus);
      
      // Cập nhật UI
      setPcBuilds(
        pcBuilds.map((build) =>
          build.id === buildId ? { ...build, status: newStatus } : build
        )
      );
      
      toast.success("Cập nhật thành công", {
        description: `Trạng thái đã được chuyển thành ${newStatus}.`,
        duration: 2000
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Không thể cập nhật trạng thái", { 
        description: "Vui lòng thử lại sau.",
        duration: 3000
      });
    }
  };

  // Xử lý tải ảnh lên Firebase với Sonner Toast
  const handleImageChange = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      setIsUploading(true);
      const uploadedImages = [];

      // Hiển thị thông báo đang tải với Sonner Toast
      const toastId = toast.loading("Đang tải ảnh lên...");

      for (const file of files) {
        try {
          // Tạo tham chiếu đến Firebase Storage với tên file duy nhất
          const storageRef = ref(
            storage,
            `build_pc_images/${buildName || "unnamed"}-${
              file.name
            }-${Date.now()}`
          );

          // Tải file lên Firebase Storage
          await uploadBytes(storageRef, file);

          // Lấy URL của file đã tải lên
          const downloadURL = await getDownloadURL(storageRef);

          // Thêm URL vào danh sách ảnh đã tải
          uploadedImages.push({ preview: downloadURL });
        } catch (error) {
          console.error(`Lỗi khi tải file ${file.name}:`, error);
        }
      }

      // Cập nhật danh sách ảnh
      setBuildImages([...buildImages, ...uploadedImages]);

      if (uploadedImages.length > 0) {
        // Cập nhật thông báo thành công với Sonner
        toast.success(`Đã tải lên ${uploadedImages.length} ảnh thành công`, {
          id: toastId,
          duration: 2000,
        });
      } else {
        // Cập nhật thông báo lỗi với Sonner
        toast.error("Không thể tải ảnh lên. Vui lòng thử lại sau.", {
          id: toastId,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Lỗi khi xử lý ảnh:", error);
      toast.error("Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại sau.", {
        duration: 2000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setBuildImages(buildImages.filter((_, i) => i !== index));
  };

  const handleSaveBuild = async (componentData) => {
    if (!buildName.trim()) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng nhập tên cho cấu hình PC.",
        duration: 3000
      });
      return;
    }
  
    if (!componentData || !componentData.buildPCProductVariants || componentData.buildPCProductVariants.length === 0) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng chọn ít nhất một linh kiện cho cấu hình PC.",
        duration: 3000
      });
      return;
    }
  
    if (buildImages.length === 0) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng thêm ít nhất một hình ảnh cho cấu hình PC.",
        duration: 3000
      });
      return;
    }
  
    setIsSaving(true);
    console.log("Component data received from AdminPCBuilder:", componentData);
  
    try {
      // Chuẩn bị dữ liệu cho API
      const buildPCDto = {
        buildId: editMode ? selectedBuild.id : null,
        buildName: buildName,
        totalPrice: componentData.totalPrice,
        usagePurpose: buildType,
        description: buildDescription,
        status: buildStatus,
        imageUrls: buildImages.map(img => img.preview), // Lấy tất cả URL ảnh
        buildPCProductVariants: componentData.buildPCProductVariants
      };
  
      console.log("Data sending to API:", buildPCDto);
  
      let response;
      if (editMode) {
        response = await BuildPCService.updateBuildPC(selectedBuild.id, buildPCDto);
      } else {
        response = await BuildPCService.createBuildPC(buildPCDto);
      }
  
      // Refresh danh sách sau khi lưu thành công
      await fetchPCBuilds();
      
      onClose();
      toast.success(editMode ? "Cập nhật thành công" : "Tạo mới thành công", {
        description: editMode ? "Cấu hình PC đã được cập nhật." : "Cấu hình PC mới đã được tạo.",
        duration: 3000
      });
    } catch (error) {
      console.error(editMode ? "Failed to update PC build:" : "Failed to create PC build:", error);
      toast.error("Lỗi", { 
        description: `Không thể ${editMode ? "cập nhật" : "tạo"} cấu hình PC. ${error.response?.data?.message || "Vui lòng thử lại sau."}`,
        duration: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
  };

  const filteredBuilds = pcBuilds.filter(
    (build) =>
      build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      build.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: "TÊN CẤU HÌNH",
      selector: (row) => row.name,
      sortable: true,
      grow: 2,
    },

    {
      name: "MỤC ĐÍCH",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <Chip
          color={
            row.type?.toLowerCase().includes("gaming")
              ? "danger"
              : row.type?.toLowerCase().includes("office") ||
                row.type?.toLowerCase().includes("văn phòng")
              ? "primary"
              : "secondary"
          }
          size="sm"
          variant="flat"
        >
          {row.type || "Chưa xác định"}
        </Chip>
      ),
    },
    {
      name: "TRẠNG THÁI",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <Chip
          color={row.status === "Available" ? "success" : "default"}
          size="sm"
          variant="flat"
          className="cursor-pointer"
          onClick={() => handleToggleStatus(row.id, row.status)}
        >
          {row.status || "Unavailable"}
        </Chip>
      ),
    },
    {
      name: "Ảnh",
      selector: (row) => row.image,
      sortable: false,
      cell: (row) => (
        <div className="w-16 h-16 flex items-center justify-center">
          <img
            src={row.image || "https://placehold.co/80x80?text=PC+Part"}
            alt={row.name || "PC Image"}
            className="w-full h-full object-contain rounded-mdS"
          />
        </div>
      ),
      width: "100px",
    },
    {
      name: "GIÁ",
      selector: (row) => row.totalPrice,
      sortable: true,
      right: true,
      cell: (row) => <div>{formatPrice(row.totalPrice || 0)}</div>,
    },
    {
      name: "SỐ LINH KIỆN",
      selector: (row) => row.totalProducts || row.components?.length || 0,
      sortable: true,
      center: true,
    },
    {
      name: "NGÀY TẠO",
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("vi-VN")
          : "Chưa xác định",
    },
    {
      name: "THAO TÁC",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            isIconOnly
            color="primary"
            size="sm"
            onClick={() => handleEditBuild(row)}
            title="Chỉnh sửa"
          >
            <FaEdit />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "120px",
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f9fafb",
        color: "#374151",
        fontWeight: "bold",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "0.875rem",
      },
    },
    rows: {
      style: {
        fontSize: "0.875rem",
        "&:nth-child(odd)": {
          backgroundColor: "#f9fafb",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f3f4f6",
      },
    },
    pagination: {
      style: {
        border: "none",
        backgroundColor: "#ffffff",
      },
      pageButtonsStyle: {
        borderRadius: "0",
      },
    },
  };

  return (
    <div className="w-full">
      {/* Thêm Toaster component vào ứng dụng */}
      <Toaster position="top-right" richColors />

      {/* Phần code hiện tại giữ nguyên... */}
      <Card className="shadow-md rounded-none">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Quản lý cấu hình PC</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Tìm kiếm cấu hình PC"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<FaSearch />}
              className="w-72 rounded-none"
            />
            <Button
              color="primary"
              startContent={<FaPlus />}
              onClick={handleCreateBuild}
              className="rounded-none"
            >
              Tạo cấu hình PC mới
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={columns}
            data={filteredBuilds}
            progressPending={isLoading}
            progressComponent={
              <div className="p-4 text-center">Đang tải dữ liệu...</div>
            }
            noDataComponent={
              <div className="p-4 text-center">Không có cấu hình PC nào.</div>
            }
            pagination
            paginationComponentOptions={{
              rowsPerPageText: "Số dòng mỗi trang:",
              rangeSeparatorText: "của",
            }}
            customStyles={customStyles}
            sortIcon={<FaSort />}
            selectableRows={false}
            highlightOnHover
          />
        </CardBody>
      </Card>

      {/* Modal với chiều cao tăng lên */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!isSaving && !isUploading) onClose();
        }}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          base: "rounded-none max-h-[90vh]", // Giới hạn chiều cao Modal
          header: "border-b",
          body: "overflow-y-auto", // Bật cuộn cho ModalBody
        }}
      >
        <ModalContent>
          <ModalHeader>
            {editMode ? "Chỉnh sửa cấu hình PC" : "Tạo cấu hình PC mới"}
          </ModalHeader>
          <ModalBody className="max-h-[85vh] overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Tên cấu hình PC"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                className="rounded-none"
                isRequired
              />
              <Select
                label="Mục đích sử dụng"
                selectedKeys={[buildType]}
                onChange={(e) => setBuildType(e.target.value)}
                className="rounded-none"
              >
                <SelectItem key="Gaming" value="Gaming">
                  Gaming
                </SelectItem>
                <SelectItem key="Office" value="Office">
                  Văn phòng
                </SelectItem>
                <SelectItem key="Design" value="Design">
                  Đồ họa/Thiết kế
                </SelectItem>
                <SelectItem key="Workstation" value="Workstation">
                  Workstation
                </SelectItem>
                <SelectItem key="Programming" value="Programming">
                  Lập trình
                </SelectItem>
                <SelectItem key="Streaming" value="Streaming">
                  Streaming
                </SelectItem>
                <SelectItem key="Custom" value="Custom">
                  Tùy chỉnh
                </SelectItem>
              </Select>
              <Select
                label="Trạng thái"
                selectedKeys={[buildStatus]}
                onChange={(e) => setBuildStatus(e.target.value)}
                className="rounded-none"
              >
                <SelectItem key="Available" value="Available">
                  Available
                </SelectItem>
                <SelectItem key="Unavailable" value="Unavailable">
                  Unavailable
                </SelectItem>
              </Select>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Ảnh cấu hình PC</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="build-image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="build-image-upload"
                className={`cursor-pointer block w-full ${
                  isUploading ? "opacity-50" : ""
                }`}
              >
                <div className="w-full flex flex-wrap gap-2">
                  {buildImages.length > 0 ? (
                    buildImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-32 h-32 flex items-center justify-center bg-gray-100 border rounded-lg overflow-hidden"
                      >
                        <img
                          src={img.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/300x200?text=Error+loading+image";
                          }}
                        />
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            removeImage(index);
                          }}
                          disabled={isUploading}
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      <FaImage className="w-8 h-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-400">
                        {isUploading
                          ? "Đang tải ảnh lên..."
                          : "Click để tải ảnh lên"}
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <div className="border rounded-none">
                <CKEditor
                  editor={ClassicEditor}
                  data={buildDescription}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setBuildDescription(data);
                  }}
                  config={{
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "insertTable",
                      "tableColumn",
                      "tableRow",
                      "mergeTableCells",
                      "|",
                      "alignment:left",
                      "alignment:center",
                      "alignment:right",
                      "alignment:justify",
                      "|",
                      "insertImage",
                      "mediaEmbed",
                      "undo",
                      "redo",
                    ],
                  }}
                />
              </div>
            </div>

            <p className="text-lg font-semibold mb-2">Chọn linh kiện</p>
            <AdminPCBuilder
              initialComponents={
                editMode && selectedBuild ? selectedComponents : {}
              }
              onSave={handleSaveBuild}
              buildPCData={editMode ? selectedBuild : null}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PCBuildsAdmin;
