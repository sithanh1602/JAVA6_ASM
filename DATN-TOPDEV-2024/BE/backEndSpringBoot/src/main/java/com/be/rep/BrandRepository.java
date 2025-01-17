package com.be.rep;

import com.be.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    // Phương thức kiểm tra sự tồn tại của thương hiệu theo tên
    boolean existsByName(String name);
}