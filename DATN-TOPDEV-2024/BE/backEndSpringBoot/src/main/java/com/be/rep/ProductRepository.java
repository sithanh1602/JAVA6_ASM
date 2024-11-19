package com.be.rep;


import com.be.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Additional custom query methods can be defined here
    List<Product> findByName(String name);

    // Kiểm tra xem sản phẩm có tên trùng không
    boolean existsByName(String name);

    // Kiểm tra xem có sản phẩm nào có trạng thái 'Available' không
    boolean existsByStatus(String status);
}
