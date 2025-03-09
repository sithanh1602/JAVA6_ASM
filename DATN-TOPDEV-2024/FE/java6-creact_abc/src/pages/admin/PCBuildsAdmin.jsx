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
  useDisclosure
} from "@nextui-org/react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaSort } from "react-icons/fa";
import AdminPCBuilder from "../../components/admin/TableForm/PC-build/AdminPCBuilder";
import Swal from "sweetalert2";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Mock data for PC builds
const mockPCBuilds = [
  {
    id: 1,
    name: "Gaming PC - Ultra",
    description: "Cấu hình gaming cao cấp, chơi mọi game ở mức Ultra",
    type: "GAMING",
    status: "ACTIVE",
    totalPrice: 47500000,
    components: [
      { categoryId: 1, variantId: 101, name: "Intel Core i9-13900K", price: 12500000 },
      { categoryId: 2, variantId: 501, name: "NVIDIA RTX 4080", price: 25000000 },
      { categoryId: 3, variantId: 301, name: "G.Skill Trident Z5 RGB 32GB", price: 3500000 },
      { categoryId: 4, variantId: 201, name: "ASUS ROG Maximus Z790", price: 12000000 },
      { categoryId: 5, variantId: 601, name: "Corsair RM850", price: 2500000 },
      { categoryId: 6, variantId: 401, name: "Samsung 980 PRO 2TB", price: 3500000 },
      { categoryId: 7, variantId: 701, name: "None", price: 0 },
      { categoryId: 8, variantId: 801, name: "Cooler Master MasterBox TD500", price: 2000000 },
      { categoryId: 9, variantId: 901, name: "NZXT Kraken X63", price: 2500000 }
    ],
    createdAt: "2025-02-15T10:30:00.000Z",
    updatedAt: "2025-02-15T10:30:00.000Z"
  },
  {
    id: 2,
    name: "Office PC - Standard",
    description: "Cấu hình PC văn phòng ổn định cho công việc hàng ngày",
    type: "OFFICE",
    status: "ACTIVE",
    totalPrice: 15000000,
    components: [
      { categoryId: 1, variantId: 102, name: "Intel Core i5-13600K", price: 5500000 },
      { categoryId: 2, variantId: 502, name: "None (Integrated GPU)", price: 0 },
      { categoryId: 3, variantId: 302, name: "Corsair Vengeance 16GB", price: 1500000 },
      { categoryId: 4, variantId: 202, name: "Gigabyte B760M DS3H", price: 2500000 },
      { categoryId: 5, variantId: 601, name: "Corsair RM650", price: 1500000 },
      { categoryId: 6, variantId: 402, name: "Crucial P3 1TB", price: 1500000 },
      { categoryId: 7, variantId: 702, name: "Seagate Barracuda 2TB", price: 1500000 },
      { categoryId: 8, variantId: 802, name: "Deepcool Matrexx 55", price: 1000000 },
      { categoryId: 9, variantId: 902, name: "Stock Cooler", price: 0 }
    ],
    createdAt: "2025-02-20T14:20:00.000Z",
    updatedAt: "2025-02-22T09:15:00.000Z"
  },
  {
    id: 3,
    name: "Workstation Pro",
    description: "Dàn PC chuyên dụng cho công việc đồ họa, render và làm việc chuyên nghiệp",
    type: "WORKSTATION",
    status: "INACTIVE",
    totalPrice: 75000000,
    components: [
      { categoryId: 1, variantId: 103, name: "AMD Ryzen Threadripper", price: 22000000 },
      { categoryId: 2, variantId: 502, name: "NVIDIA RTX 4090", price: 35000000 },
      { categoryId: 3, variantId: 303, name: "Kingston 64GB ECC", price: 8000000 },
      { categoryId: 4, variantId: 203, name: "ASUS Pro WS", price: 15000000 },
      { categoryId: 5, variantId: 602, name: "Seasonic Prime TX-1000", price: 4000000 },
      { categoryId: 6, variantId: 403, name: "WD Black 4TB", price: 4000000 },
      { categoryId: 7, variantId: 703, name: "Seagate IronWolf 4TB", price: 3000000 },
      { categoryId: 8, variantId: 803, name: "Lian Li PC-O11 Dynamic", price: 3000000 },
      { categoryId: 9, variantId: 903, name: "Noctua NH-D15", price: 3000000 }
    ],
    createdAt: "2025-01-10T08:45:00.000Z",
    updatedAt: "2025-01-12T16:30:00.000Z"
  }
];

