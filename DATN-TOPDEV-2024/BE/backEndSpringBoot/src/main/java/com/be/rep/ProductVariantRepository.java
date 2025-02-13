package com.be.rep;

import com.be.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    // Có thể thêm các phương thức tùy chỉnh nếu cần
    List<ProductVariant> findByNameVariantsContainingIgnoreCase(String keyword);
}
