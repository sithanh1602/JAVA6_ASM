import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const RecommendedVariants = () => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = Cookies.get("token"); // 🔹 Lấy token từ cookie

        if (!token) {
            setError("Bạn chưa đăng nhập!");
            setLoading(false);
            return;
        }

        // 🔹 Decode token để lấy userId
        const decodeToken = (token) => {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                return payload.userId; // 🔹 Lấy userId từ token
            } catch (error) {
                console.error("Lỗi khi decode token:", error);
                return null;
            }
        };

        const userId = decodeToken(token);
        if (!userId) {
            setError("Không thể lấy userId từ token!");
            setLoading(false);
            return;
        }

        // Gọi API Spring Boot
        axios.get(`http://localhost:8080/api/recommendations/variants/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                setVariants(response.data);
                setLoading(false);
            })
            .catch((error) => {
                setError("Không thể lấy dữ liệu gợi ý.");
                setLoading(false);
                console.error("Lỗi API:", error);
            });
    }, []);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h2>🔹 Sản phẩm gợi ý</h2>
            <ul>
                {variants.map((variant) => (
                    <li key={variant.variantId}>
                        {variant.variantName} - {variant.price} VNĐ
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecommendedVariants;
