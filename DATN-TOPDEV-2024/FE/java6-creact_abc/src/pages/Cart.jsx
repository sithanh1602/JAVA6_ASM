import React, { useEffect, useState } from 'react';
import { getAllCartItemsForUser, removeProductFromCart } from '../services/CartService';
import Breadcrumb from '../components/cart/Breadcrumb';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import 'aos/dist/aos.css';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';
import {blue} from "@mui/material/colors";

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
            // Redirect to login page instead of showing error
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để xem giỏ hàng của bạn.',
                confirmButtonText: 'Đăng nhập ngay',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
            setLoading(false);
            return;
        }
        setUserId(storedUserId);

        const fetchCartItems = async () => {
            try {
                const items = await getAllCartItemsForUser(storedUserId);
                if (items.length > 0) {
                    const initialSelectedState = {};
                    // Fetch stock for products (not buildPC items)
                    const updatedItems = await Promise.all(
                        items.map(async (item) => {
                            let productQuantity = null;
                            if (!item.buildPC && item.product_variant_id) {
                                try {
                                    const response = await axios.get(
                                        `http://localhost:8080/api/products/variants/${item.product_variant_id}`
                                    );
                                    productQuantity = Number(response.data.quantity) || 0;
                                } catch (error) {
                                    productQuantity = 0;
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Lỗi tải kho',
                                        text: `Không thể tải thông tin kho cho sản phẩm ${item.productName}. Sản phẩm được coi là hết hàng.`,
                                        confirmButtonText: 'Đóng',
                                    });
                                }
                            }
                            const key = item.buildPC ? item.buildPC.buildId : item.product_variant_id;
                            initialSelectedState[key] = false;
                            return {
                                ...item,
                                quantity: Math.max(1, Math.min(Number(item.quantity) || 1, productQuantity || Infinity)),
                                type: item.buildPC ? 'buildPC' : 'product',
                                productQuantity, // null for buildPC
                            };
                        })
                    );
                    setSelectedItems(initialSelectedState);
                    setCartItems(updatedItems);
                } else {
                    // Just set empty cart items without showing toast error
                    setCartItems([]);
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải giỏ hàng. Vui lòng thử lại sau.',
                    confirmButtonText: 'Đóng',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    }, [cartItems, selectedItems]);

    const handleDeleteItemFromCart = async (item) => {
        try {
            const idToRemove = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
            await removeProductFromCart(
                userId,
                item.type === 'buildPC' ? null : idToRemove,
                item.type === 'buildPC' ? idToRemove : null
            );
            setCartItems(
                cartItems.filter((cartItem) =>
                    cartItem.type === 'buildPC'
                        ? cartItem.buildPC.buildId !== idToRemove
                        : cartItem.product_variant_id !== idToRemove
                )
            );
            const newSelectedItems = { ...selectedItems };
            delete newSelectedItems[idToRemove];
            setSelectedItems(newSelectedItems);

            Swal.fire({
                icon: 'success',
                title: 'Xóa thành công!',
                text: 'Sản phẩm đã được xóa khỏi giỏ hàng.',
                confirmButtonText: 'OK!',
                timer: 1500,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể xóa sản phẩm. Vui lòng thử lại.',
                confirmButtonText: 'Đóng',
            });
        }
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            const key = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
            if (selectedItems[key]) {
                const price = item.type === 'buildPC'
                    ? item.buildPC.totalPrice
                    : (item.productDiscountPrice && item.productDiscountPrice > 0
                        ? item.productDiscountPrice
                        : item.productPrice || 0);
                return total + price * item.quantity;
            }
            return total;
        }, 0);
    };

    const handleUpdateQuantity = (key, newQuantity, itemName = 'sản phẩm') => {
        console.log(`handleUpdateQuantity: key=${key}, newQuantity=${newQuantity}, itemName=${itemName}`);
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                const itemKey = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
                if (itemKey !== key) return item;

                // Validate quantity
                const validatedQuantity = Math.floor(Number(newQuantity) || 1);
                console.log(`Validated quantity: ${validatedQuantity}`);

                // For buildPC: allow any positive quantity
                if (item.type === 'buildPC') {
                    if (validatedQuantity < 1) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Số lượng không hợp lệ',
                            text: 'Số lượng tối thiểu là 1.',
                            confirmButtonText: 'Đóng',
                        }).then(r => item);
                        return { ...item, quantity: 1 };
                    }
                    return { ...item, quantity: validatedQuantity };
                }

                // For products: check stock
                if (item.productQuantity === null) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Đang tải kho',
                        text: 'Thông tin kho chưa tải xong. Vui lòng thử lại sau.',
                        confirmButtonText: 'Đóng',
                    }).then(r => item);
                    return item;
                }

                if (item.productQuantity === 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Hết hàng',
                        text: `Sản phẩm ${itemName} hiện không còn trong kho.`,
                        confirmButtonText: 'Đóng',
                    });
                    return { ...item, quantity: 1 };
                }

                if (validatedQuantity < 1) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Số lượng không hợp lệ',
                        text: 'Số lượng tối thiểu là 1.',
                        confirmButtonText: 'Đóng',
                    });
                    return { ...item, quantity: 1 };
                }

                if (validatedQuantity > item.productQuantity) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Vượt quá số lượng',
                        text: `Chỉ còn ${item.productQuantity} ${itemName} trong kho.`,
                        confirmButtonText: 'Đóng',
                    });
                    return { ...item, quantity: item.productQuantity };
                }

                return { ...item, quantity: validatedQuantity };
            })
        );
    };

    const handleSelectChange = (key, isSelected) => {
        const updatedSelectedItems = {
            ...selectedItems,
            [key]: isSelected,
        };
        setSelectedItems(updatedSelectedItems);

        const allSelected = cartItems.every((item) => {
            const itemKey = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
            return updatedSelectedItems[itemKey];
        });
        setSelectAll(allSelected);
    };

    const handleSelectAllChange = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        const updatedSelectedItems = {};
        cartItems.forEach((item) => {
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
            maximumFractionDigits: 0,
        })
            .format(value)
            .replace(/\s?₫/g, ' VND');
    };

    const handleProceedToCheckout = () => {
        const selectedCartItems = cartItems.filter((item) => {
            const key = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
            return selectedItems[key];
        });

        if (selectedCartItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa chọn sản phẩm',
                text: 'Vui lòng chọn ít nhất một sản phẩm để tiến hành thanh toán.',
                confirmButtonText: 'OK',
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
                const priceToUse = item.productDiscountPrice && item.productDiscountPrice > 0
                    ? item.productDiscountPrice
                    : item.productPrice || 0;
                return [{
                    productVariantId: item.product_variant_id,
                    quantity: item.quantity,
                    productName: item.productName,
                    productPrice: priceToUse,
                    productImageUrl: item.productImageUrl,
                    productStatus: item.productStatus,
                    buildId: null,
                    buildName: null,
                    nameVariants: item.nameVariants || null,
                    ...(item.productDiscountPrice && item.productDiscountPrice > 0 && { productDiscountPrice: item.productDiscountPrice })
                }];
            }
        });

        console.log("📤 Dữ liệu truyền sang GroupOrder:", JSON.stringify(checkoutItems, null, 2));
        navigate('/orders', { state: { cartItems: checkoutItems } });
    };

    const renderEmptyCart = () => {
        return (
            <div className="flex flex-col items-center justify-center py-10">
                <div className="mb-6">
                    <FaShoppingCart size={200} className="text-blue-600"/>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Giỏ hàng trống</h2>
                <p className="text-gray-500 mb-6">Không có sản phẩm nào trong giỏ hàng</p>
                <Link to="/products">
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                        Đi mua hàng
                    </button>
                </Link>
            </div>
        );
    };

    // Check if user is redirected due to missing userId
    if (!userId && !loading) {
        return null; // Don't render anything as we're redirecting to login
    }

    return (
        <div className="flex justify-center pb-20">
            <div className="container mt-4 max-w-5xl">
                <Breadcrumb />

                {loading ? (
                    <div className="border p-4 mb-4">
                        <div className="text-center py-8">Đang tải...</div>
                    </div>
                ) : error ? (
                    <div className="border p-4 mb-4">
                        <div className="text-center py-8 text-red-500">{error}</div>
                    </div>
                ) : cartItems.length === 0 ? (
                    renderEmptyCart()
                ) : (
                    <>
                        <div className="border p-4 mb-4">
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
                                {cartItems.map((item) => {
                                    const key = item.type === 'buildPC' ? item.buildPC.buildId : item.product_variant_id;
                                    const itemName = item.type === 'buildPC' ? item.buildPC.buildName : item.productName;
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
                                                        src={
                                                            item.type === 'buildPC'
                                                                ? item.buildPC.image
                                                                : item.productImageUrl || 'https://placehold.co/50x50'
                                                        }
                                                        alt={itemName}
                                                        className="w-12 h-12 mr-4 object-cover"
                                                    />
                                                    <div>
                                                        <span>{itemName}</span>
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
                                                {formatCurrency(
                                                    item.type === 'buildPC'
                                                        ? item.buildPC.totalPrice
                                                        : (item.productDiscountPrice && item.productDiscountPrice > 0
                                                            ? item.productDiscountPrice
                                                            : item.productPrice || 0)
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center border rounded-md overflow-hidden shadow-sm">
                                                    <button
                                                        className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg font-medium disabled:opacity-50"
                                                        onClick={() => handleUpdateQuantity(key, item.quantity - 1, itemName)}
                                                        disabled={item.quantity <= 1 || item.productQuantity === null}
                                                        aria-label={`Giảm số lượng ${itemName}`}
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        className="w-12 h-8 text-center border-none focus:outline-none disabled:bg-gray-100"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === '') {
                                                                setCartItems((prev) =>
                                                                    prev.map((i) =>
                                                                        (i.type === 'buildPC' ? i.buildPC.buildId : i.product_variant_id) === key
                                                                            ? { ...i, quantity: '' }
                                                                            : i
                                                                    )
                                                                );
                                                            } else {
                                                                handleUpdateQuantity(key, Number(value), itemName);
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            if (item.quantity === '' || item.quantity < 1 || isNaN(item.quantity)) {
                                                                handleUpdateQuantity(key, 1, itemName);
                                                            }
                                                        }}
                                                        min="1"
                                                        max={item.type === 'buildPC' ? undefined : item.productQuantity}
                                                        disabled={item.productQuantity === null}
                                                        aria-label={`Số lượng ${itemName}`}
                                                    />
                                                    <button
                                                        className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg font-medium disabled:opacity-50"
                                                        onClick={() => handleUpdateQuantity(key, item.quantity + 1, itemName)}
                                                        disabled={
                                                            item.type === 'buildPC'
                                                                ? false
                                                                : item.productQuantity === null || item.quantity >= item.productQuantity
                                                        }
                                                        aria-label={`Tăng số lượng ${itemName}`}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                {formatCurrency(
                                                    (item.type === 'buildPC'
                                                        ? item.buildPC.totalPrice
                                                        : (item.productDiscountPrice && item.productDiscountPrice > 0
                                                            ? item.productDiscountPrice
                                                            : item.productPrice || 0)) * item.quantity
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleDeleteItemFromCart(item)}
                                                    className="text-red-600 hover:text-red-800"
                                                    aria-label={`Xóa ${itemName}`}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        />
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
                        </div>
                        <div className="flex justify-end mt-4">
                            <Link to="/products">
                                <button className="bg-gray-300 px-4 py-2 ml-3 mr-2">Tiếp tục mua hàng</button>
                            </Link>
                            <button onClick={handleProceedToCheckout} className="bg-blue-500 text-white px-6 py-2">
                                TIẾN HÀNH THANH TOÁN
                            </button>
                        </div>
                    </>
                )}
                <ToastContainer />
            </div>
        </div>
    );
};

export default CartPage;