const PCBuildsAdmin = () => {
  const [pcBuilds, setPcBuilds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [buildName, setBuildName] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [buildType, setBuildType] = useState("GAMING"); // Default value
  const [buildStatus, setBuildStatus] = useState("ACTIVE"); // Default value
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editMode, setEditMode] = useState(false);

  // Load mock data instead of fetching from API
  useEffect(() => {
    // Simulate API request delay
    const timer = setTimeout(() => {
      setPcBuilds(mockPCBuilds);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchPCBuilds = () => {
    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setPcBuilds(mockPCBuilds);
      setIsLoading(false);
    }, 500);
  };

  const handleCreateBuild = () => {
    setEditMode(false);
    setSelectedBuild(null);
    setBuildName("");
    setBuildDescription("");
    setBuildType("GAMING");
    setBuildStatus("ACTIVE");
    onOpen();
  };

  const handleEditBuild = (build) => {
    setEditMode(true);
    setSelectedBuild(build);
    setBuildName(build.name);
    setBuildDescription(build.description);
    setBuildType(build.type);
    setBuildStatus(build.status);
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
      // Simulate API delete request (no actual API call)
      setPcBuilds(pcBuilds.filter(build => build.id !== buildId));
      Swal.fire({
        icon: "success",
        title: "Đã xóa",
        text: "Cấu hình PC đã được xóa thành công.",
      });
    }
  };

  const handleToggleStatus = (buildId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    // Update status in the builds array
    setPcBuilds(pcBuilds.map(build => 
      build.id === buildId ? { ...build, status: newStatus } : build
    ));
    
    // Show success message
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
      id: editMode ? selectedBuild.id : `${Date.now()}`, // Generate a mock ID for new builds
      name: buildName,
      description: buildDescription,
      type: buildType,
      status: buildStatus,
      components: Object.entries(components).map(([categoryId, component]) => ({
        categoryId: categoryId,
        variantId: component.id || `${Date.now()}-${categoryId}`,
        name: component.nameVariants || "Component",
        price: component.price || 0,
        quantity: 1
      })),
      totalPrice: Object.values(components).reduce((sum, component) => sum + (component.price || 0), 0),
      createdAt: editMode ? selectedBuild.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editMode) {
      // Simulate update API call
      setPcBuilds(pcBuilds.map(build => 
        build.id === pcBuildData.id ? pcBuildData : build
      ));
      
      onClose();
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công",
        text: "Cấu hình PC đã được cập nhật.",
      });
    } else {
      // Simulate create API call
      setPcBuilds([...pcBuilds, pcBuildData]);
      
      onClose();
      Swal.fire({
        icon: "success",
        title: "Tạo mới thành công",
        text: "Cấu hình PC mới đã được tạo.",
      });
    }
  };

  // Format price to VND
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
  };

  // Filter PC builds based on search term
  const filteredBuilds = pcBuilds.filter(build => 
    build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    build.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Define columns for DataTable
  const columns = [
    {
      name: 'TÊN CẤU HÌNH',
      selector: row => row.name,
      sortable: true,
      grow: 2,
    },
    {
      name: 'LOẠI',
      selector: row => row.type,
      sortable: true,
      cell: row => (
        <Chip 
          color={row.type === "GAMING" ? "danger" : row.type === "OFFICE" ? "primary" : "secondary"}
          size="sm"
          variant="flat"
        >
          {row.type}
        </Chip>
      ),
    },
    {
      name: 'TRẠNG THÁI',
      selector: row => row.status,
      sortable: true,
      cell: row => (
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
      name: 'MÔ TẢ',
      selector: row => row.description,
      sortable: false,
      cell: row => (
        <div 
          className="truncate max-w-[200px]" 
          title={row.description?.replace(/<[^>]*>/g, '') || "Không có mô tả"}
          dangerouslySetInnerHTML={{ 
            __html: row.description || "Không có mô tả" 
          }}
        />
      ),
    },
    {
      name: 'GIÁ',
      selector: row => row.totalPrice,
      sortable: true,
      right: true,
      cell: row => <div>{formatPrice(row.totalPrice || 0)}</div>,
    },
    {
      name: 'SỐ LINH KIỆN',
      selector: row => row.components?.length || 0,
      sortable: true,
      center: true,
    },
    {
      name: 'NGÀY TẠO',
      selector: row => row.createdAt,
      sortable: true,
      cell: row => new Date(row.createdAt).toLocaleDateString("vi-VN"),
    },
    {
      name: 'THAO TÁC',
      cell: row => (
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
      width: '120px',
    },
  ];

  // Custom styles for DataTable
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        color: '#374151',
        fontWeight: 'bold',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '0.875rem',
      },
    },
    rows: {
      style: {
        fontSize: '0.875rem',
        '&:nth-child(odd)': {
          backgroundColor: '#f9fafb',
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: '#f3f4f6',
      },
    },
    pagination: {
      style: {
        border: 'none',
        backgroundColor: '#ffffff',
      },
      pageButtonsStyle: {
        borderRadius: '0',
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
              rowsPerPageText: 'Số dòng mỗi trang:',
              rangeSeparatorText: 'của',
            }}
            customStyles={customStyles}
            sortIcon={<FaSort />}
            selectableRows={false}
            highlightOnHover
          />
        </CardBody>
      </Card>

      {/* Modal for creating/editing PC builds */}
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
          <ModalHeader>
            {editMode ? "Chỉnh sửa cấu hình PC" : "Tạo cấu hình PC mới"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Tên cấu hình PC"
                placeholder="Nhập tên cấu hình PC"
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
                <option value="Available">Đang hoạt động</option>
                <option value="Unavailable">Hết hoạt động</option>
              </select>
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
                      'heading',
                      '|',
                      'bold', 'italic',
                      '|',
                      'link', 'bulletedList', 'numberedList',
                      '|',
                      'undo', 'redo'
                    ],
                    placeholder: "Nhập mô tả cho cấu hình PC",
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