package com.be.rep;

import com.be.entity.ProductVariant;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {


    List<ProductVariant> findByNameVariantsContainingIgnoreCase(String keyword);

    @Query(value = """
                SELECT a.id,
                       (SELECT TOP 1 b.image FROM images b WHERE a.id = b.product_variant_id ORDER BY b.id ASC) AS image,
                       a.name_variants, a.price,a.discount_price, a.product_id, a.quantity, a.status,
                       c.name AS brand_name, d.name AS category_name
                FROM product_variants a
                JOIN products p ON a.product_id = p.id
                JOIN brands c ON p.brands_id = c.brands_id
                JOIN categories d ON p.category_id = d.id
                ORDER BY a.id DESC
            """, nativeQuery = true)
    List<Object[]> findAllWithFirstImage();

    @Query(value = """
        SELECT pv.id, pv.name_variants, pv.price, pv.quantity, pv.status,
               STRING_AGG(img.image, ',') WITHIN GROUP (ORDER BY img.id ASC) AS imageUrls,
               a.id AS attributeId, a.name AS attributeName, a.value AS attributeValue,
               pv.description, pv.discount_price, pv.discount_percentage
        FROM product_variants pv
        LEFT JOIN attributes_product_variants apv ON pv.id = apv.product_variant_id
        LEFT JOIN attributes a ON apv.attribute_id = a.id
        LEFT JOIN images img ON img.product_variant_id = pv.id
        WHERE pv.product_id = :productId
        GROUP BY pv.id, pv.name_variants, pv.price, pv.quantity, pv.status, pv.description, 
                 a.id, a.name, a.value, pv.discount_price, pv.discount_percentage
        ORDER BY pv.id ASC, a.id ASC;
        """, nativeQuery = true)
    List<Object[]> findProductVariantsByProductId(@Param("productId") Long productId);

    @Query("SELECT a.id, " +
            "(SELECT b.image FROM Image b WHERE a.id = b.productVariant.id ORDER BY b.id ASC LIMIT 1) AS image, " +
            "a.nameVariants, a.price, a.product.id, a.quantity, a.status, " +
            "c.name AS brandName " +
            "FROM ProductVariant a " +
            "JOIN a.product p " +
            "JOIN p.brand c " +
            "WHERE c.brandsId = :brandId " +
            "ORDER BY a.id DESC")
    List<Object[]> findProductVariantsWithImageByBrand(@Param("brandId") Long brandId);

    @Query("SELECT a.id, " +
            "(SELECT b.image FROM Image b WHERE a.id = b.productVariant.id ORDER BY b.id ASC LIMIT 1) AS image, " +
            "a.nameVariants, a.price, a.product.id, a.quantity, a.status, " +
            "d.name AS categoryName " +
            "FROM ProductVariant a " +
            "JOIN a.product p " +
            "JOIN p.category d " +
            "WHERE d.id = :categoryId " +
            "ORDER BY a.id DESC")
    List<Object[]> findVariantsWithImageByCategory(@Param("categoryId") Long categoryId);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.discountPrice < pv.price")
    List<ProductVariant> findByDiscountPriceLessThanOriginalPrice();

    @Query("""
                SELECT pv FROM ProductVariant pv 
                JOIN pv.product p 
                ORDER BY p.purchaseCount DESC
            """)
    List<ProductVariant> findTopBestSellingProductVariants(Pageable pageable);


    @Query("""
                SELECT pv FROM ProductVariant pv 
                JOIN pv.product p 
                ORDER BY p.createdAt DESC
            """)
    List<ProductVariant> findTopNewestProductVariants(Pageable pageable);


//    Sản phẩm nào có nhiều lượt thích hơn sẽ được ưu tiên.
//    Nếu hai sản phẩm có cùng lượt thích, sản phẩm có điểm đánh giá cao hơn sẽ được ưu tiên.
    @Query("""
    SELECT pv FROM ProductVariant pv
    LEFT JOIN Favorite f ON pv.id = f.productVariantId
    LEFT JOIN Review r ON pv.id = r.orderDetail.product_variant_id.id
    GROUP BY pv.id, pv.description, pv.discountPercentage, pv.discountPrice,
             pv.nameVariants, pv.price, pv.product.id, pv.quantity, pv.status
    ORDER BY COUNT(f.id) DESC, AVG(r.rating) DESC
""")
    List<ProductVariant> findTopRatedProductsVariants(Pageable pageable);

}
