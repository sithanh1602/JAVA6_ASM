import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import OrderSevice from "../../../../services/OrderSevice";
import { FaClipboardList, FaDollarSign, FaCheckCircle, FaShippingFast, FaBoxOpen, FaTimesCircle } from 'react-icons/fa';

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

const ProductList = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 5px;
    min-width: 600px;  // Increased minimum width
    max-width: 800px;  // Added maximum width
`;

const ProductItem = styled.li`
    display: flex;
    align-items: center;
    padding: 5px;
    border: 1px solid #ddd;
    margin-bottom: 5px;
    border-radius: 5px;
    background-color: #f9f9f9;
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

const AdminOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [pendingOrders, setPendingOrders] = useState([]); // Lưu danh sách đơn hàng chờ xác nhận

    const tabs = [
        { label: 'Tất cả', status: null },
        { label: 'Đã đặt hàng', status: 1 },
        { label: 'Chưa thanh toán', status: 2 },
        { label: 'Đã thanh toán', status: 3 },
        { label: 'Đã xác nhận', status: 4 },
        { label: 'Đang giao hàng', status: 5 },
        { label: 'Đã hoàn thành', status: 6 },
        { label: 'Đã hủy', status: 7 },
    ];

    const statusLabels = {
        1: 'Đã đặt hàng',
        2: 'Chưa thanh toán',
        3: 'Đã thanh toán',
        4: 'Đã xác nhận',
        5: 'Đang giao hàng',
        6: 'Đã hoàn thành',
        7: 'Đã hủy',
    };

    const statusColors = {
        1: '#ffc107', // Amber
        2: '#17a2b8', // Info
        3: '#28a745', // Success
        4: '#007bff', // Primary
        5: '#fd7e14', // Warning
        6: '#20c997', // Success (light green)
        7: '#dc3545', // Danger (Red)
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersData = await OrderSevice.getAllOrders();
                setOrders(ordersData);
                // Lọc các đơn hàng có trạng thái "Chờ xác nhận" (status: 2)
                const pendingOrdersList = ordersData.filter(order => order.status === 2);
                setPendingOrders(pendingOrdersList); // Lưu các đơn hàng chờ xác nhận

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

            // If the order status is successfully updated to 'Đã xác nhận' (status 4), change the tab
            if (newStatus === 4) {
                setActiveTab('Đã xác nhận');
            }

            Swal.fire({
                icon: 'success',
                title: 'Trạng thái đơn hàng đã được cập nhật',
                text: `Đơn hàng ${updatedOrder.id} đã được chuyển sang trạng thái "${statusLabels[newStatus]}".`,
            });

            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.',
            });
        }
    };

    const handlePendingOrdersClick = () => {
        // Khi nhấn vào nút "Đơn hàng chờ xác nhận", chuyển sang tab "Chưa thanh toán"
        setActiveTab('Đã thanh toán');
    };



    const filteredOrders = activeTab === 'Tất cả'
        ? orders
        : orders.filter(order => order.status === tabs.find(tab => tab.label === activeTab)?.status);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const columns = [
        { name: 'Mã hoá đơn', selector: row => row.id, sortable: true, center: true, width: '150px' },
        { name: 'Tên khách hàng', selector: row => row.userName, sortable: true, center: true, width: '200px' },
        {
            name: 'Sản phẩm đã mua',
            cell: row => (
                <ProductList>
                    {row.products && row.products.map((product, index) => (
                        <ProductItem key={index}>
                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover mr-2"/>
                            <span>{product.name} (x{product.quantity}) - {product.price.toLocaleString()} VND</span>
                        </ProductItem>
                    ))}
                </ProductList>
            ),
            sortable: false,
            center: true,
            minWidth: '300px',  // Ensure this column is wide enough
            maxWidth: '500px',  // Set maximum width to avoid it expanding too much
        },
        { name: 'Tổng tiền', selector: row => `${row.totalPrice.toLocaleString()} VND`, sortable: true, right: true, center: true, width: '220px' },
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
            name: 'Hành động',
            cell: row => (
                <div className="flex space-x-2 justify-center">
                    {row.status === 3 && (
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
                            Đã hoàn thành
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
            <p>Tên khách hàng: {data.userName}</p>
            <p>Tổng tiền: {data.totalPrice.toLocaleString()} VND</p>
            <p>Ngày đặt hàng: {new Date(data.orderDate).toLocaleDateString()}</p>
            <h3 className="text-lg font-bold mt-4">Sản phẩm đã mua:</h3>
            <ProductList>
                {data.products && data.products.map((product, index) => (
                    <ProductItem key={index} className="flex items-center">
                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover mr-2"/>
                        <span>{product.name} (x{product.quantity}) - {product.price.toLocaleString()} VND</span>
                    </ProductItem>
                ))}
            </ProductList>
            <h3 className="text-lg font-bold mt-4">Quá trình xử lý:</h3>
            <ProgressContainer>
                {tabs.filter(tab => tab.status !== null).map(tab => (
                    <ProgressStep key={tab.status}>
                        <ProgressIcon active={data.status >= tab.status}>
                            {tab.status === 1 && <FaClipboardList />}
                            {tab.status === 2 && <FaDollarSign />}
                            {tab.status === 3 && <FaDollarSign />}
                            {tab.status === 4 && <FaCheckCircle />}
                            {tab.status === 5 && <FaShippingFast />}
                            {tab.status === 6 && <FaBoxOpen />}
                            {tab.status === 7 && <FaTimesCircle />}
                        </ProgressIcon>
                        <ProgressLabel active={data.status >= tab.status}>{tab.label}</ProgressLabel>
                    </ProgressStep>
                ))}
            </ProgressContainer>
        </OrderDetails>
    );

    return (
        <div className="container mx-auto p-4 max-w-full">
            <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>
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


            {/* Nút "Đơn hàng chờ xác nhận" */}
            <PendingOrdersButton onClick={handlePendingOrdersClick}>
                Đơn hàng chờ xác nhận
                {pendingOrders.length > 0 && <PendingOrdersBadge>{pendingOrders.length}</PendingOrdersBadge>}
            </PendingOrdersButton>


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
