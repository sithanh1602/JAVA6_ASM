package com.be.rep;

import com.be.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    // Có thể thêm các phương thức tùy chỉnh nếu cần
}
