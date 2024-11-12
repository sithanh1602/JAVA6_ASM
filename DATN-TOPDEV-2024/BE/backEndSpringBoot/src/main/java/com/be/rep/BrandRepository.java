package com.be.rep;

import com.be.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    // Các phương thức truy vấn tuỳ chỉnh nếu cần
}
