import React, { useEffect, useState } from 'react';
import { getAllCartItemsForUser, removeProductFromCart } from '../services/CartService';
import Breadcrumb from '../components/cart/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import 'aos/dist/aos.css';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [selectAll, setSelectAll] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUserId = JSON.parse(localStorage.getItem('UserId'));
        if (!storedUserId) {
            setError('Không tìm thấy userId trong localStorage.');
            setLoading(false);
            return;
        }
        setUserId(storedUserId);

        const fetchCartItems = async () => {
            try {
                const items = await getAllCartItemsForUser(storedUserId);
                if (items.length === 0) {
                    toast.error('Giỏ hàng của bạn hiện tại trống.');
                } else {
                    const initialSelectedState = {};
                    items.forEach(item => {
                        // Sử dụng buildId hoặc product_variant_id làm key tùy thuộc vào loại mục
                        const key = item.buildPC ? item.buildPC.buildId : item.product_variant_id;
                        initialSelectedState[key] = false;
                    });
                    setSelectedItems(initialSelectedState);
                    setCartItems(items.map(item => ({
                        ...item,
                        quantity: item.quantity || 1,
                        // Xác định loại mục (product hoặc buildPC)
                        type: item.buildPC ? 'buildPC' : 'product'
                    })));
                }
            } catch (err) {
                toast.error('Không thể tải giỏ hàng.');
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    }, [cartItems, selectedItems]);

    const handleDeleteItemFromCart = async (item) => {
        try {
            // Xóa dựa trên buildId hoặc product_variant_id
            const idToRemove = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
            await removeProductFromCart(userId, item.type === 'buildPC' ? null : idToRemove, item.type === 'buildPC' ? idToRemove : null);
            setCartItems(cartItems.filter(cartItem => 
                cartItem.type === 'buildPC' 
                    ? cartItem.buildPC.buildId !== idToRemove 
                    : cartItem.product_variant_id !== idToRemove
            ));
            const newSelectedItems = { ...selectedItems };
            delete newSelectedItems[idToRemove];
            setSelectedItems(newSelectedItems);

            Swal.fire({
                icon: 'success',
                title: 'Xóa thành công!',
                text: 'Sản phẩm đã được xóa khỏi giỏ hàng.',
                confirmButtonText: 'OK!'
            });

            setTimeout(() => {
                Swal.close();
            }, 1000);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
        }
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            const key = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
            if (selectedItems[key]) {
                const price = item.type === 'buildPC' ? item.buildPC.totalPrice : item.productPrice;
                return total + (price * item.quantity);
            }
            return total;
        }, 0);
    };

    const handleUpdateQuantity = (key, newQuantity) => {
        const updatedCartItems = cartItems.map(item => {
            const itemKey = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
            return itemKey === key ? { ...item, quantity: newQuantity } : item;
        });
        setCartItems(updatedCartItems);
    };

    const handleSelectChange = (key, isSelected) => {
        const updatedSelectedItems = {
            ...selectedItems,
            [key]: isSelected
        };
        setSelectedItems(updatedSelectedItems);

        const allSelected = cartItems.every(item => {
            const itemKey = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
            return updatedSelectedItems[itemKey];
        });
        setSelectAll(allSelected);
    };

    const handleSelectAllChange = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        const updatedSelectedItems = {};
        cartItems.forEach(item => {
            const key = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
            updatedSelectedItems[key] = newSelectAll;
        });
        setSelectedItems(updatedSelectedItems);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value).replace(/\s?₫/g, ' VND');
    };

