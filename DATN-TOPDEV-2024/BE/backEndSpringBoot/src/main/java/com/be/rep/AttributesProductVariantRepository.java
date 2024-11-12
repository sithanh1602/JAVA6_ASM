package com.be.rep;

import com.be.entity.AttributesProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttributesProductVariantRepository extends JpaRepository<AttributesProductVariant, Integer> {
    List<AttributesProductVariant> findByProductVariantId(int productVariantId);

}
