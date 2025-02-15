package com.be.rep;

import com.be.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {


    List<ProductVariant> findByNameVariantsContainingIgnoreCase(String keyword);

    @Query(value = """
    SELECT a.id,
           (SELECT TOP 1 b.image FROM images b WHERE a.id = b.product_variant_id ORDER BY b.id ASC) AS image,
           a.name_variants, a.price, a.product_id, a.quantity, a.status,
           c.name AS brand_name, d.name AS category_name
    FROM product_variants a
    JOIN products p ON a.product_id = p.id
    JOIN brands c ON p.brands_id = c.brands_id\s
    JOIN categories d ON p.category_id = d.id
    ORDER BY a.id DESC
""", nativeQuery = true)
    List<Object[]> findAllWithFirstImage();



}
