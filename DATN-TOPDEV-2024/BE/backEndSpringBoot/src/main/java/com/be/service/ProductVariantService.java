package com.be.service;

import com.be.entity.AttributesProductVariant;
import com.be.entity.ProductVariant;
import com.be.rep.AttributesProductVariantRepository;
import com.be.rep.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductVariantService {

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private AttributesProductVariantRepository attributesProductVariantRepository;

    public List<ProductVariant> getVariantsByProductId(int productId) {
        return productVariantRepository.findByProductId(productId);
    }

    public List<Integer> getAttributeProductVariantIds(int productVariantId) {
        List<AttributesProductVariant> attributesProductVariants = attributesProductVariantRepository.findByProductVariantId(productVariantId);

        return attributesProductVariants.stream()
                .map(AttributesProductVariant::getId)
                .collect(Collectors.toList());
            }
}
