package com.be.rep;


import com.be.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Additional custom query methods can be defined here
    List<Product> findByName(String name);

    // Kiểm tra xem sản phẩm có tên trùng không
    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    // Repository method to fetch top 3 best-selling products
    @Query("SELECT p FROM Product p ORDER BY p.purchaseCount DESC")
    List<Product> findTop3BestSellingProducts();
}