package com.be.rep;

import com.be.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    // You can add custom query methods here if needed
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Integer id);
}
