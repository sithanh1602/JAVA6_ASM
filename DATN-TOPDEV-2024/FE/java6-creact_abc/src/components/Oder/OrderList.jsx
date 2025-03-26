import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Tabs, Tab, Checkbox, Input } from "@nextui-org/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OrderService from "../../services/OrderSevice";
import { faClipboardCheck, faTruck, faBoxOpen, faCheckCircle, faHandshake, faExclamationCircle, faDollarSign, faCheckDouble, faTimesCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';
import ReviewComponent from '../../components/reviewsProductVariant/reviewsComponent';

const getStatusInfo = (status) => {
  const statusMap = {
    1: { text: 'Đã đặt hàng', icon: faClipboardCheck, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    2: { text: 'Chưa thanh toán', icon: faExclamationCircle, color: 'text-red-500', bgColor: 'bg-red-100' },
    3: { text: 'Đã thanh toán', icon: faDollarSign, color: 'text-green-500', bgColor: 'bg-green-100' },
    4: { text: 'Đã xác nhận', icon: faCheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    5: { text: 'Đang giao hàng', icon: faTruck, color: 'text-orange-500', bgColor: 'bg-orange-100' },
    6: { text: 'Đã giao hàng', icon: faBoxOpen, color: 'text-green-500', bgColor: 'bg-green-100' },
    7: { text: 'Đã nhận hàng', icon: faHandshake, color: 'text-purple-500', bgColor: 'bg-purple-100' },
    8: { text: 'Hoàn thành', icon: faCheckDouble, color: 'text-teal-500', bgColor: 'bg-teal-100' },
    9: { text: 'Đã hủy', icon: faTimesCircle, color: 'text-red-500', bgColor: 'bg-gray-100' }
  };
  return statusMap[status] || { text: 'Không xác định', icon: faQuestionCircle, color: 'text-gray-500', bgColor: 'bg-gray-100' };
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderProducts, setOrderProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    newest: true,
    paid: false,
    unpaid: false,
    complete: false,
    cancel: false,
  });

  const checkAndUpdateOrderStatus = async (order) => {
    if (order.status === 7) {
      const orderDate = new Date(order.orderDate).getTime();
      const currentTime = new Date().getTime();
      const diffInMs = currentTime - orderDate;
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

      if (diffInMs > oneWeekInMs) {
        try {
          await OrderService.updateOrderStatus(order.id, 8);
          console.log(`Đơn hàng ${order.orderNum} đã tự động chuyển sang trạng thái Hoàn thành`);
        } catch (err) {
          console.error(`Lỗi khi tự động cập nhật trạng thái đơn hàng ${order.orderNum}:`, err);
        }
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem("UserId");
      if (!userId) throw new Error("Không tìm thấy UserId trong localStorage");
      const ordersData = await OrderService.getOrdersByUserId(userId);

      for (const order of ordersData) {
        await checkAndUpdateOrderStatus(order);
      }

      const updatedOrdersData = await OrderService.getOrdersByUserId(userId);
      setOrders(updatedOrdersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cleanupUnpaidOrders = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/orders/cleanup-unpaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        await fetchOrders();
      } else {
        console.error('Lỗi khi xóa đơn hàng:', result.error);
      }
    } catch (err) {
      console.error('Không thể kết nối đến server:', err);
    }
  };

  useEffect(() => {
    cleanupUnpaidOrders();
    fetchOrders();
    const cleanupInterval = setInterval(() => {
      cleanupUnpaidOrders();
    }, 5 * 60 * 1000);
    return () => clearInterval(cleanupInterval);
  }, []);

  const openModal = async (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    try {
      const products = await OrderService.getProductsByOrderId(order.id);
      setOrderProducts(products);
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
      setOrderProducts([]);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setOrderProducts([]);
  };

  const getUserIdFromToken = () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.userId;
      } catch (err) {
        console.error("Token không hợp lệ:", err);
        return null;
      }
    }
    return null;
  };

  const handlePayment = async (orderId) => {
    const userId = getUserIdFromToken();
    const selectedOrder = orders.find(order => order.id === orderId);
    if (!selectedOrder) {
      alert("Không tìm thấy thông tin đơn hàng!");
      return;
    }
    if (!userId) {
      alert("Không thể xác định người dùng. Vui lòng đăng nhập lại!");
      return;
    }
    try {
      const response = await OrderService.placeOrderNosave(selectedOrder, userId, orderId);
      if (response) {
        window.location.href = response;
      } else {
        alert("Không nhận được URL thanh toán. Vui lòng thử lại.");
      }
    } catch (error) {
      alert("Thanh toán thất bại, vui lòng thử lại.");
      console.error("Lỗi khi thanh toán:", error.response?.data || error.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn hủy đơn hàng này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Hủy đơn hàng",
      cancelButtonText: "Quay lại",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: "Đang xử lý...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await OrderService.updateOrderStatushuy(orderId, 9);
        const userId = localStorage.getItem("UserId");
        const ordersData = await OrderService.getOrdersByUserId(userId);
        setOrders(ordersData);
        Swal.fire("Hủy thành công!", "Đơn hàng của bạn đã được hủy.", "success");
      } catch (err) {
        console.error("Lỗi hủy đơn hàng:", err);
        Swal.fire("Lỗi!", "Đã xảy ra lỗi khi hủy đơn hàng.", "error");
      }
    }
  };

  const handleConfirmReceived = async (orderId) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn đã nhận hàng?',
      text: "Hành động này sẽ xác nhận đơn hàng hoàn thành!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await OrderService.updateOrderStatus(orderId, 7); // Cập nhật thành "Đã nhận hàng"
        const userId = localStorage.getItem("UserId");
        const ordersData = await OrderService.getOrdersByUserId(userId);
        setOrders(ordersData);
        Swal.fire('Thành công!', 'Đơn hàng đã được xác nhận nhận hàng.', 'success');
      } catch (err) {
        console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
        Swal.fire('Lỗi!', 'Đã xảy ra lỗi khi xác nhận đơn hàng.', 'error');
      }
    }
  };

  const getTimeRemaining = (orderDate) => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const diffInMs = currentTime - orderTime;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const remainingMs = oneDayInMs - diffInMs;

    if (remainingMs <= 0) return "Đã hết hạn";
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const orderColumns = [
    {
      name: 'Mã Đơn Hàng',
      selector: row => row.orderNum,
      sortable: true,
      width: '150px',
      style: { fontSize: '14px' }
    },
    {
      name: 'Trạng Thái',
      cell: row => {
        const status = getStatusInfo(row.status);
        return (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${status.bgColor}`}>
              <FontAwesomeIcon icon={status.icon} className={`${status.color} text-sm`} />
              <span className={`${status.color} text-sm font-medium`}>{status.text}</span>
              {row.status === 2 && (
                  <span className="text-xs text-red-500">({getTimeRemaining(row.orderDate)})</span>
              )}
            </div>
        );
      },
      sortable: true,
      width: '300px'
    },
    {
      name: 'Tổng Tiền',
      selector: row => row.totalPrice,
      sortable: true,
      cell: row => <span className="text-red-500 text-sm font-medium">{row.totalPrice.toLocaleString()} VNĐ</span>,
      width: '150px'
    },
    {
      name: 'Ngày Đặt',
      selector: row => new Date(row.orderDate).toLocaleDateString('vi-VN'),
      sortable: true,
      width: '120px',
      style: { fontSize: '14px' }
    },
    {
      name: 'Địa chỉ',
      selector: row => row.fullAddress,
      sortable: true,
      width: '600px',
      style: { fontSize: '14px' }
    },
    {
      name: 'Hành Động',
      cell: row => (
          <div className="flex gap-2">
            {row.paymentStatus && (row.status === 1 || row.status === 2) && (
                <Button size="sm" color="success"  className="rounded-none" onClick={() => handlePayment(row.id)}>
                  Thanh toán
                </Button>
            )}
            {[1, 2, 3].includes(row.status) && (
                <Button size="sm" color="danger"  className="rounded-none" onClick={() => handleCancelOrder(row.id)}>
                  Hủy
                </Button>
            )}
            {row.status === 6 && (
                <Button size="sm" color="secondary"  className="rounded-none" onClick={() => handleConfirmReceived(row.id)}>
                  Đã nhận hàng
                </Button>
            )}
            {row.status === 8 && (
                <ReviewComponent
                    orderId={row.id}
                    orderProducts={async () => await OrderService.getProductsByOrderId(row.id)}
                    onReviewSubmitted={fetchOrders}
                />
            )}
            <Button size="sm" color="primary"  className="rounded-none" onClick={() => openModal(row)}>
              Chi tiết
            </Button>
          </div>
      ),
      width: 'auto',
      right: true
    }
  ];

  const productColumns = [
    { name: 'Ảnh', cell: row => <img src={row.imageUrl} alt={row.name} className="w-12 h-12 object-cover rounded-md" />, width: '80px' },
    { name: 'Tên Sản Phẩm', selector: row => row.name, sortable: true, style: { fontSize: '14px' } },
    { name: 'Số Lượng', selector: row => row.quantity, sortable: true, width: '100px', style: { fontSize: '14px' } },
    { name: 'Giá', selector: row => row.price, sortable: true, format: row => `${row.price.toLocaleString()} ₫`, width: '120px', style: { fontSize: '14px' } },
  ];

  const OrderProcessTimeline = ({ currentStatus }) => {
    const statuses = [
      { id: 1, icon: faClipboardCheck, text: 'Đã đặt hàng' },
      { id: 2, icon: faExclamationCircle, text: 'Chưa thanh toán' },
      { id: 3, icon: faDollarSign, text: 'Đã thanh toán' },
      { id: 4, icon: faCheckCircle, text: 'Đã xác nhận' },
      { id: 5, icon: faTruck, text: 'Đang giao hàng' },
      { id: 6, icon: faBoxOpen, text: 'Đã giao hàng' },
      { id: 7, icon: faHandshake, text: 'Đã nhận hàng' },
      { id: 8, icon: faCheckDouble, text: 'Hoàn thành' },
      { id: 9, icon: faTimesCircle, text: 'Đã hủy' }
    ];

    return (
        <div className="w-full py-6">
          <div className="flex justify-between relative">
            <div className="absolute top-4 left-0 w-full h-1 bg-gray-200">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(Math.max(0, statuses.findIndex(s => s.id === currentStatus)) / (statuses.length - 1)) * 100}%` }} />
            </div>
            {statuses.map((status) => (
                <div key={status.id} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStatus >= status.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <FontAwesomeIcon icon={status.icon} className="text-sm" />
                  </div>
                  <span className={`text-xs text-center w-20 ${currentStatus >= status.id ? 'text-blue-500' : 'text-gray-400'}`}>{status.text}</span>
                </div>
            ))}
          </div>
        </div>
    );
  };

  const filterOrders = (orderList) => {
    let filteredOrders = [...orderList];

    if (searchTerm) {
      filteredOrders = filteredOrders.filter(order =>
          order.orderNum.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.newest) {
      filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }
    if (filters.paid) {
      filteredOrders = filteredOrders.filter(order => order.status >= 3 && order.status !== 9);
    }
    if (filters.unpaid) {
      filteredOrders = filteredOrders.filter(order =>
          (order.paymentStatus && (order.status === 1 || order.status === 2)) || order.status < 3
      );
    }
    if (filters.complete) {
      filteredOrders = filteredOrders.filter(order => order.status >= 8);
    }
    if (filters.cancel) {
      filteredOrders = filteredOrders.filter(order => order.status >= 9);
    }

    return filteredOrders;
  };

  const onlineOrders = filterOrders(orders.filter(order => order.paymentStatus));
  const codOrders = filterOrders(orders.filter(order => !order.paymentStatus));

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const customStyles = {
    table: {
      style: {
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f3f4f6',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    rows: {
      style: {
        minHeight: '50px',
        fontSize: '14px',
        color: '#4b5563',
        borderBottom: '1px solid #e5e7eb',
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
      },
    },
    cells: {
      style: {
        padding: '8px 12px',
      },
    },
    noData: {
      style: {
        padding: '20px',
        fontSize: '14px',
        color: '#6b7280',
      },
    },
  };

  return (
      <div className="p-6 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Danh Sách Đơn Hàng</h2>
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <Tabs aria-label="Order Tabs" variant="bordered" color="primary" className="mb-6 rounded-none">
          <Tab key="online" title="Thanh Toán Online">
            <div className="mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <Input
                  placeholder="Tìm kiếm mã đơn hàng"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs w-full md:w-auto"
                  size="sm"
              />
              <div className="flex gap-4">
                <Checkbox size="sm" isSelected={filters.newest} onChange={() => handleFilterChange('newest')}>
                  Mới nhất
                </Checkbox>
                <Checkbox size="sm" isSelected={filters.paid} onChange={() => handleFilterChange('paid')}>
                  Đã thanh toán
                </Checkbox>
                <Checkbox size="sm" isSelected={filters.unpaid} onChange={() => handleFilterChange('unpaid')}>
                  Chưa thanh toán
                </Checkbox>
                <Checkbox size="sm" isSelected={filters.complete} onChange={() => handleFilterChange('complete')}>
                  Đơn đã hoàn thành
                </Checkbox>
                <Checkbox size="sm" isSelected={filters.cancel} onChange={() => handleFilterChange('cancel')}>
                  Đơn đã huỷ
                </Checkbox>
              </div>
            </div>
            <DataTable
                columns={orderColumns}
                data={onlineOrders}
                progressPending={loading}
                customStyles={customStyles}
                noDataComponent="Không có đơn hàng thanh toán online nào."
                responsive
                persistTableHead
            />
          </Tab>
          <Tab key="cod" title="Thanh Toán COD">
            <div className="mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <Input
                  placeholder="Tìm kiếm mã đơn hàng"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs w-full md:w-auto"
                  size="sm"
              />
              <div className="flex gap-4">
                <Checkbox size="sm" isSelected={filters.newest} onChange={() => handleFilterChange('newest')}>
                  Mới nhất
                </Checkbox>
                <Checkbox size="sm" isSelected={filters.complete} onChange={() => handleFilterChange('complete')}>
                  Đơn đã hoàn thành
                </Checkbox>
                <Checkbox size="sm" isSelected={filters.cancel} onChange={() => handleFilterChange('cancel')}>
                  Đơn đã huỷ
                </Checkbox>
              </div>
            </div>
            <DataTable
                columns={orderColumns}
                data={codOrders}
                progressPending={loading}
                customStyles={customStyles}
                noDataComponent="Không có đơn hàng COD nào."
                responsive
                persistTableHead
            />
          </Tab>
        </Tabs>
        <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="4xl" className="max-h-[90vh] overflow-y-auto">
          <ModalContent className="rounded-none">
            <ModalHeader className="text-lg font-bold">Chi Tiết Đơn Hàng</ModalHeader>
            <ModalBody>
              {selectedOrder && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="mb-2 text-sm"><strong>Mã Đơn Hàng:</strong> {selectedOrder.orderNum}</p>
                        <p className="mb-2 text-sm"><strong>Trạng Thái:</strong> <span className={getStatusInfo(selectedOrder.status).color}>{getStatusInfo(selectedOrder.status).text}</span></p>
                        <p className="mb-2 text-sm"><strong>Tổng Tiền:</strong> <span className="text-red-500 font-medium">{selectedOrder.totalPrice.toLocaleString()} ₫</span></p>
                        <p className="mb-2 text-sm"><strong>Phí vận chuyển:</strong> <span className="text-orange-500 font-medium">{selectedOrder.shipping_fee ? selectedOrder.shipping_fee.toLocaleString() : '0'} ₫</span></p>
                      </div>
                      <div>
                        <p className="mb-2 text-sm"><strong>Ngày Đặt:</strong> {new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN')}</p>
                        <p className="mb-2 text-sm"><strong>Địa Chỉ:</strong> {selectedOrder.fullAddress}</p>
                        <p className="mb-2 text-sm"><strong>Thanh Toán:</strong> <span className={selectedOrder.paymentStatus ? 'text-green-500' : 'text-red-500'}>{selectedOrder.paymentStatus ? 'Online' : 'COD'}</span></p>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h3 className="font-bold text-sm mb-2">Tiến Độ Đơn Hàng</h3>
                      <OrderProcessTimeline currentStatus={selectedOrder.status} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-2">Sản Phẩm</h3>
                      <DataTable
                          columns={productColumns}
                          data={orderProducts}
                          noDataComponent="Không có sản phẩm nào."
                          customStyles={customStyles}
                          responsive
                      />
                    </div>
                    <div className="p-2 ">
                      {selectedOrder.status === 8 && (
                          <ReviewComponent
                              orderId={selectedOrder.id}
                              orderProducts={orderProducts}
                              onReviewSubmitted={fetchOrders}
                          />
                      )}
                    </div>
                  </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" size="sm"  className="rounded-none" onClick={closeModal}>Đóng</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
  );
};

export default OrderList;