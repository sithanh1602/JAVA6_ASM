import React, { useState, useEffect } from 'react';
import FavoriteService from '../services/FavoriteService';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Spinner } from "@nextui-org/react";
import ProductCard from '../components/products/ProductCard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const Favorite = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        const userId = localStorage.getItem('UserId');
        if (!userId) {
            Swal.fire({
                title: 'Thông báo',
                text: 'Vui lòng đăng nhập để xem danh sách yêu thích',
                icon: 'warning',
                confirmButtonText: 'Đăng nhập'
            }).then(() => {
                navigate('/login');
            });
            return;
        }

        try {
            const data = await FavoriteService.getFavoriteProducts(userId);
            setFavorites(data);
        } catch (error) {
            Swal.fire('Lỗi', 'Không thể tải danh sách yêu thích', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (productVariantId) => {
        const userId = localStorage.getItem('UserId');
        try {
            await FavoriteService.removeFromFavorites(userId, productVariantId);
            // Cập nhật lại danh sách sau khi xóa
            const updatedFavorites = favorites.filter(item => item.idVariants !== productVariantId);
            setFavorites(updatedFavorites);
            
            Swal.fire({
                icon: 'success',
                title: 'Đã xóa khỏi danh sách yêu thích',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire('Lỗi', 'Không thể xóa sản phẩm', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Danh sách yêu thích</h1>
            {favorites.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Chưa có sản phẩm nào trong danh sách yêu thích</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favorites.map((item, index) => (
                        <div key={item.idVariants} className="relative">
                            <button
                                onClick={() => handleRemoveFavorite(item.idVariants)}
                                className="absolute right-2 top-2 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <ProductCard 
                                variant={{
                                    id: item.idVariants,
                                    productId: item.productId,
                                    nameVariants: item.name,
                                    image: item.imageUrl,
                                    price: item.price,
                                    quantity: item.stock,
                                    description: item.description,
                                    status: item.status,
                                    attributes: item.attributes
                                }}
                                index={index}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorite;