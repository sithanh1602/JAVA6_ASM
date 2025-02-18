package com.be.rep;


import com.be.entity.Image;
import com.be.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByProductVariant_Id(Long productVariantId);

    void deleteByProductVariant(ProductVariant productVariant);

}
