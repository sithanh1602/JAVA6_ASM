package com.be.rep;

import com.be.DTO.CartDetailResponseDTO;
import com.be.entity.CartDetail;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartDetailRepository extends JpaRepository<CartDetail, Long> {

//    @Query("SELECT c FROM CartDetail c WHERE c.userId.userId = :userId AND c.product.id = :productId")
//    CartDetail findByUserIdAndProductId(Long userId, Long productId);
    // Truy vấn tất cả các chi tiết giỏ hàng của người dùng
    @Query(value = "SELECT * FROM cart_detail c WHERE c.user_id = :userId", nativeQuery = true)
    List<CartDetail> findByUserId(@Param("userId") Long userId);

    // Truy vấn chi tiết giỏ hàng của người dùng và một biến thể sản phẩm cụ thể
    @Query(value = "SELECT * FROM cart_detail cd WHERE cd.user_id = :userId AND cd.product_variant_id = :productVariantId", nativeQuery = true)
    Optional<CartDetail> findByUserIdAndProductVariantId(@Param("userId") Long userId, @Param("productVariantId") Long productVariantId);

    // Xóa chi tiết giỏ hàng của người dùng và sản phẩm biến thể
    @Transactional
    @Modifying
    @Query(value = "DELETE FROM cart_detail WHERE user_id = :userId AND product_variant_id = :productVariantId", nativeQuery = true)
    void deleteByUserIdAndproductVariantId(@Param("userId") Long userId, @Param("productVariantId") Long productVariantId);

    @Query(value = """
        SELECT
            cd.id,
            cd.user_id,
            pv.id AS product_variant_id,
            cd.quantity,
            p.name AS product_name,
            p.description AS product_description,
            pv.quantity AS product_variant_quantity,
            (
                SELECT TOP 1 img.image
                FROM images img
                WHERE img.product_variant_id = pv.id -- ✅ Lấy ảnh đầu tiên theo product_variant_id
                ORDER BY img.id ASC
            ) AS product_image,
            p.created_at AS product_created_at,
            pv.price AS product_variant_price,
            pv.status AS product_variant_status
        FROM cart_detail cd
        JOIN product_variants pv ON cd.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE cd.user_id = :userId
""", nativeQuery = true)
    List<Object[]> findCartDetailsWithProductInfo(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM CartDetail c WHERE c.userId.userId = :userId AND c.product_variant_id.id = :productVariantId")
    void deleteByUserIdAndProductId(@Param("userId") Long userId, @Param("productVariantId") Long productVariantId);
}
