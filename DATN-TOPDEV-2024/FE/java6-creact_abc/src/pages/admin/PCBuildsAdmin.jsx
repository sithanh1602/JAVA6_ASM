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
  Chip,
  useDisclosure,
} from "@nextui-org/react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaSort, FaImage } from "react-icons/fa";
import AdminPCBuilder from "../../components/admin/TableForm/PC-build/AdminPCBuilder";
import Swal from "sweetalert2";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import BuildPCService from "../../services/BuildPcService";

const PCBuildsAdmin = () => {
  const [pcBuilds, setPcBuilds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [buildName, setBuildName] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [buildType, setBuildType] = useState("GAMING");
  const [buildStatus, setBuildStatus] = useState("ACTIVE");
  const [buildImages, setBuildImages] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editMode, setEditMode] = useState(false);

  // Fetch PC Builds từ API
  const fetchPCBuilds = async () => {
    setIsLoading(true);
    try {
      const response = await BuildPCService.getAllBuildPC();
      const apiData = response.data.map((build) => ({
        id: build.buildId,
        name: build.buildName,
        description: build.description,
        type: build.usagePurpose, // Ánh xạ usagePurpose thành type
        status: build.status,
        totalPrice: build.totalPrice,
        components: build.buildPCProductVariants.map((variant) => ({
          categoryId: null, // Không có categoryId từ API, có thể cần điều chỉnh backend
          variantId: variant.productVariantId,
          name: `Variant ${variant.productVariantId}`, // Tên giả định, cần bổ sung từ API nếu có
          price: 0, // Giá cần được tính từ API nếu có
          quantity: variant.variantQuantity,
        })),
        createdAt: build.createdDate,
        updatedAt: build.createdDate, // Giả định updatedAt bằng createdDate nếu không có
        image: build.image, // Ảnh đầu tiên
        totalProducts: build.totalProducts,
      }));
      setPcBuilds(apiData);
    } catch (error) {
      console.error("Failed to fetch PC builds:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách cấu hình PC. Vui lòng thử lại sau.",
        confirmButtonText: "OK",
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
      setBuildType(selectedBuild.type);
      setBuildStatus(selectedBuild.status);
      setBuildImages(selectedBuild.image ? [{ preview: selectedBuild.image }] : []); // Chuyển image thành mảng preview
    }
  }, [editMode, selectedBuild]);

  const handleCreateBuild = () => {
    setEditMode(false);
    setSelectedBuild(null);
    setBuildName("");
    setBuildDescription("");
    setBuildType("GAMING");
    setBuildStatus("ACTIVE");
    setBuildImages([]);
    onOpen();
  };

  const handleEditBuild = (build) => {
    setEditMode(true);
    setSelectedBuild(build);
    setBuildName(build.name);
    setBuildDescription(build.description);
    setBuildType(build.type);
    setBuildStatus(build.status);
    setBuildImages(build.image ? [{ preview: build.image }] : []);
    onOpen();
  };

  const handleDeleteBuild = async (buildId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa cấu hình PC này không?",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      setPcBuilds(pcBuilds.filter((build) => build.id !== buildId));
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        text: "Cấu hình PC đã được xóa thành công.",
      });
    }
  };

  const handleToggleStatus = (buildId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setPcBuilds(
      pcBuilds.map((build) =>
        build.id === buildId ? { ...build, status: newStatus } : build
      )
    );
    Swal.fire({
      icon: "success",
      title: "Cập nhật thành công",
      text: `Trạng thái đã được chuyển thành ${newStatus === "ACTIVE" ? "Đang kích hoạt" : "Vô hiệu hóa"}.`,
    });
  };

  const handleSaveBuild = (components) => {
    if (!buildName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập tên cho cấu hình PC.",
      });
      return;
    }

    if (Object.keys(components).length === 0) {
      Swal.fire({
        icon: "error",
        title: "Thiếu thông tin",
        text: "Vui lòng chọn ít nhất một linh kiện cho cấu hình PC.",
      });
      return;
    }

    const pcBuildData = {
      id: editMode ? selectedBuild.id : `${Date.now()}`,
      name: buildName,
      description: buildDescription,
      type: buildType,
      status: buildStatus,
      image: buildImages.length > 0 ? buildImages[0].preview : null, // Lấy ảnh đầu tiên
      components: Object.entries(components).map(([categoryId, component]) => ({
        categoryId: categoryId,
        variantId: component.id || `${Date.now()}-${categoryId}`,
        name: component.nameVariants || "Component",
        price: component.price || 0,
        quantity: 1,
      })),
      totalPrice: Object.values(components).reduce(
        (sum, component) => sum + (component.price || 0),
        0
      ),
      createdAt: editMode ? selectedBuild.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalProducts: Object.values(components).length, // Tính tổng số linh kiện
    };

    if (editMode) {
      setPcBuilds(
        pcBuilds.map((build) =>
          build.id === pcBuildData.id ? pcBuildData : build
        )
      );
      onClose();
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công",
        text: "Cấu hình PC đã được cập nhật.",
      });
    } else {
      setPcBuilds([...pcBuilds, pcBuildData]);
      onClose();
      Swal.fire({
        icon: "success",
        title: "Tạo mới thành công",
        text: "Cấu hình PC mới đã được tạo.",
      });
    }
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
  };

  const filteredBuilds = pcBuilds.filter(
    (build) =>
      build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      build.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: "TÊN CẤU HÌNH",
      selector: (row) => row.name,
      sortable: true,
      grow: 2,
    },
 
    {
      name: "LOẠI",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <Chip
          color={
            row.type === "GAMING"
              ? "danger"
              : row.type === "OFFICE"
              ? "primary"
              : "secondary"
          }
          size="sm"
          variant="flat"
        >
          {row.type}
        </Chip>
      ),
    },
    {
      name: "TRẠNG THÁI",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <Chip
          color={row.status === "ACTIVE" ? "success" : "default"}
          size="sm"
          variant="flat"
          className="cursor-pointer"
          onClick={() => handleToggleStatus(row.id, row.status)}
        >
          {row.status === "ACTIVE" ? "Đang kích hoạt" : "Vô hiệu hóa"}
        </Chip>
      ),
    },
    {
      name: "Ảnh",
      selector: (row) => row.image,
      sortable: false,
      cell: (row) => (
        <div className=" w-16 h-16 flex items-center justify-center">
          <img
            src={row.image || "https://placehold.co/80x80?text=PC+Part"}
            alt={row.name || "PC Image"}
            className="w-full h-full object-contain rounded-mdS"
          />
        </div>
      ),
      width: "100px", // Đặt chiều rộng cố định cho cột ảnh
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
      cell: (row) => new Date(row.createdAt).toLocaleDateString("vi-VN"),
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
          <Button
            isIconOnly
            color="danger"
            size="sm"
            onClick={() => handleDeleteBuild(row.id)}
            title="Xóa"
          >
            <FaTrash />
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
            progressComponent={<div className="p-4 text-center">Đang tải dữ liệu...</div>}
            noDataComponent={<div className="p-4 text-center">Không có cấu hình PC nào.</div>}
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
        onClose={onClose}
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
              <select
                className="border p-2 rounded-none h-12"
                value={buildType}
                onChange={(e) => setBuildType(e.target.value)}
              >
                <option value="GAMING">Gaming</option>
                <option value="OFFICE">Văn phòng</option>
                <option value="WORKSTATION">Workstation</option>
                <option value="CUSTOM">Tùy chỉnh</option>
              </select>
              <select
                className="border p-2 rounded-none h-12"
                value={buildStatus}
                onChange={(e) => setBuildStatus(e.target.value)}
              >
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Hết hoạt động</option>
              </select>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Ảnh cấu hình PC</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const newImages = files.map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                  }));
                  setBuildImages((prev) => [...prev, ...newImages]);
                }}
                className="hidden"
                id="build-image-upload"
              />
              <label
                htmlFor="build-image-upload"
                className="cursor-pointer block w-full"
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
                        />
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            setBuildImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      <FaImage className="w-8 h-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-400">
                        Click để tải ảnh lên
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
                      "|",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "undo",
                      "redo",
                    ],
                  }}
                />
              </div>
            </div>

            <AdminPCBuilder
              initialComponents={editMode ? selectedBuild?.components : []}
              onSave={handleSaveBuild}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PCBuildsAdmin;