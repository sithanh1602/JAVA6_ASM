package com.be.rep;

import com.be.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByName(String name);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    @Query("SELECT p FROM Product p ORDER BY p.purchaseCount DESC")
    List<Product> findTop3BestSellingProducts();

    @Query(value = """
    SELECT 
        p.name AS product_name,
        p.description AS product_description,
        pv.price AS product_price,
        pv.image AS product_image, 
        STRING_AGG(a.value, ', ') AS attributes,
        pv.id AS variant_id,
        pv.quantity AS variant_quantity
    FROM Products p
    JOIN Product_Variants pv ON p.id = pv.product_id
    JOIN Attributes_Product_Variants apv ON apv.product_variant_id = pv.id
    JOIN Attributes a ON apv.attribute_id = a.id
    WHERE p.id = :productId
    GROUP BY p.name, p.description, pv.price, pv.image, pv.id, pv.quantity
""", nativeQuery = true)
    List<Object[]> findProductById(@Param("productId") Long productId);

    @Query(value = "SELECT b.name, a.image, a.price, a.quantity, b.description, a.id AS id_Variants " +
            "FROM Product_Variants a " +
            "JOIN Products b ON a.product_id = b.id " +
            "WHERE a.product_id = :productId AND a.status = 1",
            nativeQuery = true)
    List<Object[]> getProductVariants(@Param("productId") Long productId);


}