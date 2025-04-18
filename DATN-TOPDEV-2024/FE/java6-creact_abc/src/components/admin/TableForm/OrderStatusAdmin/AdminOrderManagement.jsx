import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import OrderSevice from "../../../../services/OrderSevice";
import { FaClipboardList, FaDollarSign, FaCheckCircle, FaShippingFast, FaBoxOpen, FaTimesCircle } from 'react-icons/fa';
import axios from "axios";


const Tab = styled.button`
    padding: 10px 20px;
    margin: 0 5px;
    border: none;
    border-bottom: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
    background: none;
    cursor: pointer;
    font-size: 16px;
    color: ${props => props.active ? '#007bff' : '#333'};

    &:focus {
        outline: none;
    }
`;

const TabContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
`;

const StatusButton = styled.button`
    padding: 5px 10px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: default;
    background-color: ${props => props.color};
`;

// Replace the grid-based ProductList with a table
const ProductTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    min-width: 600px;
`;

const TableHeader = styled.th`
    padding: 10px;
    text-align: left;
    border-bottom: 2px solid #ddd;
    background-color: #f5f5f5;
    font-weight: bold;
`;

const TableCell = styled.td`
    padding: 10px;
    border-bottom: 1px solid #ddd;
    vertical-align: middle;
`;

const ProductImage = styled.img`
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
`;

const OrderDetails = styled.div`
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
`;

const ProgressContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
`;

const ProgressStep = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
`;

const ProgressIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${props => props.active ? '#007bff' : '#ccc'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    margin-bottom: 5px;
`;

const ProgressLabel = styled.div`
    font-size: 12px;
    text-align: center;
    color: ${props => props.active ? '#007bff' : '#333'};
`;

const PendingOrdersButton = styled.button`
    background-color: #007bff;
    color: white;
    font-size: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    position: relative;
    display: inline-flex;
    align-items: center;

    &:hover {
        background-color: #0056b3;
    }
`;

const PendingOrdersBadge = styled.div`
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: red;
    color: white;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 50%;
`;

const PaymentStatusBadge = styled.span`
    padding: 5px 10px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    border-radius: 5px;
    background-color: ${props => props.paid ? '#28a745' : '#dc3545'};
`;

const PaymentMethodTabContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 5px;
`;

const PaymentMethodTab = styled.button`
    padding: 12px 30px;
    margin: 5px;
    border: none;
    border-radius: 5px;
    background-color: ${props => props.active ? '#007bff' : 'transparent'};
    color: ${props => props.active ? 'white' : '#333'};
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s ease;

    &:hover {
        background-color: ${props => props.active ? '#007bff' : '#e0e0e0'};
    }

    &:focus {
        outline: none;
    }
`;

const AdminOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [activePaymentMethodTab, setActivePaymentMethodTab] = useState('Tất cả');
    const [pendingOrders, setPendingOrders] = useState([]); // Lưu danh sách đơn hàng chờ xác nhận

    const tabs = [
        { label: 'Đã đặt hàng', status: 1 },
        { label: 'Chưa thanh toán', status: 2 },
        { label: 'Đã thanh toán', status: 3 },
        { label: 'Đã xác nhận', status: 4 },
        { label: 'Đang giao hàng', status: 5 },
        { label: 'Đã giao hàng', status: 6 },
        { label: 'Đã nhận hàng', status: 7 },
        { label: 'Hoàn thành', status: 8 },
        { label: 'Đã hủy', status: 9 },
    ];

    const paymentMethodTabs = [
        { label: 'Tất cả', value: null },
        { label: 'COD', value: false },
        { label: 'Online', value: true }
    ];

    const statusLabels = {
        1: 'Đã đặt hàng',
        2: 'Chưa thanh toán',
        3: 'Đã thanh toán',
        4: 'Đã xác nhận',
        5: 'Đang giao hàng',
        6: 'Đã giao hàng',
        7: 'Đã nhận hàng',
        8: 'Hoàn thành',
        9: 'Đã hủy',
    };

    const statusColors = {
        1: '#ffc107', // Amber
        2: '#17a2b8', // Info
        3: '#28a745', // Success
        4: '#007bff', // Primary
        5: '#fd7e14', // Warning
        6: '#20c997', // Success (light green)
        7: '#dc3545', // Danger (Red)
        8: '#28a745', // Success
        9: '#6c757d', // Secondary (Gray)
    };

    const OrderInfoSection = styled.div`
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e0e0e0;
    `;

    const OrderInfoGroup = styled.div`
        background-color: #f5f7f9;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    `;

    const OrderInfoTitle = styled.h4`
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 8px;
    `;

    const OrderInfoItem = styled.div`
        display: flex;
        margin-bottom: 8px;
        align-items: center;
    `;

    const OrderInfoLabel = styled.span`
        font-weight: 500;
        color: #555;
        width: 40%;
        flex-shrink: 0;
    `;

    const OrderInfoValue = styled.span`
        color: #333;
        font-weight: ${props => props.highlight ? '600' : 'normal'};
        color: ${props => props.highlight ? '#d32f2f' : '#333'};
    `;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersData = await OrderSevice.getAllOrders();
                setOrders(ordersData);
                // Lọc các đơn hàng có trạng thái "Chờ xác nhận" (status: 2)
                const pendingOrdersList = ordersData.filter(order => order.status === 2);
                setPendingOrders(pendingOrdersList); // Lưu các đơn hàng chờ xác nhận
                console.log(ordersData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleChangeStatus = async (orderId, newStatus) => {
        try {
            const updatedOrder = await OrderSevice.updateOrderStatus(orderId, newStatus);

            // Nếu trạng thái là 'Đã xác nhận' (status 4), chuyển tab
            if (newStatus === 4) {
                setActiveTab('Đã xác nhận');
            } else if (newStatus === 5) {
                setActiveTab('Đang giao hàng');
            } else if (newStatus === 6) {
                setActiveTab('Đã giao hàng');
            } else if (newStatus === 7) {
                setActiveTab('Đã nhận hàng');
            }

            // Thông báo thành công
            await Swal.fire({
                icon: 'success',
                title: 'Trạng thái đơn hàng đã được cập nhật',
                text: `Đơn hàng ${orderId} đã chuyển sang trạng thái "${statusLabels[newStatus]}".`,
            });

            // Cập nhật lại danh sách đơn hàng
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.',
            });
        }
    };

    // Lọc đơn hàng theo tab trạng thái và tab phương thức thanh toán
    const filteredOrders = orders.filter(order => {
        // Lọc theo tab trạng thái
        const statusMatch = activeTab === 'Tất cả'
            ? true
            : order.status === tabs.find(tab => tab.label === activeTab)?.status;

        // Lọc theo tab phương thức thanh toán
        const paymentMethodMatch = activePaymentMethodTab === 'Tất cả'
            ? true
            : order.paymentStatus === paymentMethodTabs.find(tab => tab.label === activePaymentMethodTab)?.value;

        return statusMatch && paymentMethodMatch;
    });

    // UPDATED: handleRefund method now uses MomoService
    const handleRefund = async (order) => {
        const confirm = window.confirm("Xác nhận hoàn tiền cho đơn hàng?");
        if (!confirm) return;

        try {
            // Use MomoService instead of direct axios call
            const response = await OrderSevice.refundMomoPayment(
                order.id,
                order.transId,
                order.totalPrice,
                "Huỷ đơn hàng"
            );

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Hoàn tiền thành công!',
                text: `Đơn hàng ${order.orderNum} đã được hoàn tiền.`
            });

        } catch (err) {
            console.error(err);

            // Show error message
            Swal.fire({
                icon: 'error',
                title: 'Lỗi hoàn tiền',
                text: err.message || 'Có lỗi xảy ra khi hoàn tiền.'
            });
        }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const columns = [
        { name: 'Mã hoá đơn', selector: row => row.orderNum, sortable: true, center: true, width: '150px' },
        { name: 'Tên khách hàng', selector: row => row.userName, sortable: true, center: true, width: '200px' },
        {
            name: 'Tổng tiền',
            selector: row => `${row.totalPrice.toLocaleString()} VND`,
            sortable: true,
            right: true,
            center: true,
            width: '220px',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                color: 'red',
                fontSize: '14px',
            }
        },
        { name: 'Ngày đặt hàng', selector: row => new Date(row.orderDate).toLocaleDateString(), sortable: true, center: true, width: '200px' },
        {
            name: 'Trạng thái',
            selector: row => (
                <StatusButton color={statusColors[row.status]}>
                    {statusLabels[row.status] || 'Chưa xác định'}
                </StatusButton>
            ),
            sortable: true,
            center: true,
            width: '150px'
        },
        {
            name: 'Trạng thái thanh toán',
            selector: row => (
                <PaymentStatusBadge paid={row.paymentStatus}>
                    {row.paymentStatus ? 'Online' : 'COD'}
                </PaymentStatusBadge>
            ),
            sortable: true,
            center: true,
            width: '150px'
        },
        {
            name: 'Hành động',
            cell: row => (
                <div className="flex space-x-2 justify-center">
                    {/* Hiển thị nút xác nhận đơn hàng cho cả đơn hàng đã đặt hàng và đã thanh toán */}
                    {(row.status === 1 || row.status === 3) && (
                        <button
                            onClick={() => handleChangeStatus(row.id, 4)}
                            className="btn btn-primary px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Xác nhận đơn hàng
                        </button>
                    )}
                    {row.status === 4 && activeTab === 'Đã xác nhận' && (
                        <button
                            onClick={() => handleChangeStatus(row.id, 5)}
                            className="btn btn-warning px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                            Đang giao hàng
                        </button>
                    )}
                    {row.status === 5 && activeTab === 'Đang giao hàng' && (
                        <button
                            onClick={() => handleChangeStatus(row.id, 6)}
                            className="btn btn-success px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Đã giao hàng
                        </button>
                    )}
                    {row.status === 6 && activeTab === 'Đã giao hàng' && (
                        <button
                            onClick={() => handleChangeStatus(row.id, 7)}
                            className="btn btn-success px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Đã nhận hàng
                        </button>
                    )}
                    {row.status === 9 && row.paymentStatus && (
                        <button
                            className="btn btn-success px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            onClick={() => handleRefund(row)}
                        >
                            Hoàn tiền
                        </button>
                    )}

                </div>
            ),
            center: true,
            width: '200px'
        }
    ];

    const ExpandedComponent = ({ data }) => (
        <OrderDetails>
            <OrderInfoSection>
                <OrderInfoGroup>
                    <OrderInfoTitle>Thông tin đơn hàng</OrderInfoTitle>
                    <OrderInfoItem>
                        <OrderInfoLabel>Mã đơn hàng:</OrderInfoLabel>
                        <OrderInfoValue>{data.orderNum}</OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                        <OrderInfoLabel>Ngày đặt hàng:</OrderInfoLabel>
                        <OrderInfoValue>{new Date(data.orderDate).toLocaleDateString()}</OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                        <OrderInfoLabel>Tên khách hàng:</OrderInfoLabel>
                        <OrderInfoValue>{data.userName}</OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                        <OrderInfoLabel>Số điện thoại:</OrderInfoLabel>
                        <OrderInfoValue>{data.phone}</OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                        <OrderInfoLabel>Địa chỉ giao hàng:</OrderInfoLabel>
                        <OrderInfoValue>{data.fullAddress}</OrderInfoValue>
                    </OrderInfoItem>
                </OrderInfoGroup>

                <OrderInfoGroup>
                    <OrderInfoTitle>Thông tin thanh toán</OrderInfoTitle>
                    <OrderInfoItem>
                        <OrderInfoLabel>Phương thức:</OrderInfoLabel>
                        <OrderInfoValue>
                            <PaymentStatusBadge paid={data.paymentStatus} style={{ fontSize: '11px', padding: '3px 8px' }}>
                                {data.paymentStatus ? 'Online' : 'COD'}
                            </PaymentStatusBadge>
                        </OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                        <OrderInfoLabel>Phí vận chuyển:</OrderInfoLabel>
                        <OrderInfoValue>{data.shoping_Fee ? data.shoping_Fee.toLocaleString() : '0'} VNĐ</OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                        <OrderInfoLabel>Giảm giá:</OrderInfoLabel>
                        <OrderInfoValue>{data.voucher ? data.voucher.toLocaleString() : '0'} VNĐ</OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                        <OrderInfoLabel>Tổng tiền:</OrderInfoLabel>
                        <OrderInfoValue highlight>{data.totalPrice.toLocaleString()} VNĐ</OrderInfoValue>
                    </OrderInfoItem>
                </OrderInfoGroup>
            </OrderInfoSection>
            {/* Replace the ProductList grid with a table */}
            <ProductTable>
                <thead>
                <tr>
                    <TableHeader>Hình ảnh</TableHeader>
                    <TableHeader>Tên sản phẩm</TableHeader>
                    <TableHeader>Số lượng</TableHeader>
                    <TableHeader>Giá</TableHeader>
                </tr>
                </thead>
                <tbody>
                {data.products && data.products.map((product, index) => (
                    <tr key={index}>
                        <TableCell>
                            <ProductImage src={product.imageUrl} alt={product.name} />
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{product.price.toLocaleString()} VNĐ</TableCell>
                    </tr>
                ))}
                </tbody>
            </ProductTable>
            <h3 className="text-lg font-bold mt-4">Quá trình xử lý:</h3>
            <ProgressContainer>
                {tabs.filter(tab => tab.status !== null).map(tab => (
                    <ProgressStep key={tab.status}>
                        <ProgressIcon active={data.status >= tab.status}>
                            {tab.status === 1 && <FaClipboardList/>}
                            {tab.status === 2 && <FaDollarSign/>}
                            {tab.status === 3 && <FaDollarSign/>}
                            {tab.status === 4 && <FaCheckCircle/>}
                            {tab.status === 5 && <FaShippingFast/>}
                            {tab.status === 6 && <FaBoxOpen/>}
                            {tab.status === 7 && <FaTimesCircle/>}
                        </ProgressIcon>
                        <ProgressLabel active={data.status >= tab.status}>{tab.label}</ProgressLabel>
                    </ProgressStep>
                ))}
            </ProgressContainer>
        </OrderDetails>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

            {/* Thêm tab phương thức thanh toán */}
            <PaymentMethodTabContainer>
                {paymentMethodTabs.map(tab => (
                    <PaymentMethodTab
                        key={tab.label}
                        active={activePaymentMethodTab === tab.label}
                        onClick={() => setActivePaymentMethodTab(tab.label)}
                    >
                        {tab.label}
                    </PaymentMethodTab>
                ))}
            </PaymentMethodTabContainer>

            {/* Tab trạng thái đơn hàng */}
            <TabContainer>
                {tabs.map(tab => (
                    <Tab
                        key={tab.label}
                        active={activeTab === tab.label}
                        onClick={() => setActiveTab(tab.label)}
                    >
                        {tab.label}
                    </Tab>
                ))}
            </TabContainer>

            <DataTable
                columns={columns}
                data={filteredOrders}
                expandableRows
                expandableRowsComponent={ExpandedComponent}
                pagination
                paginationPerPage={10}
                paginationComponentOptions={{ rowsPerPageText: 'Số dòng mỗi trang' }}
                highlightOnHover
                pointerOnHover
                className="shadow-lg rounded-lg"
            />
        </div>
    );
};

export default AdminOrderManagement;