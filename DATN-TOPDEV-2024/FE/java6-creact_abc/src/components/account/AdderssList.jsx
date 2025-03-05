import React, { useState, useEffect } from "react";
import { getAddressesForUser, deleteAddress } from "../../services/AddressService";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2"; // Thêm import Swal

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

    const userId = getUserIdFromToken();

    useEffect(() => {
        if (!userId) {
            setError("Không thể xác định userId từ token.");
            setLoading(false);
            return;
        }

        const fetchAddresses = async () => {
            try {
                const data = await getAddressesForUser(userId);
                if (Array.isArray(data)) {
                    setAddresses(data);
                } else {
                    // setError("Dữ liệu trả về không hợp lệ.");
                }
            } catch (err) {
                setError("Lỗi khi lấy địa chỉ: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [userId]);

    const handleDeleteAddressClick = async (idAddress) => {
        // Sử dụng Swal để hiển thị hộp thoại xác nhận
        const result = await Swal.fire({
            title: "Xác nhận",
            text: "Bạn có chắc chắn muốn xóa địa chỉ này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
            buttonsStyling: true,
            customClass: {
                confirmButton: "bg-red-500 text-white px-4 py-2 rounded",
                cancelButton: "bg-gray-500 text-white px-4 py-2 rounded mr-2",
            },
        });

        if (!result.isConfirmed) {
            console.log("Người dùng đã hủy xóa địa chỉ.");
            return;
        }

        try {
            await deleteAddress(idAddress);
            setAddresses((prevAddresses) =>
                prevAddresses.filter((address) => address.idAddress !== idAddress)
            );
            Swal.fire({
                title: "Thành công",
                text: "Xóa địa chỉ thành công!",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "bg-blue-500 text-white px-4 py-2 rounded",
                },
            });
        } catch (error) {
            console.error("Không thể xóa địa chỉ:", error);
            Swal.fire({
                title: "Lỗi",
                text: "Có lỗi xảy ra khi xóa địa chỉ.",
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "bg-red-500 text-white px-4 py-2 rounded",
                },
            });
        }
    };

    const columns = [
        {
            name: "",
            cell: (row, index) => index + 1,
            width: "50px",
        },
        {
            name: "Địa chỉ",
            selector: (row) => row.fullAddress,
            sortable: true,
        },
        {
            name: "Số điện thoại",
            selector: (row) => row.phone,
            sortable: true,
        },
        {
            name: "Mặc định",
            selector: (row) => (row.defaults ? "Có" : "Không"),
            sortable: true,
        },
        {
            name: "Hành động",
            cell: (row) => (
                <div className="flex gap-2 justify-center">
                    <Link to="/profile/edit-address" state={{ addressId: row.idAddress }}>
                        <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                            Sửa
                        </button>
                    </Link>
                    <button
                        onClick={() => handleDeleteAddressClick(row.idAddress)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                        Xóa
                    </button>
                </div>
            ),
        },
    ];

    const customStyles = {
        rows: {
            style: {
                fontSize: "16px",
            },
        },
        headCells: {
            style: {
                fontSize: "18px",
                fontWeight: "bold",
            },
        },
        cells: {
            style: {
                fontSize: "16px",
            },
        },
    };

    if (loading) {
        return <div className="text-center mt-4">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-4">Lỗi: {error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-center mb-6">Danh sách địa chỉ của bạn</h2>
            <div className="mb-4">
                <Link to="/profile/province-select">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Thêm địa chỉ
                    </button>
                </Link>
            </div>
            <DataTable
                columns={columns}
                data={addresses}
                customStyles={customStyles}
            />
        </div>
    );
};

export default AddressList;