const handleProceedToCheckout = () => {
    const selectedCartItems = cartItems.filter(item => {
        const key = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
        return selectedItems[key];
    });

    if (selectedCartItems.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Chưa chọn sản phẩm',
            text: 'Vui lòng chọn ít nhất một sản phẩm để tiến hành thanh toán.',
            confirmButtonText: 'OK'
        });
        return;
    }

    const checkoutItems = selectedCartItems.flatMap(item => {
        if (item.type === 'buildPC' && item.buildPC && item.buildPC.buildPCProductVariants) {
            return item.buildPC.buildPCProductVariants.map(variant => ({
                productVariantId: variant.productVariantId,
                quantity: variant.variantQuantity * item.quantity,
                productName: variant.nameVariants,
                productPrice: variant.price,
                productImageUrl: variant.image,
                productStatus: variant.status,
                buildId: item.buildPC.buildId,
                buildName: item.buildPC.buildName,
                nameVariants: variant.nameVariants, 
            }));
        } else {
            return [{
                productVariantId: item.product_variant_id,
                quantity: item.quantity,
                productName: item.productName,
                productPrice: item.productPrice,
                productImageUrl: item.productImageUrl,
                productStatus: item.productStatus,
                buildId: null,
                buildName: null,
                nameVariants: item.nameVariants || null,
            }];
        }
    });

    console.log("📤 Dữ liệu truyền sang GroupOrder:", JSON.stringify(checkoutItems, null, 2));
    navigate('/orders', { state: { cartItems: checkoutItems } });
};

    return (
        <div className="flex justify-center pb-20">
            <div className="container mt-4 max-w-5xl">
                <Breadcrumb />
                <div className="border p-4 mb-4">
                    {loading ? (
                        <div className="text-center py-8">Đang tải...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">Không thể tải giỏ hàng</div>
                    ) : cartItems.length > 0 ? (
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="border-b">
                                <th className="py-2 px-4 text-left w-16">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAllChange}
                                            className="w-5 h-5 mr-2"
                                        />
                                        Chọn
                                    </div>
                                </th>
                                <th className="py-2 px-4 text-left">SẢN PHẨM</th>
                                <th className="py-2 px-4 text-left w-40">GIÁ</th>
                                <th className="py-2 px-4 text-left w-32">SỐ LƯỢNG</th>
                                <th className="py-2 px-4 text-left w-32">TẠM TÍNH</th>
                                <th className="py-2 px-4 text-left w-16"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {cartItems.map(item => {
                                const key = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
                                return (
                                    <tr key={key} className="border-b">
                                        <td className="py-4 px-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems[key] || false}
                                                onChange={() => handleSelectChange(key, !selectedItems[key])}
                                                className="w-5 h-5"
                                            />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={item.type === 'buildPC' ? item.buildPC.image : item.productImageUrl || 'https://placehold.co/50x50'}
                                                    alt={item.type === 'buildPC' ? item.buildPC.buildName : item.productName}
                                                    className="w-12 h-12 mr-4 object-cover"
                                                />
                                                <div>
                                                    <span>{item.type === 'buildPC' ? item.buildPC.buildName : item.productName}</span>
                                                    {item.type === 'buildPC' && (
                                                        <div className="text-sm text-gray-600">
                                                            <p>Mục đích: {item.buildPC.usagePurpose}</p>
                                                            <p>Số linh kiện: {item.buildPC.totalProducts}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {formatCurrency(item.type === 'buildPC' ? item.buildPC.totalPrice : item.productPrice || 0)}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center border rounded-md overflow-hidden shadow-sm">
                                                <button
                                                    className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg font-medium"
                                                    onClick={() => handleUpdateQuantity(key, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="text"
                                                    className="w-12 h-8 text-center border-none focus:outline-none"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateQuantity(key, Number(e.target.value) || 1)}
                                                />
                                                <button
                                                    className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg font-medium"
                                                    onClick={() => handleUpdateQuantity(key, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {formatCurrency((item.type === 'buildPC' ? item.buildPC.totalPrice : item.productPrice || 0) * item.quantity)}
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => handleDeleteItemFromCart(item)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan="6" className="text-right py-4 px-4">
                                    <p className="font-bold">Tổng tiền: {formatCurrency(calculateTotalPrice())}</p>
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <div className="flex justify-center items-center h-48 bg-gray-100 rounded-lg shadow-lg">
                            <p className="text-xl font-semibold text-gray-600">Giỏ hàng của bạn trống</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end mt-4">
                    <Link to="/products">
                        <button className="bg-gray-300 px-4 py-2 ml-3 mr-2">
                            Tiếp tục mua hàng
                        </button>
                    </Link>
                    <button
                        onClick={handleProceedToCheckout}
                        className="bg-blue-500 text-white px-6 py-2"
                    >
                        TIẾN HÀNH THANH TOÁN
                    </button>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
};

export default CartPage;