package com.be.rep;

import com.be.entity.Category;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    // You can add custom query methods here if needed
    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Integer id);

    @Query(value = """


SELECT c.id, c.name, c.description, c.image, c.id_build
    FROM Categories c
    JOIN Products p ON c.id = p.category_id
    JOIN Product_Variants pv ON p.id = pv.product_id
    LEFT JOIN Favorites f ON pv.id = f.product_variant_id
    LEFT JOIN Reviews r ON pv.id = r.order_detail_id
    GROUP BY c.id, c.name, c.description, c.image, c.id_build
    ORDER BY COUNT(f.id) DESC, COALESCE(AVG(r.rating), 0) DESC
""", nativeQuery = true)
    List<Object[]> findTopCategories(Pageable pageable);

}
